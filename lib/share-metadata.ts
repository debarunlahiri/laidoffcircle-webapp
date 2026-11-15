import * as React from "react";
import type { Metadata } from "next";
import type { ApiPost, ApiProfile, ApiReferral } from "@/lib/api-types";

// Link previews (WhatsApp, iMessage, Slack, LinkedIn, X ...) are built by
// crawlers that never sign in and never run JavaScript. Everything here runs on
// the server and only uses the backend's public, unauthenticated reads, so a
// shared link carries real content instead of the generic site description.

export const siteName = "LaidOffCircle";
export const siteTagline = "Laid off, not disconnected.";
const siteBlurb =
  "A place to find your people, share your story, and build your next chapter.";

export type ShareKind = "post" | "profile" | "referral";

export type ShareCard = {
  kind: ShareKind;
  id: string;
  // Canonical path on the main site, e.g. /users/priya.
  path: string;
  // False for anything search engines should not list (anonymous, private, closed).
  indexable: boolean;
  // Plain text that matches what visitors read on the page, for crawlers.
  body: string;
  facts: string[];
  published?: string;
  modified?: string;
  jsonLd?: Record<string, unknown>;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  byline: string;
  detail: string;
  tags: string[];
  // Attached post photo, used as the preview image when there is one.
  photo?: string;
};

export function siteOrigin() {
  const fallback =
    process.env.NODE_ENV === "production"
      ? "https://laidoffcircle.com"
      : "http://localhost:3000";
  return (
    process.env.AUTH_APP_ORIGIN ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    fallback
  ).replace(/\/$/, "");
}

/** The desktop site. Search engines should index this host, not the mobile one. */
export function canonicalOrigin() {
  return (
    process.env.CANONICAL_ORIGIN ??
    (process.env.NODE_ENV === "production"
      ? "https://laidoffcircle.com"
      : siteOrigin())
  ).replace(/\/$/, "");
}

const isMobileSite = () => siteOrigin() !== canonicalOrigin();
const mobileOrigin = () =>
  (process.env.MOBILE_SITE_ORIGIN ?? "https://m.laidoffcircle.com").replace(
    /\/$/,
    "",
  );
const canonicalUrl = (path: string) => `${canonicalOrigin()}${path}`;

function iso(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

const webUrl = (value?: string | null) =>
  value && /^https?:\/\//i.test(value) ? value : undefined;

// React's per-request cache, so the page and its metadata share one fetch.
const memo = <T,>(fn: T): T =>
  (React as unknown as { cache?: <F>(f: F) => F }).cache?.(fn) ?? fn;

const backendBase = () =>
  (process.env.BACKEND_API_URL ?? "http://127.0.0.1:9090/api/v1").replace(
    /\/$/,
    "",
  );

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${backendBase()}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

async function getOk(path: string) {
  try {
    const response = await fetch(`${backendBase()}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Strips markdown, collapses whitespace and cuts at a word boundary. */
export function clip(text: string | null | undefined, max: number) {
  const plain = (text ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_~`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:!-]+$/, "")}…`;
}

function mediaAbsolute(path: string | null | undefined) {
  const file = path?.split("/").pop();
  // The media route only serves generated .webp uploads.
  return file && /^[0-9a-f-]{36}\.webp$/.test(file)
    ? `${siteOrigin()}/api/media/${file}`
    : undefined;
}

const uuid = /^[0-9a-f-]{36}$/i;
const handle = /^[a-zA-Z0-9_-]{1,64}$/;
const labels = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site" };
const levels = { entry: "Entry", mid: "Mid", senior: "Senior", lead: "Lead" };

async function loadPost(id: string): Promise<ShareCard | null> {
  if (!uuid.test(id)) return null;
  const post = await getJson<ApiPost>(`/posts/${id}`);
  if (!post?.text) return null;
  // The API already masks the author of anonymous posts. Those, and posts
  // whose author hides their profile, are shareable but never indexed.
  const name = post.name || "A member";
  const anonymous = Boolean(post.anonymous);
  let indexable = !anonymous && Boolean(post.authorId);
  if (indexable) {
    const author = await getJson<ApiProfile>(`/users/${post.authorId}`);
    indexable = Boolean(author && !author.restricted);
  }
  const path = `/posts/${id}`;
  const slug = post.username || post.authorId;
  const photo = mediaAbsolute(post.images?.[0] ?? post.image);
  const body = clip(post.text, 5000);
  const published = iso(post.createdAt);
  const modified = iso(post.editedAt) ?? published;
  const likes = Number(post.likes ?? 0);
  const comments = Number(post.comments ?? 0);
  const origin = canonicalOrigin();
  return {
    kind: "post",
    id,
    path,
    indexable,
    body,
    facts: [post.topic, post.company].filter(Boolean) as string[],
    published,
    modified,
    jsonLd: indexable
      ? {
          "@context": "https://schema.org",
          "@type": "DiscussionForumPosting",
          "@id": `${canonicalUrl(path)}#post`,
          url: canonicalUrl(path),
          mainEntityOfPage: canonicalUrl(path),
          headline: clip(post.text, 110),
          articleBody: body,
          datePublished: published,
          dateModified: modified,
          inLanguage: "en",
          keywords: post.topic || undefined,
          image: photo,
          author: {
            "@type": "Person",
            name,
            url: slug ? canonicalUrl(`/users/${slug}`) : undefined,
          },
          publisher: { "@id": `${origin}/#organization` },
          isPartOf: { "@id": `${origin}/#website` },
          commentCount: comments,
          interactionStatistic: [
            {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/LikeAction",
              userInteractionCount: likes,
            },
            {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/CommentAction",
              userInteractionCount: comments,
            },
          ],
        }
      : undefined,
    title: `${name} on ${siteName}`,
    description: clip(post.text, 200),
    eyebrow: post.topic || "Community post",
    headline: clip(post.text, 210),
    byline: [name, post.role].filter(Boolean).join(" · "),
    detail: post.company ?? "",
    tags: post.openToWork ? ["Open to work"] : [],
    photo,
  };
}

