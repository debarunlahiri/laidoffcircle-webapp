"use client";
import { FileText, Plus } from "lucide-react";
import { usePlatform } from "@/providers/platform-provider";
import PostCard from "@/components/feed/post-card";
import { useApiList } from "@/hooks/use-api-resource";
import type { ApiPost } from "@/lib/api-types";
import { toPost } from "@/lib/post-mapper";

export default function MemberPosts({
  id,
  own = false,
}: {
  id: string;
  own?: boolean;
}) {
  const { setComposer } = usePlatform();
  const { data, loading, error, hasMore, loadMore } = useApiList<ApiPost>(
    `/posts?authorId=${id}`,
  );
  return (
    <div className="member-list">
      {data.map((post) => (
        <PostCard key={post.id} post={toPost(post)} />
      ))}
      {loading && <p role="status">Loading posts…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <div className="pf-activity-empty card">
          <span className="pf-section-icon">
            <FileText size={22} aria-hidden="true" />
          </span>
          <h3>{own ? "Your voice belongs here" : "No public posts yet"}</h3>
          <p>
            {own
              ? "Share a thought, a lesson, or what you’re looking for next. Your first conversation starts with a post."
              : "When this member shares something with the community, it will appear here."}
          </p>
          {own && (
            <button
              type="button"
              className="secondary"
              onClick={() => setComposer(true)}
            >
              <Plus size={15} /> Create your first post
            </button>
          )}
        </div>
      )}
      {hasMore && (
        <button className="secondary" disabled={loading} onClick={loadMore}>
          Load more posts
        </button>
      )}
    </div>
  );
}
