import { NextResponse, type NextRequest } from "next/server";

// Sends desktops and tablets to the main site (laidoffcircle.com) in
// production. Phones stay here. Visitors can opt out with ?mobile=1, which is
// remembered for 30 days in the `view` cookie.
//
// DESKTOP_SITE_ORIGIN overrides the target. DESKTOP_REDIRECT=off disables it.
// On by default in development too, pointing at http://localhost:3000.
const desktopOrigin = (
  process.env.DESKTOP_SITE_ORIGIN ??
  process.env.NEXT_PUBLIC_DESKTOP_SITE_ORIGIN ??
  (process.env.NODE_ENV === "production"
    ? "https://laidoffcircle.com"
    : "http://localhost:3000")
).replace(/\/$/, "");

// Keep in sync with the phone detection in the desktop app's proxy.ts.
const phone =
  /iPhone|iPod|Android.+Mobile|Windows Phone|IEMobile|BlackBerry|BB10|Opera Mini|Opera Mobi|webOS|Mobile Safari|SamsungBrowser.+Mobile|\bSM-F\d|Pixel Fold|Surface Duo/i;
const bot = /bot|crawler|spider|crawling|facebookexternalhit|preview|slurp/i;

function isEnabled() {
  return process.env.DESKTOP_REDIRECT !== "off";
}

function isPhone(request: NextRequest) {
  const agent = request.headers.get("user-agent") ?? "";
  if (/iPad|Tablet/i.test(agent)) return false;
  if (request.headers.get("sec-ch-ua-mobile") === "?1") return true;
  return phone.test(agent);
}

export function proxy(request: NextRequest) {
  const { nextUrl } = request;

  if (nextUrl.searchParams.get("mobile") === "1") {
    const clean = nextUrl.clone();
    clean.searchParams.delete("mobile");
    const response = NextResponse.redirect(clean);
    response.cookies.set("view", "mobile", {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  const response = NextResponse.next();
  response.headers.append("Vary", "User-Agent, Sec-CH-UA-Mobile");
  response.headers.set("Accept-CH", "Sec-CH-UA-Mobile");

  if (!isEnabled()) return response;
  if (request.cookies.get("view")?.value === "mobile") return response;
  const agent = request.headers.get("user-agent") ?? "";
  if (bot.test(agent) || isPhone(request)) return response;

  const target = new URL(`${nextUrl.pathname}${nextUrl.search}`, desktopOrigin);
  const redirect = NextResponse.redirect(target, 307);
  redirect.headers.set("Vary", "User-Agent, Sec-CH-UA-Mobile");
  redirect.headers.set("Cache-Control", "private, no-store");
  return redirect;
}

export const config = {
  // Pages only: API routes, Next internals, Firebase auth helpers, the service
  // worker, manifest and other static files are never redirected.
  matcher: [
    "/((?!api|_next|__|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
