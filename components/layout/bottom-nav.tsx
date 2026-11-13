"use client";
import { usePlatform } from "@/providers/platform-provider";
import { useAuth, userInitials } from "@/providers/auth-provider";
import { Compass, House, Users, Menu, Plus } from "lucide-react";
import { mediaUrl } from "@/lib/api";

type TabDef = {
  label: string;
  text: string;
  Icon: typeof House;
};

const LEFT_TABS: TabDef[] = [
  { label: "Home", text: "Home", Icon: House },
  { label: "Explore", text: "Explore", Icon: Compass },
];

const RIGHT_TABS: TabDef[] = [
  { label: "My network", text: "Network", Icon: Users },
  { label: "More", text: "More", Icon: Menu },
];

function NavTab({
  label,
  text,
  Icon,
  active,
  badge,
  onClick,
  avatar,
}: TabDef & {
  active: boolean;
  badge?: number;
  onClick: () => void;
  avatar?: { src?: string | null; initials: string } | null;
}) {
  return (
    <button
      type="button"
      className={active ? "selected" : ""}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      style={{ position: "relative" }}
    >
      <span className="nav-icon-wrap">
        {/* More tab: show avatar when logged in */}
        {label === "More" && avatar ? (
          <span className="nav-avatar" aria-hidden="true">
            {avatar.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  avatar.src.startsWith("/uploads/")
                    ? mediaUrl(avatar.src)
                    : avatar.src
                }
                alt=""
                referrerPolicy="no-referrer"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            ) : (
              avatar.initials
            )}
          </span>
        ) : (
          <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
        )}
        {badge != null && badge > 0 && (
          <i className="bottom-nav-count" aria-label={`${badge} unread`}>
            {badge > 9 ? "9+" : badge}
          </i>
        )}
      </span>
      <span>{text}</span>
    </button>
  );
}

export default function BottomNav() {
  const { section, navigate, setComposer, unreadMessageCount, currentUser } =
    usePlatform();
  const { user } = useAuth();

  const avatar = user
    ? { src: user.profileImageUrl, initials: userInitials(user.name) }
    : null;

  function handleCreate() {
    if (!currentUser) {
      window.location.assign(
        `/login?next=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    setComposer(true);
  }

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {LEFT_TABS.map((t) => (
        <NavTab
          key={t.label}
          {...t}
          active={section === t.label}
          onClick={() => navigate(t.label, "bottom-nav")}
        />
      ))}

      <button
        type="button"
        className="bottom-nav-create"
        aria-label="Create a post"
        onClick={handleCreate}
      >
        <span className="bottom-nav-fab">
          <Plus size={22} strokeWidth={2.5} />
        </span>
        <span>Post</span>
      </button>

      {RIGHT_TABS.map((t) => (
        <NavTab
          key={t.label}
          {...t}
          active={section === t.label}
          badge={t.label === "More" ? unreadMessageCount : undefined}
          onClick={() => navigate(t.label, "bottom-nav")}
          avatar={t.label === "More" ? avatar : null}
        />
      ))}
    </nav>
  );
}
