// Google sign-in runs a helper page at https://<authDomain>/__/auth/handler.
// Setting NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN to our own domain (laidoffcircle.com)
// keeps the popup on our domain, so we forward Firebase's helper paths to the
// default Firebase host.
const firebaseHost =
  process.env.FIREBASE_AUTH_PROXY_HOST || "laidoffcircle.firebaseapp.com";

// Sign-in screens and member-only areas must never be indexed.
const noindexPaths = [
  "login",
  "register",
  "verify-email",
  "search",
  "offline",
  "messages",
  "notifications",
  "bookmarks",
  "profile",
  "settings",
  "support",
  "admin",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      ...noindexPaths.map((path) => ({
        source: `/${path}/:rest*`,
        headers: noindex,
      })),
      { source: "/referrals/new", headers: noindex },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: `https://${firebaseHost}/__/auth/:path*`,
      },
      {
        source: "/__/firebase/:path*",
        destination: `https://${firebaseHost}/__/firebase/:path*`,
      },
    ];
  },
};

export default nextConfig;
