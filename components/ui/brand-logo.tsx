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
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      LaidOff<span>Circle</span>
      <span className="brand-dot" />
    </Link>
  );
}
