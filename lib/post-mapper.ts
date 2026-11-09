import { displayDate, displayTime, initials, mediaUrl } from "@/lib/api";
import type { ApiPost } from "@/lib/api-types";
import type { Post } from "@/types";

// Converts an API post into the shape the UI components render.
export function toPost(post: ApiPost): Post {
  return {
    ...post,
    avatar: initials(post.name),
    avatarUrl: post.profileImageUrl,
    color: post.anonymous ? "lavender" : "blue",
    time: `${displayDate(post.createdAt)} · ${displayTime(post.createdAt)}`,
    following: Boolean(post.following),
    open: Boolean(post.openToWork),
    own: Boolean(post.own),
    image: mediaUrl(post.image),
    images: (post.images ?? []).map((path) => mediaUrl(path)!),
    saved: Boolean(post.saved),
    reposted: Boolean(post.reposted),
    quoted: post.quoted ?? null,
    referral: post.topic === "Offering referrals",
    dislikes: Number(post.dislikes),
    likes: Number(post.likes),
    comments: Number(post.comments),
    reposts: Number(post.reposts),
    shares: Number(post.shares ?? 0),
    views: Number(post.views ?? 0),
  };
}
