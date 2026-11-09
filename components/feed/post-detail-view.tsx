"use client";
import PostCard from "@/components/feed/post-card";
import PostDetailComments from "@/components/feed/post-detail-comments";
import { useApiResource } from "@/hooks/use-api-resource";
import type { ApiPost } from "@/lib/api-types";
import { toPost } from "@/lib/post-mapper";
import { api } from "@/lib/api";
import { usePlatform } from "@/providers/platform-provider";
import { useEffect, useRef } from "react";

// One post in full, with its comment thread underneath.
export default function PostDetailView({ id }: { id: string }) {
  const resource = useApiResource<ApiPost | null>(`/posts/${id}`, null);
  const post = resource.data ? toPost(resource.data) : null;
  const { currentUser } = usePlatform();
  const viewed = useRef<string | null>(null);

  // Record one view per visit for signed-in members; the server skips the author.
  useEffect(() => {
    if (!currentUser || !post || viewed.current === post.id) return;
    viewed.current = post.id;
    void api(`/posts/${post.id}/view`, {
      method: "POST",
      body: { source: "detail" },
    }).catch(() => undefined);
  }, [currentUser, post]);

  return (
    <div className="post-detail">
      {resource.loading && !post && <p role="status">Loading post…</p>}
      {!post && !resource.loading && (
        <div className="card empty-state" role="alert">
          <strong>This post isn’t available</strong>
          <p className="subtle-text">
            {resource.error || "It may have been deleted."}
          </p>
        </div>
      )}
      {post && (
        <>
          <PostCard post={post} full />
          <PostDetailComments post={post} />
        </>
      )}
    </div>
  );
}
