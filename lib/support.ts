export const ticketCategories = {
  account: "Account & sign-in",
  technical: "Something isn’t working",
  referrals: "Jobs & referrals",
  safety: "Safety & community concerns",
  feedback: "Feedback & suggestions",
  other: "Something else",
};
export const ticketPriorities = {
  low: "Low",
  normal: "Normal",
  high: "High",
};
export const ticketStatuses = {
  open: "Open",
  in_progress: "In progress",
  waiting_on_you: "Waiting for your reply",
  resolved: "Resolved",
  closed: "Closed",
};
export type TicketStatus = keyof typeof ticketStatuses;
export type SupportImage = {
  id: string;
  name: string;
  size: number;
  width: number;
  height: number;
};
export type SupportTicket = {
  images?: SupportImage[];
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: keyof typeof ticketCategories;
  priority: keyof typeof ticketPriorities;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  requesterName?: string;
  requesterEmail?: string;
};
export type SupportMessage = {
  images?: SupportImage[];
  id: string;
  ticketId: string;
  userId: string | null;
  authorName: string;
  isStaff: boolean;
  kind: "reply" | "status";
  body: string;
  createdAt: string;
};
export const ticketStatusLabel = (status: TicketStatus, admin = false) =>
  admin && status === "waiting_on_you"
    ? "Waiting for member"
    : ticketStatuses[status];
export const ticketReference = (id: string) =>
  `#${id.slice(0, 8).toUpperCase()}`;

export function supportRequestBody(
  fields: Record<string, string>,
  images: File[],
) {
  if (!images.length) return fields;
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  for (const image of images) form.append("images", image);
  return form;
}
