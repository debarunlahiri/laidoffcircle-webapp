"use client";
import VerifiedBadge from "@/components/ui/verified-badge";
import PollView from "@/components/feed/poll-view";
import PostImages from "@/components/feed/post-images";
import CommunityNote from "@/components/community-notes/community-note";
import PostComments from "@/components/feed/post-comments";
import QuotedPost from "@/components/feed/quoted-post";
import PostStats from "@/components/feed/post-stats";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import MarkdownEditor from "@/components/ui/markdown-editor";
import RichText from "@/components/ui/rich-text";
import {
  api,
  apiMessage,
  displayDate,
  displayTime,
  invalidate,
} from "@/lib/api";
import Popover from "@/components/ui/popover";
import Avatar from "@/components/ui/avatar";
import UserLink from "@/components/ui/user-link";
import { usePlatform } from "@/providers/platform-provider";
import type { Post } from "@/types";
import {
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  Earth,
  Ellipsis,
  Copy,
  EyeOff,
  Flag,
  Pencil,
  Trash2,
  FileText,
  UserPlus,
  ThumbsUp,
  ThumbsDown,
  Leaf,
  MessageCircle,
  Quote,
  Repeat2,
  Share2,
} from "lucide-react";

const clampChars = 420;
const clampLines = 8;

