"use client";
import VerifiedBadge from "@/components/ui/verified-badge";
import CommentForm from "@/components/feed/comment-form";
import Avatar from "@/components/ui/avatar";
import UserLink from "@/components/ui/user-link";
import { displayDate, displayTime, initials } from "@/lib/api";
import type { ApiComment } from "@/lib/api-types";
import { usePlatform } from "@/providers/platform-provider";
import CommentReportDialog from "@/components/feed/comment-report-dialog";
import PostImages from "@/components/feed/post-images";
import { mediaUrl } from "@/lib/api";
import {
  Flag,
  Pencil,
  MessageCircle,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";

type Actions = {
  pending: boolean;
  post: (text: string, parentId?: string, file?: File) => Promise<boolean>;
  edit: (commentId: string, text: string) => Promise<boolean>;
  react: (
    comment: ApiComment,
    reaction: "like" | "dislike",
  ) => Promise<boolean>;
};

// A single comment or reply with like, dislike, reply and share.
// Replies render one level under their parent; replying to a reply stays in that thread.
export default function CommentItem({
  comment,
  postId,
  actions,
  isReply = false,
  replyingTo,
  onReplyingChange,
}: {
  comment: ApiComment;
  postId: string;
  actions: Actions;
  isReply?: boolean;
  replyingTo: string | null;
  onReplyingChange: (id: string | null) => void;
}) {
  const { notify, currentUser } = usePlatform();
  const [reporting, setReporting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text);
  const canSave =
    !actions.pending &&
    draft.trim() !== comment.text &&
    (Boolean(draft.trim()) || Boolean(comment.media));
  const [showReplies, setShowReplies] = useState(true);
  const replies = comment.replies ?? [];
  const replying = replyingTo === comment.id;

  async function share() {
    const text = `“${comment.text}” — ${comment.name} on LaidOffCircle`;
    try {
      if (navigator.share) {
        await navigator.share({ text, url: window.location.origin });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${window.location.origin}`);
      notify("Comment copied to your clipboard.");
    } catch (error) {
      // Dismissing the share sheet is not an error.
      if (!(error instanceof DOMException && error.name === "AbortError"))
        notify("Couldn’t share this comment.");
    }
  }

  return (
    <div className={`comment${isReply ? " comment-reply" : ""}`}>
      <UserLink id={comment.authorId} username={comment.username}>
        <Avatar
          initials={initials(comment.name)}
          src={comment.profileImageUrl}
          small
        />
      </UserLink>
      <div className="comment-body">
        <div className="comment-bubble">
          <div className="comment-head">
            <UserLink id={comment.authorId} username={comment.username}>
              <strong>
                {comment.name}
                <VerifiedBadge type={comment.badge} />
              </strong>
              {comment.username && (
                <span className="user-handle"> @{comment.username}</span>
              )}
            </UserLink>
            <time dateTime={comment.createdAt}>
              {displayDate(comment.createdAt)}
            </time>
            {comment.editedAt && (
              <span
                className="edited-mark"
                title={`Edited ${displayDate(comment.editedAt)} · ${displayTime(comment.editedAt)}`}
              >
                · Edited
              </span>
            )}
          </div>
          {editing ? (
            <div className="comment-edit">
              <textarea
                autoFocus
                aria-label="Edit your comment"
                maxLength={5000}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setEditing(false);
                }}
              />
              <div className="comment-edit-row">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={!canSave}
                  onClick={async () => {
                    if (await actions.edit(comment.id, draft.trim()))
                      setEditing(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            comment.text && <p>{comment.text}</p>
          )}
          {comment.media && (
            <div className="comment-media">
              <PostImages
                images={[mediaUrl(comment.media)!]}
                author={comment.name}
              />
            </div>
          )}
        </div>
        <div className="comment-actions">
          <button
            className={comment.myReaction === "like" ? "active" : ""}
            aria-pressed={comment.myReaction === "like"}
            aria-label="Like comment"
            disabled={actions.pending}
            onClick={() => void actions.react(comment, "like")}
          >
            <ThumbsUp size={14} /> {comment.likes || ""}
          </button>
          <button
            className={comment.myReaction === "dislike" ? "active" : ""}
            aria-pressed={comment.myReaction === "dislike"}
            aria-label="Dislike comment"
            disabled={actions.pending}
            onClick={() => void actions.react(comment, "dislike")}
          >
            <ThumbsDown size={14} /> {comment.dislikes || ""}
          </button>
          <button
            onClick={() => onReplyingChange(replying ? null : comment.id)}
          >
            <MessageCircle size={14} /> Reply
          </button>
          <button onClick={() => void share()}>
            <Share2 size={14} /> Share
          </button>
          {currentUser?.id === comment.authorId && (
            <button
              onClick={() => {
                setDraft(comment.text);
                setEditing(true);
              }}
            >
              <Pencil size={14} /> Edit
            </button>
          )}
          {currentUser?.id !== comment.authorId && (
            <button onClick={() => setReporting(true)}>
              <Flag size={14} /> Report
            </button>
          )}
        </div>
        {reporting && (
          <CommentReportDialog
            postId={postId}
            commentId={comment.id}
            onClose={() => setReporting(false)}
          />
        )}
        {replying && (
          <CommentForm
            label={`Reply to ${comment.name}`}
            placeholder={`Reply to ${comment.name}…`}
            initialText={isReply ? `@${comment.name} ` : ""}
            autoFocus
            pending={actions.pending}
            onSubmit={(text, file) => actions.post(text, comment.id, file)}
            onCancel={() => onReplyingChange(null)}
          />
        )}
        {!isReply && replies.length > 0 && (
          <>
            <button
              className="text-button comment-toggle"
              aria-expanded={showReplies}
              onClick={() => setShowReplies((value) => !value)}
            >
              {showReplies
                ? "Hide replies"
                : `View ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
            </button>
            {showReplies &&
              replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  actions={actions}
                  isReply
                  replyingTo={replyingTo}
                  onReplyingChange={onReplyingChange}
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
}
