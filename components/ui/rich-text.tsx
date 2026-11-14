"use client";
import Link from "next/link";
import Markdown, { defaultUrlTransform } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkHashtags from "@/lib/remark-hashtags";

// Text pasted from chat tools and docs often carries things we don't want to show.
function tidy(text: string) {
  return (
    text
      // Source badges pasted as [image](https://www.google.com/s2/favicons?…)
      // become real (tiny) images; see `faviconSrc` for what may render.
      .replace(/\[image\]\((https?:\/\/[^)\s]*favicons[^)]*)\)/gi, "![]($1)")
      // ...and a source icon belongs on the same line as its label ("Naukri+1").
      .replace(
        /(!\[\]\([^)\s]*favicons[^)]*\))[ \t]*\n(?:[ \t]*(?:&#x20;)?[ \t]*\n)+[ \t]*([A-Za-z0-9][\w .&-]{0,30}\+\d{1,2})[ \t]*$/gm,
        "$1 $2",
      )
      // Empty-looking paragraphs that only hold stray character references.
      .replace(/^(?:\s*&#x20;\s*)+$/gm, "")
      .replace(/\r\n?/g, "\n")
  );
}

const faviconBase = "https://www.google.com/s2/favicons";
// Only site favicons are ever embedded; every other image is dropped.
const isFavicon = (src: unknown) =>
  typeof src === "string" && src.startsWith(`${faviconBase}?`);
const faviconFor = (href: string) => {
  try {
    return `${faviconBase}?domain=${new URL(href).hostname}&sz=32`;
  } catch {
    return null;
  }
};

function Favicon({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="rt-favicon"
      src={src}
      alt=""
      width={16}
      height={16}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

// Tracking parameters added by assistants / newsletters add nothing for readers.
function cleanHref(href: string) {
  try {
    const url = new URL(href);
    for (const key of [...url.searchParams.keys()])
      if (/^utm_/i.test(key)) url.searchParams.delete(key);
    return url.toString();
  } catch {
    return href;
  }
}

/**
 * Renders post / referral text: GitHub-flavoured Markdown (tables, task lists,
 * strikethrough, autolinks), line breaks, #hashtag links, safe external links.
 * Images are never embedded. `clamped` renders links as plain text so a
 * preview card stays one clean tap target.
 */
export default function RichText({
  text,
  clamped = false,
}: {
  text: string;
  clamped?: boolean;
}) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkBreaks, remarkHashtags]}
      allowElement={(element) =>
        (element.tagName !== "img" || isFavicon(element.properties.src)) &&
        (!clamped ||
          element.tagName !== "a" ||
          element.properties.className?.includes("post-hashtag") === true ||
          element.properties.className?.includes("post-mention") === true)
      }
      urlTransform={(url, key, node) =>
        key === "src" && node.tagName === "img"
          ? isFavicon(url)
            ? url
            : ""
          : defaultUrlTransform(url)
      }
      components={{
        img: ({ src }) =>
          typeof src === "string" ? <Favicon src={src} /> : null,
        a: ({ href, className, children, title }) =>
          href &&
          (className === "post-hashtag" || className === "post-mention") ? (
            <Link
              className={className}
              href={href}
              prefetch={false}
              tabIndex={clamped ? -1 : undefined}
            >
              {children}
            </Link>
          ) : (
            <a
              href={href ? cleanHref(href) : href}
              className={className}
              title={title}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
            >
              {!clamped && href && faviconFor(href) && (
                <Favicon src={faviconFor(href)!} />
              )}
              {children}
            </a>
          ),
        table: ({ children }) => (
          <div className="rt-table-wrap" tabIndex={0}>
            <table>{children}</table>
          </div>
        ),
      }}
      unwrapDisallowed
    >
      {tidy(text)}
    </Markdown>
  );
}
