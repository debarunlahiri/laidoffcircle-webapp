"use client";
import { useAuth } from "@/providers/auth-provider";
import { useConfirm } from "@/providers/confirm-provider";
import { useState } from "react";
import { api, apiMessage, invalidate, queryPath } from "@/lib/api";
import type { ApiComment, ApiPost } from "@/lib/api-types";
import { toPost } from "@/lib/post-mapper";
import type { Post } from "@/types";
import {
  useApiList,
  useApiResource,
  useDebouncedValue,
} from "./use-api-resource";

export function useFeed(
  section: string,
  search: string,
  notify: (message: string) => void,
) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [tab, setTab] = useState("For you");
  const [feedTopic, setFeedTopic] = useState("");
  const [exploreTopic, setExploreTopic] = useState("All");
  const [feedCompany, setFeedCompany] = useState("");
  const [feedSort, setFeedSort] = useState("Latest");
  const [commentPost, setCommentPost] = useState<string | null>(null);
  const [pending, setPending] = useState<string[]>([]);
  const debouncedSearch = useDebouncedValue(search);
  const enabled = ["Home", "Explore", "Bookmarks"].includes(section);
  const list = useApiList<ApiPost>(
    enabled
      ? queryPath("/posts", {
          search: section === "Bookmarks" ? undefined : debouncedSearch,
          topic:
            section === "Bookmarks"
              ? undefined
              : section === "Explore"
                ? exploreTopic === "All"
                  ? undefined
                  : exploreTopic
                : tab === "Layoff updates"
                  ? "Layoff updates"
                  : feedTopic,
          companyId:
            section === "Explore" || section === "Bookmarks"
              ? undefined
              : feedCompany,
          tab:
            section === "Bookmarks"
              ? "bookmarks"
              : section === "Explore"
                ? "all"
                : tab === "Following"
                  ? "following"
                  : tab === "Referrals"
                    ? "referrals"
                    : "all",
          sort:
            section === "Bookmarks" || tab === "Latest"
              ? "latest"
              : feedSort === "Most liked"
                ? "most-liked"
                : "latest",
        })
      : null,
  );
  const hidden = useApiResource<ApiPost[]>(
    enabled && user ? "/posts?tab=hidden&limit=100" : null,
    [],
  );
  const commentList = useApiList<ApiComment>(
    commentPost ? `/posts/${commentPost}/comments` : null,
  );
  const posts: Post[] = list.data.map(toPost);
  const liked = posts
    .filter((post) => post.reaction === "like")
    .map((post) => post.id);
  const disliked = posts
    .filter((post) => post.reaction === "dislike")
    .map((post) => post.id);
  const saved = posts.filter((post) => post.saved).map((post) => post.id);
  const reposted = posts.filter((post) => post.reposted).map((post) => post.id);
  async function mutate(id: string, action: () => Promise<unknown>) {
    if (pending.includes(id)) return;
    setPending((current) => [...current, id]);
    try {
      await action();
      invalidate("posts");
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setPending((current) => current.filter((item) => item !== id));
    }
  }
  // The caller passes the post's own current state: a post can be rendered from
  // any list (profile, search), not just the feed this hook loaded.
  const react = (
    id: string,
    reaction: "like" | "dislike",
    current: "like" | "dislike" | null,
  ) =>
    mutate(id, () =>
      api(`/posts/${id}/reaction`, {
        method: current === reaction ? "DELETE" : "PUT",
        body: { reaction },
      }),
    );
  function resetFeedFilters() {
    setFeedTopic("");
    setFeedCompany("");
    setFeedSort("Latest");
  }
  async function restoreHiddenPosts() {
    if (
      !(await confirm({
        title: "Restore all hidden posts?",
        message: "Every post you hid will show up in your feed again.",
        confirmLabel: "Restore",
      }))
    )
      return;
    try {
      await api("/posts/hidden/all", { method: "DELETE" });
      invalidate("posts");
    } catch (error) {
      notify(apiMessage(error));
    }
  }
  return {
    tab,
    setTab,
    feedTopic,
    setFeedTopic,
    exploreTopic,
    setExploreTopic,
    feedCompany,
    setFeedCompany,
    feedSort,
    setFeedSort,
    posts,
    visiblePosts: posts,
    filteredPosts: posts,
    liked,
    disliked,
    saved,
    reposted,
    hiddenPosts: hidden.data.map((post) => post.id),
    restoreHiddenPosts,
    resetFeedFilters,
    commentPost,
    setCommentPost,
    comments: commentPost ? { [commentPost]: commentList.data } : {},
    commentsLoading: commentList.loading,
    commentsError: commentList.error,
    commentsHasMore: commentList.hasMore,
    loadMoreComments: commentList.loadMore,
    toggleLike: (id: string, current: "like" | "dislike" | null) =>
      react(id, "like", current),
    toggleDislike: (id: string, current: "like" | "dislike" | null) =>
      react(id, "dislike", current),
    toggleBookmark: async (id: string, isSaved: boolean) => {
      if (
        isSaved &&
        !(await confirm({
          title: "Remove from saved posts?",
          confirmLabel: "Remove",
          tone: "danger",
        }))
      )
        return;
      return mutate(id, () =>
        api(`/posts/${id}/bookmark`, {
          method: isSaved ? "DELETE" : "PUT",
        }),
      );
    },
    toggleRepost: async (id: string, isReposted: boolean) => {
      if (
        isReposted &&
        !(await confirm({
          title: "Undo your repost?",
          confirmLabel: "Undo repost",
          tone: "danger",
        }))
      )
        return;
      return mutate(id, async () => {
        await api(`/posts/${id}/repost`, {
          method: isReposted ? "DELETE" : "PUT",
        });
        notify(isReposted ? "Repost undone." : "Post reposted.");
      });
    },
    hidePost: async (id: string) => {
      if (
        !(await confirm({
          title: "Hide this post?",
          message: "You can bring hidden posts back from the feed filters.",
          confirmLabel: "Hide post",
        }))
      )
        return;
      return mutate(id, () => api(`/posts/${id}/hide`, { method: "PUT" }));
    },
    deletePost: async (id: string) => {
      if (
        !(await confirm({
          title: "Delete this post?",
          message: "This permanently deletes the post and its comments.",
          confirmLabel: "Delete post",
          tone: "danger",
        }))
      )
        return;
      return mutate(id, async () => {
        await api(`/posts/${id}`, { method: "DELETE" });
        notify("Post deleted.");
      });
    },
    toggleComments: (id: string) => {
      setCommentPost((current) => (current === id ? null : id));
    },
    feedLoading: list.loading,
    feedError: list.error,
    feedHasMore: list.hasMore,
    loadMorePosts: list.loadMore,
    postPending: pending,
  };
}
