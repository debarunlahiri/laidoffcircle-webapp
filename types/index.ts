import type {
  ApiPoll,
  ApiQuotedPost,
  ReferralFeedback,
  ReferralField,
  ReferralLevel,
  ReferralWorkMode,
} from "@/lib/api-types";
export type Badge = "blue" | "gold";
export type Post = {
  badge?: Badge | null;
  id: string;
  poll?: ApiPoll | null;
  authorId?: string | null;
  own?: boolean;
  dislikes?: number;
  reaction?: "like" | "dislike" | null;
  saved?: boolean;
  reposted?: boolean;
  quoted?: ApiQuotedPost | null;
  name: string;
  username?: string | null;
  role: string;
  avatar: string;
  avatarUrl?: string | null;
  color: string;
  time: string;
  createdAt?: string;
  editedAt?: string | null;
  topic: string;
  company: string;
  text: string;
  image?: string;
  images?: string[];
  likes: number;
  comments: number;
  reposts: number;
  shares?: number;
  views?: number;
  following?: boolean;
  open?: boolean;
  note?: string;
  noteSource?: string;
  referral?: boolean;
};
export type Person = {
  badge?: Badge | null;
  id?: string;
  name: string;
  username?: string | null;
  role: string;
  initials: string;
  imageUrl?: string | null;
  coverUrl?: string | null;
  color: string;
  detail: string;
};
export type ReferralOpportunity = {
  id?: string;
  authorId?: string;
  companyId?: string;
  status?: "open" | "closed";
  requestStatus?: string | null;
  own?: boolean;
  description?: string;
  companyLink?: string | null;
  jobLink?: string | null;
  createdAt?: string;
  workMode?: ReferralWorkMode;
  level?: ReferralLevel | null;
  minExperience?: number | null;
  requestFields: ReferralField[];
  personRole?: string | null;
  personImageUrl?: string | null;
  myFeedback: ReferralFeedback | null;
  requestCount: number;
  helpfulCount: number;
  shares: number;
  notHelpfulCount: number;
  authorVotes: number;
  authorHelpful: number;
  company: string;
  letter: string;
  title: string;
  location: string;
  skills: string;
  person: string;
  color: string;
};