export default function PostCard({
  post,
  full = false,
}: {
  post: Post;
  full?: boolean;
}) {
  const router = useRouter();
  const postHref = `/posts/${post.id}`;
  const {
    following,
    commentPost,
    navigate,
    toggleFollow,
    toggleLike,
    toggleDislike,
    toggleBookmark,
    toggleRepost,
    openQuoteComposer,
    toggleComments,
    postTopics,
    openNoteDialog,
    hidePost,
    deletePost,
    openReportDialog,
    notify,
    postPending,
  } = usePlatform();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.text);
  const [draftTopic, setDraftTopic] = useState(post.topic);
  const [saving, setSaving] = useState(false);
  const canSave =
    !saving &&
    (draft.trim() || (post.images?.length ?? 0) > 0) &&
    (draft.trim() !== post.text || draftTopic !== post.topic);
  async function saveEdit() {
    if (!canSave) return;
    setSaving(true);
    try {
      await api(`/posts/${post.id}`, {
        method: "PATCH",
        body: { text: draft.trim(), topic: draftTopic },
      });
      invalidate("posts");
      setEditing(false);
      notify("Your post was updated.");
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const isFollowing = Boolean(
    post.following || (post.authorId && following.includes(post.authorId)),
  );
  const isPending = postPending.includes(post.id);
  const clamped =
    !full &&
    (post.text.length > clampChars ||
      post.text.split("\n").length > clampLines);

  function openPost(event: MouseEvent<HTMLElement>) {
    const { target, currentTarget } = event;
    if (
      event.defaultPrevented ||
      !(target instanceof Element) ||
      !currentTarget.contains(target) ||
      target.closest(
        'a, button, input, select, textarea, label, [contenteditable], [role="button"], [role="dialog"], .post-actions, .comment-form',
      )
    ) {
      return;
    }

    const selection = window.getSelection();
    if (
      selection &&
      !selection.isCollapsed &&
      currentTarget.contains(selection.anchorNode)
    ) {
      return;
    }

    router.push(postHref);
  }

  // Native share sheet where available, otherwise copy the link.
  async function share() {
    const url = `${window.location.origin}${postHref}`;
    try {
      if (navigator.share) await navigator.share({ title: post.name, url });
      else {
        await navigator.clipboard.writeText(url);
        notify("Post link copied.");
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      notify("Could not share. Copy the link from the address bar.");
      return;
    }
    try {
      await api(`/posts/${post.id}/share`, { method: "PUT" });
      invalidate("posts");
    } catch {
      // Counting is best effort; the link was already shared.
    }
  }

  return (
    <article
      className={`post card${full ? "" : " post-preview"}`}
      key={post.id}
      onClick={full ? undefined : openPost}
    >
      <div className="post-heading">
        <UserLink id={post.authorId} username={post.username}>
          <Avatar
            initials={post.avatar}
            color={post.color}
            src={post.avatarUrl}
          />
          <div className="author">
            <strong>
              {post.name}
              <VerifiedBadge type={post.badge} />
            </strong>
            <span
              className="post-author-meta"
              title={[post.username && `@${post.username}`, post.role]
                .filter(Boolean)
                .join(" · ")}
            >
              {post.username && (
                <span className="user-handle">@{post.username}</span>
              )}
              {post.username && post.role && " · "}
              {post.role}
            </span>
            <span className="post-time">
              {post.time} <span>·</span> <Earth size={12} />
              {post.editedAt && (
                <>
                  {" "}
                  <span>·</span>{" "}
                  <span
                    className="edited-mark"
                    title={`Edited ${displayDate(post.editedAt)} · ${displayTime(post.editedAt)}`}
                  >
                    Edited
                  </span>
                </>
              )}
            </span>
          </div>
        </UserLink>
      </div>
      <div className="post-tags">
        <span className={post.referral ? "tag green-tag" : "tag"}>
          {post.referral ? (
            <BriefcaseBusiness size={12} />
          ) : post.open ? (
            <Leaf size={12} />
          ) : (
            <MessageCircle size={12} />
          )}
          {post.topic}
        </span>
        {post.company && (
          <span className="company-tag">
            <Building2 size={12} />
            {post.company}
          </span>
        )}
        {post.open && <span className="open-tag">Open to work</span>}
      </div>
      {editing && (
        <div className="post-edit" onClick={(event) => event.stopPropagation()}>
          <MarkdownEditor
            autoFocus
            ariaLabel="Edit your post"
            maxLength={20000}
            value={draft}
            onChange={setDraft}
            onKeyDown={(event) => {
              if (event.key === "Escape") setEditing(false);
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey))
                void saveEdit();
            }}
          />
          <div className="post-edit-row">
            <select
              aria-label="Topic"
              value={draftTopic}
              onChange={(event) => setDraftTopic(event.target.value)}
            >
              {[...new Set([post.topic, ...postTopics])].map((topic) => (
                <option key={topic}>{topic}</option>
              ))}
            </select>
            <span className="post-edit-hint">Ctrl/⌘ + Enter to save</span>
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
              onClick={() => void saveEdit()}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
      {post.text && !editing && (
        <div className={`post-copy${clamped ? " is-clamped" : ""}`}>
          <RichText text={post.text} clamped={clamped} />
        </div>
      )}
      {!full && (
        <Link
          className={clamped ? "read-more" : "sr-only post-preview-link"}
          href={postHref}
          aria-label={`${clamped ? "Read more" : "Open post"} by ${post.name}`}
        >
          {clamped ? "Read more" : "Open post"}
        </Link>
      )}
      {post.poll && (
        <PollView
          postId={post.id}
          initial={post.poll}
          own={Boolean(post.own)}
        />
      )}
      <PostImages images={post.images ?? []} author={post.name} />
      {post.quoted && <QuotedPost post={post.quoted} />}
      {post.referral && (
        <button
          className="referral-inline"
          onClick={() => navigate("Referrals")}
        >
          <BriefcaseBusiness size={22} />
          <span>
            <strong>A little help for your next chapter</strong>
            <small>
              {post.company ? `${post.company} · ` : ""}Explore referral
              opportunities
            </small>
          </span>
          <ArrowUpRight size={19} />
        </button>
      )}
      {post.note && <CommunityNote note={post.note} source={post.noteSource} />}
      <PostStats post={post} />
      <div className="post-actions">
        <button
          className={post.reaction === "like" ? "active-action" : ""}
          disabled={isPending}
          aria-label="Like post"
          aria-pressed={post.reaction === "like"}
          onClick={() => toggleLike(post.id, post.reaction ?? null)}
        >
          <ThumbsUp
            size={18}
            fill={post.reaction === "like" ? "currentColor" : "none"}
          />
          <span className="post-action-label">Like</span>
        </button>
        <button
          className={post.reaction === "dislike" ? "active-action" : ""}
          disabled={isPending}
          aria-label="Dislike post"
          aria-pressed={post.reaction === "dislike"}
          onClick={() => toggleDislike(post.id, post.reaction ?? null)}
        >
          <ThumbsDown
            size={18}
            fill={post.reaction === "dislike" ? "currentColor" : "none"}
          />
          <span className="post-action-label">Dislike</span>
        </button>
        <button
          disabled={isPending}
          aria-label="Comment on post"
          onClick={() =>
            full
              ? document.getElementById("post-comments")?.scrollIntoView({
                  behavior: "smooth",
                })
              : toggleComments(post.id)
          }
        >
          <MessageCircle size={18} />
          <span className="post-action-label">Comment</span>
        </button>
        <Popover
          label="Post options"
          icon={
            <>
              <Ellipsis size={20} />
              <span className="post-action-label">More</span>
            </>
          }
          presentation="sheet"
        >
          {(close) => (
            <>
              <button
                disabled={isPending}
                onClick={() => {
                  close();
                  toggleRepost(post.id, Boolean(post.reposted));
                }}
              >
                <Repeat2 size={16} />
                {post.reposted ? "Undo repost" : "Repost"}
              </button>
              <button
                onClick={() => {
                  close();
                  openQuoteComposer(post);
                }}
              >
                <Quote size={16} />
                Quote post
              </button>
              <button
                onClick={() => {
                  close();
                  void share();
                }}
              >
                <Share2 size={16} />
                Share post
              </button>
              <button
                disabled={isPending}
                onClick={() => {
                  toggleBookmark(post.id, Boolean(post.saved));
                  close();
                }}
              >
                <Bookmark size={16} />
                {post.saved ? "Remove bookmark" : "Save post"}
              </button>
              {post.authorId && !post.own && (
                <>
                  <button
                    onClick={() => {
                      post.authorId && toggleFollow(post.authorId, isFollowing);
                      close();
                    }}
                  >
                    <UserPlus size={16} />
                    {isFollowing ? "Unfollow" : "Follow"} {post.name}
                  </button>
                </>
              )}
              <button
                onClick={async () => {
                  close();
                  try {
                    await navigator.clipboard.writeText(post.text);
                    notify("Post text copied.");
                  } catch {
                    notify(
                      "Could not copy. Please select and copy the post text.",
                    );
                  }
                }}
              >
                <Copy size={16} />
                Copy post text
              </button>
              <button
                onClick={() => {
                  close();
                  openNoteDialog(post.id);
                }}
              >
                <FileText size={16} />
                Add a community note
              </button>
              <button
                onClick={() => {
                  close();
                  hidePost(post.id);
                }}
              >
                <EyeOff size={16} />
                Hide post
              </button>
              {!post.own && (
                <button
                  onClick={() => {
                    close();
                    openReportDialog(post.id);
                  }}
                >
                  <Flag size={16} />
                  Report post
                </button>
              )}
              {post.own && (
                <button
                  onClick={() => {
                    close();
                    setDraft(post.text);
                    setDraftTopic(post.topic);
                    setEditing(true);
                  }}
                >
                  <Pencil size={16} />
                  Edit post
                </button>
              )}
              {post.own && (
                <button
                  onClick={() => {
                    close();
                    void deletePost(post.id);
                  }}
                >
                  <Trash2 size={16} />
                  Delete post
                </button>
              )}
            </>
          )}
        </Popover>
      </div>
      {!full && commentPost === post.id && <PostComments post={post} />}
    </article>
  );
}