async function loadProfile(id: string): Promise<ShareCard | null> {
  if (!handle.test(id)) return null;
  const profile = await getJson<ApiProfile>(`/users/${id}`);
  if (!profile?.name) return null;
  const path = `/users/${profile.username || profile.id || id}`;
  // A restricted profile only exposes a name, so nothing else is revealed.
  if (profile.restricted)
    return {
      kind: "profile",
      id,
      path,
      indexable: false,
      body: "",
      facts: [],
      title: `${profile.name} on ${siteName}`,
      description: `See ${profile.name} on ${siteName}. ${siteTagline}`,
      eyebrow: "Member profile",
      headline: profile.name,
      byline: `Member of ${siteName}`,
      detail: "",
      tags: [],
    };
  const skills = Array.isArray(profile.skills)
    ? profile.skills.slice(0, 4)
    : [];
  const summary = clip(profile.about, 200);
  const origin = canonicalOrigin();
  const photo = mediaAbsolute(profile.profileImageUrl);
  return {
    kind: "profile",
    id,
    path,
    indexable: true,
    body: clip(profile.about, 3000),
    facts: [
      profile.role,
      profile.location,
      ...(Array.isArray(profile.skills) ? profile.skills : []),
    ].filter(Boolean) as string[],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      url: canonicalUrl(path),
      isPartOf: { "@id": `${origin}/#website` },
      mainEntity: {
        "@type": "Person",
        "@id": `${canonicalUrl(path)}#person`,
        name: profile.name,
        alternateName: profile.username || undefined,
        url: canonicalUrl(path),
        jobTitle: profile.role || undefined,
        description: summary || undefined,
        image: photo,
        homeLocation: profile.location
          ? { "@type": "Place", name: profile.location }
          : undefined,
        knowsAbout: Array.isArray(profile.skills) ? profile.skills : undefined,
        sameAs: [
          webUrl(profile.websiteUrl),
          webUrl(profile.linkedinProfileUrl),
        ].filter(Boolean),
      },
    },
    title: `${profile.name}${profile.role ? ` · ${profile.role}` : ""} on ${siteName}`,
    description:
      summary ||
      [profile.role, profile.location].filter(Boolean).join(" · ") ||
      siteBlurb,
    eyebrow: "Member profile",
    headline: profile.name,
    byline: profile.role ?? "",
    detail: profile.location ?? "",
    tags: [...(profile.openToWork ? ["Open to work"] : []), ...skills],
  };
}

async function loadReferral(id: string): Promise<ShareCard | null> {
  if (!uuid.test(id)) return null;
  const rows = await getJson<ApiReferral[]>(`/referrals?id=${id}&limit=1`);
  const item = Array.isArray(rows) ? rows[0] : null;
  if (!item?.title) return null;
  const mode = item.workMode ? labels[item.workMode] : "";
  const where = [item.location, mode].filter(Boolean).join(" · ");
  const skills = (item.skills ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 3);
  const path = `/referrals/${id}`;
  // Listed only while open, and only if the author shows their profile and
  // referrals to everyone (the API answers 403 for a signed-out visitor).
  const open = item.status !== "closed";
  const indexable =
    open &&
    (await getOk(`/referrals?authorId=${item.authorId}&limit=1`));
  const published = iso(item.createdAt);
  const description = clip(
    `${item.person} offers an employee referral for ${item.title} at ${item.company}${where ? ` (${where})` : ""}. ${item.description ?? ""} Skills: ${item.skills ?? ""}`,
    5000,
  );
  return {
    kind: "referral",
    id,
    path,
    indexable,
    body: description,
    facts: [item.company, where, item.skills].filter(Boolean) as string[],
    published,
    jsonLd:
      indexable && published
        ? {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "@id": `${canonicalUrl(path)}#job`,
            url: canonicalUrl(path),
            title: item.title,
            description,
            datePosted: published,
            directApply: false,
            hiringOrganization: {
              "@type": "Organization",
              name: item.company,
              sameAs: webUrl(item.companyLink),
            },
            jobLocation:
              item.workMode === "remote"
                ? undefined
                : {
                    "@type": "Place",
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: item.location,
                    },
                  },
            jobLocationType:
              item.workMode === "remote" ? "TELECOMMUTE" : undefined,
            skills: item.skills || undefined,
            experienceRequirements: item.minExperience
              ? {
                  "@type": "OccupationalExperienceRequirements",
                  monthsOfExperience: Number(item.minExperience) * 12,
                }
              : undefined,
            identifier: {
              "@type": "PropertyValue",
              name: siteName,
              value: id,
            },
          }
        : undefined,
    title: `${item.title} at ${item.company} · Referral`,
    description: clip(
      `${item.person} can refer you for ${item.title} at ${item.company}${where ? ` (${where})` : ""}. ${item.description ?? ""}`,
      200,
    ),
    eyebrow: open ? "Referral" : "Referral · Closed",
    headline: clip(item.title, 90),
    byline: `at ${item.company}`,
    detail: [where, item.person ? `Referred by ${item.person}` : ""]
      .filter(Boolean)
      .join("  ·  "),
    tags: [
      ...(item.level ? [`${levels[item.level]} level`] : []),
      ...skills,
    ],
  };
}

