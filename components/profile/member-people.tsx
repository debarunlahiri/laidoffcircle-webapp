"use client";
import VerifiedBadge from "@/components/ui/verified-badge";
import Avatar from "@/components/ui/avatar";
import UserLink from "@/components/ui/user-link";
import { useApiList } from "@/hooks/use-api-resource";
import { initials } from "@/lib/api";
import type { ApiMemberPerson, ApiReactionReceived } from "@/lib/api-types";
import { postedAgo } from "@/lib/referral-meta";
import { ThumbsDown, ThumbsUp } from "lucide-react";

function Status({
  loading,
  error,
  empty,
  emptyText,
  hasMore,
  loadMore,
}: {
  loading: boolean;
  error: string;
  empty: boolean;
  emptyText: string;
  hasMore: boolean;
  loadMore: () => void;
}) {
  return (
    <>
      {loading && <p role="status">Loading…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && empty && <p className="empty card">{emptyText}</p>}
      {hasMore && (
        <button className="secondary" disabled={loading} onClick={loadMore}>
          Load more
        </button>
      )}
    </>
  );
}

// Followers or accepted connections of a member.
export function MemberPeople({
  path,
  emptyText,
}: {
  path: string;
  emptyText: string;
}) {
  const list = useApiList<ApiMemberPerson>(path);
  return (
    <div className="member-list">
      {list.data.map((person) => (
        <div className="card member-person" key={person.id}>
          <UserLink id={person.id} username={person.username}>
            <Avatar
              initials={initials(person.name)}
              src={person.profileImageUrl}
              color="blue"
            />
            <span>
              <strong>
                {person.name}
                <VerifiedBadge type={person.badge} />
              </strong>
              <small>{person.role}</small>
            </span>
          </UserLink>
          {person.since && <time>{postedAgo(person.since)}</time>}
        </div>
      ))}
      <Status
        loading={list.loading}
        error={list.error}
        empty={list.data.length === 0}
        emptyText={emptyText}
        hasMore={list.hasMore}
        loadMore={() => void list.loadMore()}
      />
    </div>
  );
}

// Who liked or disliked the member's posts (private to the member).
export function MemberReactions({
  id,
  type,
}: {
  id: string;
  type: "like" | "dislike";
}) {
  const list = useApiList<ApiReactionReceived>(
    `/users/${id}/reactions?type=${type}`,
  );
  const Icon = type === "like" ? ThumbsUp : ThumbsDown;
  return (
    <div className="member-list">
      {list.data.map((item) => (
        <div
          className="card member-person reaction"
          key={`${item.id}-${item.postId}`}
        >
          <UserLink id={item.id}>
            <Avatar
              initials={initials(item.name)}
              src={item.profileImageUrl}
              color="blue"
            />
            <span>
              <strong>
                {item.name}
                <VerifiedBadge type={item.badge} />
              </strong>
              <small>{item.role}</small>
            </span>
          </UserLink>
          <p className="reaction-line">
            <Icon size={14} aria-hidden="true" />
            {type === "like" ? "Liked" : "Disliked"} your post
            <time>{postedAgo(item.reactedAt)}</time>
          </p>
          {item.postPreview && (
            <blockquote className="reaction-post">
              {item.postPreview}
            </blockquote>
          )}
        </div>
      ))}
      <Status
        loading={list.loading}
        error={list.error}
        empty={list.data.length === 0}
        emptyText={
          type === "like"
            ? "No likes on your posts yet."
            : "No dislikes on your posts."
        }
        hasMore={list.hasMore}
        loadMore={() => void list.loadMore()}
      />
    </div>
  );
}
