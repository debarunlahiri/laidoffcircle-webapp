"use client";
import MemberPosts from "@/components/profile/member-posts";
import {
  MemberPeople,
  MemberReactions,
} from "@/components/profile/member-people";
import MemberReferrals from "@/components/profile/member-referrals";
import ProfileStats, {
  sectionTitles,
  type ProfileSection,
} from "@/components/profile/profile-stats";
import type { ApiProfileStats } from "@/lib/api-types";
import { usePlatform } from "@/providers/platform-provider";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

// The activity tiles double as the tabs: picking one shows its list below.
export default function ProfileTabs({
  id,
  stats,
  own = false,
}: {
  id: string;
  stats: ApiProfileStats | null;
  own?: boolean;
}) {
  const { setComposer } = usePlatform();
  const [active, setActive] = useState<ProfileSection>("posts");
  const panel = useRef<HTMLDivElement>(null);
  function select(section: ProfileSection) {
    setActive(section);
    // Bring the list into view after it has rendered.
    requestAnimationFrame(() =>
      panel.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      }),
    );
  }
  return (
    <>
      <div className="pf-activity-heading">
        <h2>{own ? "Your community activity" : "Community activity"}</h2>
        <span>
          {own
            ? "Conversations, connections, and contributions"
            : "Get to know their community contributions"}
        </span>
      </div>
      <ProfileStats stats={stats} active={active} onSelect={select} own={own} />
      <section className="pf-activity-panel" ref={panel}>
        <div className="pf-feed-heading">
          <h2 className="profile-panel-title">{sectionTitles[active]}</h2>
          {own && active === "posts" && (
            <button
              type="button"
              className="pf-text-action"
              onClick={() => setComposer(true)}
            >
              <Plus size={15} />
              Create a post
            </button>
          )}
        </div>
        <div role="region" aria-label={sectionTitles[active]}>
          {active === "posts" && <MemberPosts id={id} own={own} />}
          {active === "referrals" && <MemberReferrals id={id} />}
          {active === "followers" && (
            <MemberPeople
              key="followers"
              path={`/users/${id}/followers`}
              emptyText="No followers yet."
            />
          )}
          {active === "following" && (
            <MemberPeople
              key="following"
              path={`/users/${id}/following`}
              emptyText="Not following anyone yet."
            />
          )}
          {active === "connections" && (
            <MemberPeople
              key="connections"
              path={`/users/${id}/connections`}
              emptyText="No connections yet."
            />
          )}
          {active === "likes" && <MemberReactions id={id} type="like" />}
          {active === "dislikes" && <MemberReactions id={id} type="dislike" />}
        </div>
      </section>
    </>
  );
}
