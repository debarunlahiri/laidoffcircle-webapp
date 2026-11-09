import ThemeScript from "@/components/ui/theme-script";
import SwRegister from "@/components/ui/sw-register";
import NavigationHistory from "@/components/layout/navigation-history";
import { AuthProvider } from "@/providers/auth-provider";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LaidOffCircle — Laid off, not disconnected.",
  applicationName: "LaidOffCircle",
  description:
    "A place to find your people, share your story, and build your next chapter.",
  keywords: [
    "layoff",
    "job search",
    "professional community",
    "referrals",
    "networking",
  ],
  authors: [{ name: "LaidOffCircle" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "LaidOffCircle",
    statusBarStyle: "black-translucent",
    startupImage: [
      { url: "/icons/icon-512.svg", media: "(device-width: 390px)" },
    ],
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "LaidOffCircle",
    title: "LaidOffCircle — Laid off, not disconnected.",
    description:
      "A place to find your people, share your story, and build your next chapter.",
  },
  twitter: {
    card: "summary",
    title: "LaidOffCircle",
    description: "Laid off, not disconnected.",
  },
  icons: {
    icon: [
      { url: "/icons/icon-72.svg", sizes: "72x72", type: "image/svg+xml" },
      { url: "/icons/icon-96.svg", sizes: "96x96", type: "image/svg+xml" },
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-152.svg", sizes: "152x152", type: "image/svg+xml" },
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    shortcut: "/icons/icon-96.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // Draw under notches, camera cut-outs and the fold; CSS pads with env(safe-area-*).
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3366ff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a2a5a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        {/* iOS splash / PWA splash hint */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="mask-icon" href="/icons/icon-512.svg" color="#3366ff" />
      </head>
      <body>
        <NavigationHistory />
        <AuthProvider>{children}</AuthProvider>
        <SwRegister />
      </body>
    </html>
  );
}
