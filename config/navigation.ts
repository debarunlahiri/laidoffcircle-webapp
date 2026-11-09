import {
  BarChart3,
  Bookmark,
  BriefcaseBusiness,
  Compass,
  House,
  Headset,
  MessagesSquare,
  Users,
} from "lucide-react";
export const navigation = [
  { label: "Home", icon: House },
  { label: "Explore", icon: Compass },
  { label: "My network", icon: Users },
  { label: "Referrals", icon: BriefcaseBusiness },
  { label: "Workforce insights", icon: BarChart3 },
  { label: "Messages", icon: MessagesSquare },
  { label: "Bookmarks", icon: Bookmark },
  { label: "Support", icon: Headset },
];
export const sectionPaths: Record<string, string> = {
  Home: "/",
  Profile: "/profile",
  Explore: "/explore",
  "My network": "/network",
  Referrals: "/referrals",
  "Workforce insights": "/insights",
  Messages: "/messages",
  Bookmarks: "/bookmarks",
  Notifications: "/notifications",
  More: "/more",
  Support: "/support",
  Settings: "/settings",
};
