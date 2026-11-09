"use client";

import PostCard from "@/components/feed/post-card";
import Skeleton from "@/components/ui/skeleton";
import { usePlatform } from "@/providers/platform-provider";
import { ArrowRight, Bookmark } from "lucide-react";
import Link from "next/link";

export default function BookmarksView() {
  const { filteredPosts, feedLoading, feedError, feedHasMore, loadMorePosts } =
    usePlatform();

  return (
    <div className="saved-page">
      <p className="saved-intro">Your saved posts, all in one place.</p>
      {filteredPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {feedLoading && <Skeleton rows={3} label="Loading saved posts" />}
      {feedError && (
        <p role="alert" className="api-error">
          {feedError}
        </p>
      )}
      {!feedLoading && !feedError && !filteredPosts.length && (
        <section className="saved-empty card">
          <span className="saved-empty-icon" aria-hidden="true">
            <Bookmark size={26} />
          </span>
          <h2>No saved posts yet</h2>
          <p>Save a post from its three-dot menu to find it here.</p>
          <Link href="/" className="saved-browse">
            Browse the feed <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      )}
      {feedHasMore && !feedError && (
        <button
          className="secondary"
          disabled={feedLoading}
          onClick={() => void loadMorePosts()}
        >
          Load more saved posts
        </button>
      )}
    </div>
  );
}
