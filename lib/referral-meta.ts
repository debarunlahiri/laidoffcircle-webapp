import type {
  ReferralFieldType,
  ReferralLevel,
  ReferralWorkMode,
} from "@/lib/api-types";

export const workModeLabels: Record<ReferralWorkMode, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};
export const levelLabels: Record<ReferralLevel, string> = {
  entry: "Entry level",
  mid: "Mid level",
  senior: "Senior",
  lead: "Lead / Manager",
};
export const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "helpful", label: "Most helpful referrers" },
  { value: "requests", label: "Most requested" },
  { value: "company", label: "Company A–Z" },
];
export const postedOptions = [
  { value: "", label: "Any time" },
  { value: "1", label: "Past 24 hours" },
  { value: "7", label: "Past week" },
  { value: "30", label: "Past month" },
  { value: "90", label: "Past 3 months" },
];
export const fieldTypeLabels: Record<ReferralFieldType, string> = {
  text: "Short answer",
  textarea: "Long answer",
  url: "Link",
  number: "Number",
  select: "Choice",
  file: "File upload (PDF/Word)",
};

// Questions a referrer can add with one click.
export const fieldPresets: {
  label: string;
  type: ReferralFieldType;
  required: boolean;
  options?: string[];
}[] = [
  { label: "Resume / CV", type: "file", required: true },
  { label: "Why are you a good fit?", type: "textarea", required: true },
  { label: "LinkedIn profile", type: "url", required: false },
  { label: "Portfolio or work samples", type: "url", required: false },
  { label: "Years of experience", type: "number", required: false },
  { label: "Current location", type: "text", required: false },
  {
    label: "Notice period",
    type: "select",
    required: false,
    options: ["Immediate", "15 days", "30 days", "60 days", "90 days"],
  },
];

// Share of helpful votes, or null until there are enough ratings to mean something.
export function helpfulRate(helpful: number, votes: number) {
  return votes >= 3 ? Math.round((helpful / votes) * 100) : null;
}
export function isTopRated(helpful: number, votes: number) {
  const rate = helpfulRate(helpful, votes);
  return rate !== null && rate >= 70;
}
export function fileSize(bytes: number) {
  return bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
export function postedAgo(value?: string) {
  if (!value) return "";
  const stamp = /[zZ]$|[+-]\d{2}:\d{2}$/.test(value)
    ? value
    : `${value.replace(" ", "T")}Z`;
  const minutes = Math.max(
    0,
    Math.round((Date.now() - new Date(stamp).getTime()) / 60000),
  );
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  if (minutes < 43200) return `${Math.round(minutes / 1440)}d ago`;
  return `${Math.round(minutes / 43200)}mo ago`;
}
