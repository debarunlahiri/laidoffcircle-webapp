"use client";
import CommentForm from "@/components/feed/comment-form";
import CommentItem from "@/components/feed/comment-item";
import Popover from "@/components/ui/popover";
import { useApiList } from "@/hooks/use-api-resource";
import { useCommentActions } from "@/hooks/use-comment-actions";
import type { ApiComment } from "@/lib/api-types";
import { usePlatform } from "@/providers/platform-provider";
import type { Post } from "@/types";
import { Ellipsis } from "lucide-react";
import { useState } from "react";

const sorts = [
  { value: "oldest", label: "Oldest first" },
  { value: "newest", label: "Newest first" },
  { value: "top", label: "Most liked" },
];
const filters = [
  { value: "all", label: "All comments" },
  { value: "mine", label: "My comments" },
  { value: "replied", label: "With replies" },
];

// The full comment thread for the post page, with sort and filter controls.
export default function PostDetailComments({ post }: { post: Post }) {
  const { notify } = usePlatform();
  const actions = useCommentActions(post.id, notify);
  const [sort, setSort] = useState("oldest");
  const [filter, setFilter] = useState("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const list = useApiList<ApiComment>(
    `/posts/${post.id}/comments?sort=${sort}&filter=${filter}`,
  );

  return (
    <section id="post-comments" className="card comments post-detail-comments">
      <div className="comments-toolbar">
        <h2>
          {post.comments} {post.comments === 1 ? "comment" : "comments"}
        </h2>
        <Popover
          label="Comment options"
          icon={<Ellipsis size={20} />}
          presentation="sheet"
        >
          {(close) => (
            <div className="bottom-sheet-fields">
              <label>
                Show
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  {filters.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Sort by
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  {sorts.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="primary" onClick={close}>
                Done
              </button>
            </div>
          )}
        </Popover>
      </div>
      <CommentForm
        label="Write a comment"
        placeholder="Write a comment…"
        pending={actions.pending}
        onSubmit={(text, file) => actions.post(text, undefined, file)}
      />
      {list.data.map((item) => (
        <CommentItem
          key={item.id}
          comment={item}
          postId={post.id}
          actions={actions}
          replyingTo={replyingTo}
          onReplyingChange={setReplyingTo}
        />
      ))}
      {list.loading && <p role="status">Loading comments…</p>}
      {list.error && <p role="alert">{list.error}</p>}
      {!list.loading && !list.error && list.data.length === 0 && (
        <p className="subtle-text">
          {filter === "all"
            ? "Be the first to offer a kind word."
            : "No comments match this filter."}
        </p>
      )}
      {list.hasMore && (
        <button className="text-button" onClick={() => void list.loadMore()}>
          Load more comments
        </button>
      )}
    </section>
  );
}
