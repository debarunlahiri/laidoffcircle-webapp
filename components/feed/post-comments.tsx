"use client";
import CommentForm from "@/components/feed/comment-form";
import CommentItem from "@/components/feed/comment-item";
import { useCommentActions } from "@/hooks/use-comment-actions";
import type { ApiComment } from "@/lib/api-types";
import { usePlatform } from "@/providers/platform-provider";
import type { Post } from "@/types";
import { useState } from "react";

export default function PostComments({ post }: { post: Post }) {
  const {
    comments,
    commentsLoading,
    commentsError,
    commentsHasMore,
    loadMoreComments,
    notify,
  } = usePlatform();
  const actions = useCommentActions(post.id, notify);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const list = (comments[post.id] || []) as ApiComment[];

  return (
    <div className="comments">
      {list.map((item) => (
        <CommentItem
          key={item.id}
          comment={item}
          postId={post.id}
          actions={actions}
          replyingTo={replyingTo}
          onReplyingChange={setReplyingTo}
        />
      ))}
      {commentsLoading && <p role="status">Loading comments…</p>}
      {commentsError && <p role="alert">{commentsError}</p>}
      {!commentsLoading && !commentsError && list.length === 0 && (
        <p className="subtle-text">Be the first to offer a kind word.</p>
      )}
      {commentsHasMore && (
        <button className="text-button" onClick={() => void loadMoreComments()}>
          Load more comments
        </button>
      )}
      <CommentForm
        label="Write a comment"
        placeholder="Offer a kind word…"
        pending={actions.pending}
        onSubmit={(text, file) => actions.post(text, undefined, file)}
      />
    </div>
  );
}
