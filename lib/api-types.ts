export type ApiProfile = {
  // True when the member limits who can view their profile; only name and photo are returned.
  restricted?: boolean;
  restrictedTo?: "members" | "connections" | "only_me";
  badge?: "blue" | "gold" | null;
  id: string;
  name: string;
  username?: string | null;
  role: string;
  about: string | null;
  skills: string[] | null;
  nextChapter: string | null;
  openToWork: number | boolean;
  location: string;
  profileImageUrl: string | null;
  websiteUrl: string | null;
  linkedinProfileUrl: string | null;
};
export type ApiCompany = { id: string; name: string };
export type ApiPoll = {
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  voters: number;
  allowMultiple: boolean;
  closesAt: string | null;
  closed: boolean;
  myVotes: string[];
};
export type ApiQuotedPost = {
  badge?: "blue" | "gold" | null;
  id: string;
  text: string;
  topic: string;
  createdAt: string;
  anonymous: boolean;
  authorId: string | null;
  name: string;
  username?: string | null;
  image: string | null;
};
export type ApiPost = {
  badge?: "blue" | "gold" | null;
  poll?: ApiPoll | null;
  profileImageUrl?: string | null;
  following: number | boolean;
  note?: string;
  noteSource?: string;
  id: string;
  authorId: string | null;
  name: string;
  username?: string | null;
  role: string;
  text: string;
  topic: string;
  company: string;
  companyId: string | null;
  image: string | null;
  images?: string[];
  createdAt: string;
  anonymous: number | boolean;
  openToWork: number | boolean;
  own: number | boolean;
  likes: number;
  dislikes: number;
  comments: number;
  reposts: number;
  shares?: number;
  views?: number;
  reaction: "like" | "dislike" | null;
  saved: number | boolean;
  reposted: number | boolean;
  editedAt?: string | null;
  quoted?: ApiQuotedPost | null;
};
export type ApiEngagementPerson = {
  badge?: "blue" | "gold" | null;
  id: string;
  name: string;
  username?: string | null;
  role: string | null;
  profileImageUrl: string | null;
  at: string;
  // Number of comments, for the commenters list only.
  count: number | null;
  // Present for the views list only.
  firstViewedAt?: string;
  device?: "mobile" | "tablet" | "desktop";
  source?: "detail" | "feed";
};
export type EngagementType =
  "likes" | "dislikes" | "comments" | "shares" | "reposts" | "views";
export type ApiComment = {
  badge?: "blue" | "gold" | null;
  id: string;
  parentId: string | null;
  text: string;
  name: string;
  username?: string | null;
  authorId: string;
  profileImageUrl: string | null;
  createdAt: string;
  editedAt?: string | null;
  likes: number;
  dislikes: number;
  myReaction: "like" | "dislike" | null;
  // Photo or GIF attached to the comment.
  media?: string | null;
  // Present on top-level comments only; threads are two levels deep.
  replies?: ApiComment[];
};
export type ApiPerson = {
  badge?: "blue" | "gold" | null;
  id: string;
  name: string;
  username?: string | null;
  role: string;
  openToWork: number | boolean;
  following: number | boolean;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
};
export type ApiConnection = {
  badge?: "blue" | "gold" | null;
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted";
  name: string;
  role: string;
  profileImageUrl?: string | null;
};
export type ApiReferral = {
  id: string;
  companyId: string;
  company: string;
  authorId: string;
  person: string;
  title: string;
  location: string;
  skills: string;
  description: string;
  companyLink?: string | null;
  jobLink?: string | null;
  status: "open" | "closed";
  own: number | boolean;
  requestStatus: "pending" | "accepted" | "declined" | null;
  createdAt?: string;
  workMode?: ReferralWorkMode;
  level?: ReferralLevel | null;
  minExperience?: number | null;
  requestFields?: ReferralField[];
  personRole?: string | null;
  personImageUrl?: string | null;
  myFeedback?: ReferralFeedback | null;
  requestCount?: number | string;
  helpfulCount?: number | string;
  shares?: number | string;
  notHelpfulCount?: number | string;
  authorVotes?: number | string;
  authorHelpful?: number | string;
};
export type ReferralWorkMode = "remote" | "hybrid" | "onsite";
export type ReferralLevel = "entry" | "mid" | "senior" | "lead";
export type ReferralFeedback = "helpful" | "not_helpful";
export type ReferralFieldType =
  "text" | "textarea" | "url" | "number" | "select" | "file";
export type ReferralField = {
  id: string;
  label: string;
  type: ReferralFieldType;
  required: boolean;
  options: string[];
};
export type ApiReferralAnswer = {
  label: string;
  type: ReferralFieldType;
  value?: string;
  file?: { id: string; name: string; size: number };
};
export type ApiReferralRequest = {
  badge?: "blue" | "gold" | null;
  userId: string;
  name: string;
  role: string;
  status: string;
  message?: string | null;
  createdAt?: string;
  profileImageUrl?: string | null;
  answers?: ApiReferralAnswer[];
};
export type ApiConversation = {
  badge?: "blue" | "gold" | null;
  id: string;
  userId: string;
  name: string;
  username?: string | null;
  role: string;
  profileImageUrl?: string | null;
  preview: string | null;
  lastMessageAt: string | null;
  lastSenderId?: string | null;
  lastReadAt?: string | null;
  unread: number;
};
export type ApiAttachment = {
  id: string;
  name: string;
  mime: string;
  size: number;
};
export type ApiMessage = {
  id: string;
  senderId: string;
  attachments?: ApiAttachment[];
  text: string;
  createdAt: string;
  readAt: string | null;
};
export type ApiNotification = {
  id: string;
  type: string;
  resourceId: string | null;
  text: string;
  createdAt: string;
  readAt: string | null;
  actorId: string;
  actorName: string;
  actorHeadline: string | null;
  actorImageUrl: string | null;
  preview: string | null;
};
export type ApiInsights = {
  year: number;
  notice: string;
  monthly: { month: number; rolesAffected: number; reports: number }[];
  companies: {
    id: string;
    name: string;
    rolesAffected: number;
    headcount: number | null;
    hires: number | null;
    reports: number;
  }[];
};
export type ApiDailyReminder = {
  id: string;
  quote: string;
  supportingText: string;
};
export type ApiProfileStats = {
  posts: number | null;
  likesReceived: number | null;
  dislikesReceived: number | null;
  commentsReceived: number;
  referrals: number | null;
  openReferrals: number | null;
  followers: number | null;
  following: number | null;
  connections: number | null;
  // Keys the member keeps private from this viewer.
  hidden?: string[];
};
export type ApiSearchResults = {
  users: ApiPerson[];
  posts: ApiPost[];
  referrals: ApiReferral[];
  companies: ApiCompany[];
  topics: string[];
};
export type SearchGroup = keyof ApiSearchResults;
export type ApiMemberPerson = {
  badge?: "blue" | "gold" | null;
  id: string;
  name: string;
  username?: string | null;
  role: string;
  profileImageUrl: string | null;
  openToWork?: number | boolean;
  since?: string | null;
};
export type ApiReactionReceived = ApiMemberPerson & {
  postId: string;
  postPreview: string;
  reactedAt: string;
};
