import type { ApiProfileStats } from "@/lib/api-types";
import PillTabs from "@/components/ui/pill-tabs";
import {
  BriefcaseBusiness,
  FileText,
  Handshake,
  UserPlus,
  ThumbsDown,
  ThumbsUp,
  Users,
  type LucideIcon,
} from "lucide-react";

export type ProfileSection =
  | "posts"
  | "likes"
  | "dislikes"
  | "referrals"
  | "followers"
  | "following"
  | "connections";

export const sectionTitles: Record<ProfileSection, string> = {
  posts: "Posts",
  likes: "Likes received",
  dislikes: "Dislikes received",
  referrals: "Referrals",
  followers: "Followers",
  following: "Following",
  connections: "Connections",
};

// Public activity totals for a member (anonymous posts are never counted).
// Each button opens its list below. Who liked or disliked is private to the member.
export default function ProfileStats({
  stats,
  active,
  onSelect,
  own,
}: {
  stats: ApiProfileStats | null;
  active: ProfileSection;
  onSelect: (section: ProfileSection) => void;
  own: boolean;
}) {
  const items: {
    key: ProfileSection;
    value: number | null | undefined;
    icon: LucideIcon;
    private?: boolean;
  }[] = [
    { key: "posts", value: stats?.posts, icon: FileText },
    {
      key: "likes",
      value: stats?.likesReceived,
      icon: ThumbsUp,
      private: true,
    },
    {
      key: "dislikes",
      value: stats?.dislikesReceived,
      icon: ThumbsDown,
      private: true,
    },
    { key: "referrals", value: stats?.referrals, icon: BriefcaseBusiness },
    { key: "followers", value: stats?.followers, icon: Users },
    { key: "following", value: stats?.following, icon: UserPlus },
    { key: "connections", value: stats?.connections, icon: Handshake },
  ];
  return (
    <PillTabs
      label="Community activity"
      items={items.map(({ key, value, icon: Icon, private: isPrivate }) => ({
        key,
        label: `${sectionTitles[key]} (${value === undefined ? "—" : value === null ? "Private" : value.toLocaleString()})`,
        icon: <Icon size={16} aria-hidden="true" />,
        disabled: Boolean((isPrivate && !own) || value === null),
      }))}
      active={active}
      onChange={onSelect}
    />
  );
}
