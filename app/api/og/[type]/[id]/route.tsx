import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  loadShare,
  siteName,
  siteTagline,
  type ShareCard,
} from "@/lib/share-metadata";

export const runtime = "nodejs";

const size = { width: 1200, height: 630 };

let logo: Promise<string> | undefined;
function logoSrc() {
  logo ??= readFile(join(process.cwd(), "public/brand/logo-512.png")).then(
    (file) => `data:image/png;base64,${file.toString("base64")}`,
  );
  return logo;
}

const siteCard: ShareCard = {
  kind: "post",
  id: "home",
  title: siteName,
  description: "",
  eyebrow: "Community",
  headline: siteTagline,
  byline: "Find your people, share your story, and build your next chapter.",
  detail: "",
  tags: [],
};

function fontSize(card: ShareCard) {
  const length = card.headline.length;
  if (card.kind === "profile") return length > 28 ? 72 : 88;
  if (card.kind === "referral") return length > 50 ? 56 : 68;
  return length > 150 ? 42 : length > 80 ? 50 : 60;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await context.params;
  const loaded = type === "site" ? siteCard : await loadShare(type, id);
  const card = loaded ?? siteCard;
  const logoUrl = await logoSrc();

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 72px",
          color: "#ffffff",
          background: "linear-gradient(135deg, #0b1646 0%, #1d3fb8 55%, #3366ff 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} width={56} height={56} alt="" />
            <div style={{ display: "flex", fontSize: 32, fontWeight: 700, marginLeft: 16 }}>
              {siteName}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              padding: "8px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.16)",
            }}
          >
            {card.eyebrow}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: fontSize(card),
            fontWeight: 700,
            lineHeight: 1.18,
          }}
        >
          {card.headline}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {card.byline ? (
            <div style={{ display: "flex", fontSize: 34, fontWeight: 600 }}>
              {card.byline}
            </div>
          ) : null}
          {card.detail ? (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                marginTop: 8,
                color: "rgba(255,255,255,0.78)",
              }}
            >
              {card.detail}
            </div>
          ) : null}
          {card.tags.length ? (
            <div style={{ display: "flex", marginTop: 20 }}>
              {card.tags.slice(0, 4).map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    fontSize: 22,
                    padding: "6px 18px",
                    marginRight: 12,
                    borderRadius: 999,
                    border: "2px solid rgba(255,255,255,0.55)",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    ),
    size,
  );

  // Crawlers re-fetch rarely; a short shared cache keeps edits visible soon.
  image.headers.set(
    "Cache-Control",
    loaded || type === "site"
      ? "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
      : "public, max-age=60, s-maxage=300",
  );
  return image;
}
