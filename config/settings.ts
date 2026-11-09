import {
  CircleHelp,
  Lock,
  Palette,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type SettingsSection = {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

// Main settings list. Each entry opens its own page (the sub settings menu).
export const settingsSections: SettingsSection[] = [
  {
    slug: "account",
    label: "Account",
    description: "Name, username, email and sign-in methods.",
    icon: UserRound,
  },
  {
    slug: "privacy",
    label: "Privacy",
    description: "Choose who can see your profile and activity.",
    icon: Lock,
  },
  {
    slug: "appearance",
    label: "Appearance",
    description: "Light or dark mode.",
    icon: Palette,
  },
  {
    slug: "help",
    label: "Help & about",
    description: "Support, community guidelines and privacy policy.",
    icon: CircleHelp,
  },
];

export type Visibility = "everyone" | "members" | "connections" | "only_me";
export type PrivacySettings = {
  profile: Visibility;
  followers: Visibility;
  following: Visibility;
  connections: Visibility;
  likes: Visibility;
  dislikes: Visibility;
  referrals: Visibility;
  connect: "everyone" | "only_me";
};
export const defaultPrivacy: PrivacySettings = {
  profile: "everyone",
  followers: "everyone",
  following: "everyone",
  connections: "everyone",
  likes: "everyone",
  dislikes: "everyone",
  referrals: "everyone",
  connect: "everyone",
};
export const visibilityLabels: Record<Visibility, string> = {
  everyone: "Everyone",
  members: "Signed-in members",
  connections: "My connections",
  only_me: "Only me",
};
