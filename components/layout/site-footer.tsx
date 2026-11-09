import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/support", label: "Help & support" },
  { href: "/privacy", label: "Privacy" },
  { href: "/community-guidelines", label: "Community guidelines" },
];

const desktopOrigin = (
  process.env.NEXT_PUBLIC_DESKTOP_SITE_ORIGIN ?? "https://laidoffcircle.com"
).replace(/\/$/, "");

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Site information">
        {links.map(({ href, label }) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
        {/* Sets a cookie on the main site so phones aren't sent straight back here. */}
        <a href={`${desktopOrigin}/?desktop=1`}>Desktop site</a>
      </nav>
      <p>
        © 2026 LaidOffCircle <span>Made for the way forward.</span>
      </p>
    </footer>
  );
}
