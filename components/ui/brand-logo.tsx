import Link from "next/link";

// The single LaidOffCircle logo, used in the sidebar and on the sign-in pages.
export default function BrandLogo({ href = "/" }: { href?: string }) {
  return (
    <Link
      className="brand"
      href={href}
      aria-label="LaidOffCircle home"
      title="LaidOffCircle"
    >
      <svg
        className="brand-mark"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="15" fill="#3159df" />
        <g stroke="#fff" strokeWidth="4.5">
          <circle cx="24" cy="26" r="12" />
          <circle cx="40" cy="26" r="12" />
          <circle cx="32" cy="40" r="12" fill="#3159df" />
        </g>
      </svg>
      LaidOff<span>Circle</span>
      <span className="brand-dot" />
    </Link>
  );
}
