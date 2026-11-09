import { settingsSections } from "@/config/settings";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function SettingsIndexPage() {
  return (
    <div className="settings-stack">
      <p className="settings-intro">Manage your account and preferences.</p>
      <nav className="settings-menu" aria-label="Settings categories">
        {settingsSections.map(({ slug, label, description, icon: Icon }) => (
          <Link
            className="settings-menu-row"
            href={`/settings/${slug}`}
            key={slug}
          >
            <span className="settings-menu-icon">
              <Icon size={21} aria-hidden="true" />
            </span>
            <span className="settings-menu-text">
              <strong>{label}</strong>
              <small>{description}</small>
            </span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </nav>
      <p className="settings-footnote">Laid off, not disconnected.</p>
    </div>
  );
}
