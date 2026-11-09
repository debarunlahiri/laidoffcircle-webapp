"use client";
import {
  emptyResults,
  minSearchLength,
  useSearchGroup,
  useSearchOverview,
} from "@/hooks/use-search";
import type { SearchGroup } from "@/lib/api-types";
import { SearchX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Skeleton from "@/components/ui/skeleton";
import ResultGroup from "./result-group";
import SearchSection from "./search-section";
import PillTabs from "@/components/ui/pill-tabs";
import { searchHref } from "./suggestions";

type SearchTab = SearchGroup | "all";

const searchTabs: { key: SearchTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "users", label: "People" },
  { key: "posts", label: "Posts" },
  { key: "referrals", label: "Referrals" },
  { key: "companies", label: "Companies" },
  { key: "topics", label: "Topics" },
];

// "#tag" searches only relate to content, not to people or companies.
const hashtagTabs: SearchTab[] = ["all", "posts", "referrals", "topics"];
const isHashtag = (query: string) => /^#[\p{L}\p{N}_]+$/u.test(query);

const groupTitles: Record<SearchGroup, string> = {
  users: "People",
  posts: "Posts",
  referrals: "Referrals",
  companies: "Companies",
  topics: "Topics",
};
const groupOrder: SearchGroup[] = [
  "users",
  "posts",
  "referrals",
  "companies",
  "topics",
];

function EmptyState({ message }: { message: string }) {
  return (
    <p className="empty card search-empty">
      <SearchX size={26} />
      {message}
    </p>
  );
}

// One tab showing every match for a single type, with pagination.
function GroupResults({ query, group }: { query: string; group: SearchGroup }) {
  const paged = group !== "topics";
  const list = useSearchGroup(query, paged ? group : "users");
  const overview = useSearchOverview(paged ? "" : query, 10);

  const items = paged ? list.rows : overview.results.topics;
  const loading = paged ? list.loading : overview.loading;
  const error = paged ? list.error : overview.error;
  return (
    <>
      {items.length > 0 && <ResultGroup group={group} items={items} />}
      {loading && !items.length && <Skeleton rows={4} label="Searching" />}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          message={`No ${groupTitles[group].toLowerCase()} match “${query}”.`}
        />
      )}
      {paged && list.hasMore && (
        <button
          className="secondary"
          disabled={list.loading}
          onClick={list.loadMore}
        >
          Load more
        </button>
      )}
    </>
  );
}

// The "All" tab: a few matches from every group.
function AllResults({
  query,
  onSeeAll,
}: {
  query: string;
  onSeeAll: (tab: SearchTab) => void;
}) {
  const { results, loading, error } = useSearchOverview(query, 6);
  const nonEmpty = groupOrder.filter(
    (group) =>
      results[group].length > 0 &&
      !(isHashtag(query) && (group === "users" || group === "companies")),
  );
  return (
    <>
      {nonEmpty.map((group) => (
        <SearchSection
          key={group}
          title={groupTitles[group]}
          onSeeAll={() => onSeeAll(group === "users" ? "users" : group)}
        >
          <ResultGroup group={group} items={results[group]} />
        </SearchSection>
      ))}
      {loading && !nonEmpty.length && <Skeleton rows={5} label="Searching" />}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && !nonEmpty.length && (
        <EmptyState
          message={`Nothing matches “${query}” yet. Try a different word.`}
        />
      )}
    </>
  );
}

export default function SearchResultsView() {
  const params = useSearchParams();
  const router = useRouter();
  const query = (params.get("q") ?? "").trim();
  const requested = params.get("type") as SearchTab | null;
  const tabs = isHashtag(query)
    ? searchTabs.filter((item) => hashtagTabs.includes(item.key))
    : searchTabs;
  const tab: SearchTab = tabs.some((item) => item.key === requested)
    ? (requested as SearchTab)
    : "all";
  const go = (next: SearchTab) =>
    router.push(searchHref(query, next === "all" ? undefined : next));

  if (query.length < minSearchLength)
    return (
      <EmptyState message="Type at least two characters to search people, posts, referrals and companies." />
    );

  return (
    <>
      <div className="section-bar">
        <h2>Results for “{query}”</h2>
      </div>
      <PillTabs
        label="Result types"
        items={tabs}
        active={tab}
        onChange={go}
      />
      {tab === "all" ? (
        <AllResults query={query} onSeeAll={go} />
      ) : (
        <GroupResults
          key={JSON.stringify([tab, query])}
          query={query}
          group={tab}
        />
      )}
    </>
  );
}
