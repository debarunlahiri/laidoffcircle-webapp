import { SettingsGroup } from "@/components/settings/settings-row";
import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  HeartHandshake,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const resources = [
  {
    href: "/support",
    title: "Help & support",
    description: "Ask a question, report an issue or check your requests.",
    icon: LifeBuoy,
  },
  {
    href: "/community-guidelines",
    title: "Community guidelines",
    description: "How we keep this a respectful, helpful space.",
    icon: HeartHandshake,
  },
  {
    href: "/privacy",
    title: "Privacy policy",
    description: "Understand how your information is used and protected.",
    icon: ShieldCheck,
  },
  {
    href: "/about",
    title: "About LaidOffCircle",
    description: "Our story, our purpose and the community we’re building.",
    icon: BookOpen,
  },
];

export default function HelpSettings() {
  return (
    <div className="settings-stack">
      <header className="settings-page-heading">
        <p>Find answers, get support and learn more about your community.</p>
      </header>
      <SettingsGroup
        icon={CircleHelp}
        title="Support & resources"
        description="Everything you need to feel at home here."
      >
        <ul className="settings-links">
          {resources.map(({ href, title, description, icon: Icon }) => (
            <li key={href}>
              <Link href={href}>
                <span className="settings-resource-icon">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span className="settings-resource-text">
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </SettingsGroup>
      <p className="settings-footnote">Laid off, not disconnected.</p>
    </div>
  );
}
