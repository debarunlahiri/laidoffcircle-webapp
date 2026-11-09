// Google sign-in runs a helper page at https://<authDomain>/__/auth/handler.
// Setting NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN to our own domain (laidoffcircle.com)
// keeps the popup on our domain, so we forward Firebase's helper paths to the
// default Firebase host.
const firebaseHost =
  process.env.FIREBASE_AUTH_PROXY_HOST || "laidoffcircle.firebaseapp.com";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
