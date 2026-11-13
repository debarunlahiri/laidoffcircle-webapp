"use client";
import PillTabs from "@/components/ui/pill-tabs";
import BottomSheet from "@/components/ui/bottom-sheet";
import { useState } from "react";
import { feedTabs } from "@/config/feed";
import PostCard from "@/components/feed/post-card";
import { usePlatform } from "@/providers/platform-provider";
import {
  ArrowRight,
  Bookmark,
  Globe2,
  Settings2,
  Sparkles,
  MessageCircle,
} from "lucide-react";

export default function FeedView() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    section,
    tab,
    setTab,
    navigate,
    filteredPosts,
    companies,
    feedLoading,
    feedError,
    feedHasMore,
    loadMorePosts,
    feedTopic,
    setFeedTopic,
    feedCompany,
    setFeedCompany,
    feedSort,
    setFeedSort,
    resetFeedFilters,
    hiddenPosts,
    restoreHiddenPosts,
    setSearch,
    postTopics,
  } = usePlatform();

  return (
    <>
      <div className="feed-toolbar">
        <PillTabs
          label="Feed view"
          items={feedTabs.map((item) => ({
            key: item,
            label: item,
            icon: item === "For you" ? <Sparkles size={14} /> : undefined,
          }))}
          active={tab}
          onChange={setTab}
        />
        <div className="control-popover">
          <button
            type="button"
            className="icon-button"
            aria-label="Feed filters"
            aria-haspopup="dialog"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen(true)}
          >
            <Settings2 size={17} />
          </button>
        </div>
      </div>
      {filtersOpen && (
        <BottomSheet title="Feed filters" onClose={() => setFiltersOpen(false)}>
          <div className="feed-filter-fields">
            <label>
              Topic
              <select
                value={feedTopic}
                onChange={(event) => setFeedTopic(event.target.value)}
              >
                <option value="">All topics</option>
                {postTopics.map((topic) => (
                  <option key={topic}>{topic}</option>
                ))}
              </select>
            </label>
            <label>
              Company
              <select
                value={feedCompany}
                onChange={(event) => setFeedCompany(event.target.value)}
              >
                <option value="">All companies</option>
                {companies.map((company) => (
                  <option value={company.id} key={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sort by
              <select
                value={tab === "Latest" ? "Latest" : feedSort}
                onChange={(event) => {
                  setFeedSort(event.target.value);
                  if (tab === "Latest") setTab("For you");
                }}
              >
                <option>Latest</option>
                <option>Most liked</option>
              </select>
            </label>
            <div className="filter-panel-actions">
              <button className="text-button" onClick={resetFeedFilters}>
                Reset filters
              </button>
              <button className="primary" onClick={() => setFiltersOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </BottomSheet>
      )}
      {(feedTopic ||
        feedCompany ||
        feedSort !== "Latest" ||
        hiddenPosts.length > 0) && (
        <div className="feed-filter-status">
          <span>
            {[
              feedTopic,
              companies.find((company) => company.id === feedCompany)?.name,
              feedSort !== "Latest" && tab !== "Latest" ? feedSort : "",
            ]
              .filter(Boolean)
              .join(" · ") || "Feed preferences"}
          </span>
          <button
            className="text-button"
            onClick={() => {
              resetFeedFilters();
              void restoreHiddenPosts();
            }}
          >
            Reset
            {hiddenPosts.length > 0
              ? ` and restore ${hiddenPosts.length} hidden posts`
              : " filters"}
          </button>
        </div>
      )}
      <div className="feed-label">
        <span>
          {section === "Bookmarks"
            ? "YOUR SAVED CONVERSATIONS"
            : tab === "Latest"
              ? "THE LATEST FROM YOUR COMMUNITY"
              : "CONVERSATIONS THAT BRING US TOGETHER"}
        </span>
        <span>
          <Globe2 size={12} /> Global feed
        </span>
      </div>
      {filteredPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {feedLoading && (
        <p role="status" className="subtle-text">
          Loading posts…
        </p>
      )}
      {feedError && (
        <p role="alert" className="api-error">
          {feedError}
        </p>
      )}
      {feedHasMore && (
        <button
          className="secondary"
          disabled={feedLoading}
          onClick={() => void loadMorePosts()}
        >
          Load more posts
        </button>
      )}
      {!feedLoading && !feedError && !filteredPosts.length && (
        <div className="empty card">
          {section === "Bookmarks" ? (
            <Bookmark size={28} />
          ) : (
            <MessageCircle size={28} />
          )}
          <h3>
            {section === "Bookmarks"
              ? "A place for the posts you love."
              : "No conversations here yet."}
          </h3>
          <p>
            {section === "Bookmarks"
              ? "Bookmark a post in the global feed to find it here."
              : "Try another feed filter or start a conversation."}
          </p>
          <button
            className="text-button"
            onClick={() => {
              navigate("Home");
              setTab("For you");
              resetFeedFilters();
              setSearch("");
            }}
          >
            Explore the feed <ArrowRight size={16} />
          </button>
        </div>
      )}
    </>
  );
}
