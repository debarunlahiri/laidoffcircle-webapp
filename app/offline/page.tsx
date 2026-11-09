import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline — LaidOffCircle" };

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 32,
        textAlign: "center",
        background: "var(--surface-0, #f4f6fb)",
        color: "var(--text-1, #0d1117)",
        fontFamily: "-apple-system, system-ui, sans-serif",
      }}
    >
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="72" cy="72" r="72" fill="var(--brand-soft,#eef1ff)"/>
        <path d="M36 20C27.16 20 20 27.16 20 36s7.16 16 16 16 16-7.16 16-16S44.84 20 36 20zm1.5 24h-3v-3h3v3zm0-6h-3V24h3v14z" fill="var(--brand,#3366ff)"/>
      </svg>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>
        You're offline
      </h1>
      <p style={{ fontSize: 15, color: "var(--text-3,#6e7d94)", maxWidth: 300, margin: 0, lineHeight: 1.55 }}>
        Check your internet connection and try again.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 8,
          padding: "13px 28px",
          background: "var(--brand,#3366ff)",
          color: "#fff",
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 15,
          textDecoration: "none",
        }}
      >
        Try again
      </Link>
    </div>
  );
}
