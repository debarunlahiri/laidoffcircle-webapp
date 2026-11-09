"use client";
import EngagementDialog from "@/components/feed/engagement-dialog";
import type { EngagementType } from "@/lib/api-types";
import type { Post } from "@/types";
import { ThumbsUp } from "lucide-react";
import { Fragment, useState } from "react";

// Post counts. Each one opens the list of members behind it.
export default function PostStats({ post }: { post: Post }) {
  const [open, setOpen] = useState<EngagementType | null>(null);
  const groups: [EngagementType, number, string, string][][] = [
    [
      ["likes", post.likes, "like", "likes"],
      ["dislikes", post.dislikes ?? 0, "dislike", "dislikes"],
    ],
    [
      ["comments", post.comments, "comment", "comments"],
      ["shares", post.shares ?? 0, "share", "shares"],
      ["reposts", post.reposts, "repost", "reposts"],
      ["views", post.views ?? 0, "view", "views"],
    ],
  ];
  return (
    <div className="post-stats">
      {groups.map((group, index) => (
        <span key={index}>
          {index === 0 && <ThumbsUp size={13} />}
          {group.map(([type, count, one, many], position) => (
            <Fragment key={type}>
              {position > 0 && " · "}
              {type === "views" && !post.own ? (
                // Only the author can see who viewed a post.
                <span>
                  {count} {count === 1 ? one : many}
                </span>
              ) : (
                <button
                  type="button"
                  className="stat-link"
                  onClick={() => setOpen(type)}
                >
                  {count} {count === 1 ? one : many}
                </button>
              )}
            </Fragment>
          ))}
        </span>
      ))}
      {open && (
        <EngagementDialog
          postId={post.id}
          initialType={open}
          canSeeViews={Boolean(post.own)}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