export const loadShare = memo(
  (kind: string, id: string): Promise<ShareCard | null> => {
    if (kind === "post") return loadPost(id);
    if (kind === "profile") return loadProfile(id);
    if (kind === "referral") return loadReferral(id);
    return Promise.resolve(null);
  },
);

export function siteImage() {
  return `${siteOrigin()}/api/og/site/home`;
}

const indexRules: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

// Separate mobile URLs: the desktop page points at its m. twin, and the m. page
// (canonical -> desktop) is the one this tag is omitted from.
function alternatesFor(path: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: canonicalUrl(path),
    ...(isMobileSite()
      ? {}
      : {
          media: {
            "only screen and (max-width: 640px)": `${mobileOrigin()}${path}`,
          },
        }),
  };
}

export function shareMetadata(card: ShareCard): Metadata {
  const image = card.photo ?? `${siteOrigin()}/api/og/${card.kind}/${card.id}`;
  const images = [
    card.photo
      ? { url: image, alt: card.title }
      : { url: image, width: 1200, height: 630, alt: card.title },
  ];
  const common = {
    siteName,
    locale: "en_US",
    url: canonicalUrl(card.path),
    title: card.title,
    description: card.description,
    images,
  };
  return {
    title: card.title,
    description: card.description,
    alternates: alternatesFor(card.path),
    robots: card.indexable ? indexRules : { index: false, follow: true },
    openGraph:
      card.kind === "post"
        ? {
            ...common,
            type: "article",
            publishedTime: card.published,
            modifiedTime: card.modified,
            section: card.eyebrow,
          }
        : { ...common, type: card.kind === "profile" ? "profile" : "website" },
    twitter: {
      card: "summary_large_image",
      title: card.title,
      description: card.description,
      images: [image],
    },
  };
}

export async function shareMetadataFor(
  kind: ShareKind,
  id: string,
): Promise<Metadata> {
  const card = await loadShare(kind, id);
  return card ? shareMetadata(card) : {};
}

/** Metadata for list and info pages that are worth indexing. */
export function pageMetadata(page: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title: page.title,
    description: page.description,
    alternates: alternatesFor(page.path),
    robots: indexRules,
    openGraph: {
      type: "website",
      siteName,
      locale: "en_US",
      url: canonicalUrl(page.path),
      title: page.title,
      description: page.description,
      images: [
        { url: siteImage(), width: 1200, height: 630, alt: siteName },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [siteImage()],
    },
  };
}

/** Organization and WebSite markup; emitted by the desktop site only. */
export function siteJsonLd(): Record<string, unknown> | null {
  if (isMobileSite()) return null;
  const origin = canonicalOrigin();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: siteName,
        url: origin,
        logo: `${origin}/brand/logo-512.png`,
        description: siteBlurb,
        email: "admin@laidoffcircle.com",
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: origin,
        name: siteName,
        description: siteBlurb,
        inLanguage: "en",
        publisher: { "@id": `${origin}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${origin}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export type SitemapData = {
  profiles: { slug: string; updatedAt: string }[];
  posts: { id: string; updatedAt: string }[];
  referrals: { id: string; updatedAt: string }[];
};

/** Indexable URLs from the backend (it applies the privacy rules). */
export async function loadSitemapData(): Promise<SitemapData> {
  return (
    (await getJson<SitemapData>("/seo/sitemap")) ?? {
      profiles: [],
      posts: [],
      referrals: [],
    }
  );
}

export { canonicalUrl, iso as isoDate };

export const siteShare = {
  title: `${siteName} — ${siteTagline}`,
  description: siteBlurb,
};
