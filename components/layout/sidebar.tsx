"use client";
import BrandLogo from "@/components/ui/brand-logo";
import { navigation } from "@/config/navigation";
import { usePlatform } from "@/providers/platform-provider";
import { PanelLeftClose, PanelLeftOpen, Plus, Users } from "lucide-react";

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { section, setComposer, mobileNav, navigate, unreadMessageCount } =
    usePlatform();

  return (
    <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
      <BrandLogo href="/" />
      <div className="workspace-label">YOUR NEXT CHAPTER STARTS HERE</div>
      <nav>
        {navigation.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={section === label ? "nav-item selected" : "nav-item"}
            title={collapsed ? label : undefined}
            aria-label={collapsed ? label : undefined}
            onClick={() => navigate(label)}
          >
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
            {label === "Messages" && unreadMessageCount > 0 && (
              <span className="nav-count">{unreadMessageCount}</span>
            )}
          </button>
        ))}
      </nav>
      <button
        className="primary create-post"
        title={collapsed ? "Create a post" : undefined}
        aria-label="Create a post"
        onClick={() => setComposer(true)}
      >
        <Plus size={19} />
        Create a post
      </button>
      <div className="sidebar-community">
        <div className="little-orbit">
          <Users size={23} />
        </div>
        <h3>You’re in good company.</h3>
        <p>
          Different journeys.
          <br />A shared way forward.
        </p>
        <small>People helping people, every day.</small>
      </div>
      <button
        type="button"
        className="sidebar-toggle"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={onToggle}
      >
        {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
        <span>Collapse</span>
      </button>
    </aside>
  );
}
