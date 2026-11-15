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
  // The API already masks the author of anonymous posts.
  const name = post.name || "A member";
  return {
    kind: "post",
    id,
    title: `${name} on ${siteName}`,
    description: clip(post.text, 200),
    eyebrow: post.topic || "Community post",
    headline: clip(post.text, 210),
    byline: [name, post.role].filter(Boolean).join(" · "),
    detail: post.company ?? "",
    tags: post.openToWork ? ["Open to work"] : [],
    photo: mediaAbsolute(post.images?.[0] ?? post.image),
  };
}

async function loadProfile(id: string): Promise<ShareCard | null> {
  if (!handle.test(id)) return null;
  const profile = await getJson<ApiProfile>(`/users/${id}`);
  if (!profile?.name) return null;
  // A restricted profile only exposes a name, so nothing else is revealed.
  if (profile.restricted)
    return {
      kind: "profile",
      id,
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
  return {
    kind: "profile",
    id,
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
  return {
    kind: "referral",
    id,
    title: `${item.title} at ${item.company} · Referral`,
    description: clip(
      `${item.person} can refer you for ${item.title} at ${item.company}${where ? ` (${where})` : ""}. ${item.description ?? ""}`,
      200,
    ),
    eyebrow: item.status === "closed" ? "Referral · Closed" : "Referral",
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

export function loadShare(kind: string, id: string) {
  if (kind === "post") return loadPost(id);
  if (kind === "profile") return loadProfile(id);
  if (kind === "referral") return loadReferral(id);
  return Promise.resolve(null);
}

export function siteImage() {
  return `${siteOrigin()}/api/og/site/home`;
}

export function shareMetadata(card: ShareCard, path: string): Metadata {
  const image = card.photo ?? `${siteOrigin()}/api/og/${card.kind}/${card.id}`;
  const images = [
    card.photo
      ? { url: image, alt: card.title }
      : { url: image, width: 1200, height: 630, alt: card.title },
  ];
  return {
    title: card.title,
    description: card.description,
    alternates: { canonical: path },
    openGraph: {
      type: card.kind === "post" ? "article" : "website",
      siteName,
      locale: "en_US",
      url: path,
      title: card.title,
      description: card.description,
      images,
    },
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
  if (!card) return {};
  const base =
    kind === "post" ? "posts" : kind === "profile" ? "users" : "referrals";
  return shareMetadata(card, `/${base}/${id}`);
}

export const siteShare = {
  title: `${siteName} — ${siteTagline}`,
  description: siteBlurb,
};
