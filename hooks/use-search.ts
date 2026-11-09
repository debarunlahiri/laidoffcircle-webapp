"use client";
import { api, apiMessage, queryPath } from "@/lib/api";
import type { ApiSearchResults, SearchGroup } from "@/lib/api-types";
import { useEffect, useRef, useState } from "react";
import { useApiResource, useDebouncedValue } from "./use-api-resource";

export const emptyResults: ApiSearchResults = {
  users: [],
  posts: [],
  referrals: [],
  companies: [],
  topics: [],
};
export const minSearchLength = 2;

// Search shows posts, referrals and people, so refresh when any of them change.
const watched = ["posts", "referrals", "users", "connections"];
function onRelatedChange(refresh: () => void) {
  const handler = (event: Event) => {
    const roots = (event as CustomEvent<string[]>).detail;
    if (roots.some((root) => watched.includes(root))) refresh();
  };
  window.addEventListener("api:changed", handler);
  return () => window.removeEventListener("api:changed", handler);
}

// A few results per group, for the autocomplete dropdown and the "All" tab.
export function useSearchOverview(query: string, perGroup: number, wait = 0) {
  const term = useDebouncedValue(query.trim(), wait || 1);
  const active = term.length >= minSearchLength;
  const result = useApiResource<ApiSearchResults>(
    active ? queryPath("/search", { q: term, perGroup }) : null,
    emptyResults,
  );
  const { reload } = result;
  useEffect(
    () => (active ? onRelatedChange(() => void reload()) : undefined),
    [active, reload],
  );
  return {
    term,
    results: active ? result.data : emptyResults,
    loading: active && result.loading,
    error: active ? result.error : "",
  };
}

// One paginated group, for a single results tab.
export function useSearchGroup(
  query: string,
  group: Exclude<SearchGroup, "topics">,
) {
  const pageSize = 20;
  const term = query.trim();
  const [rows, setRows] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  // Ignore out-of-date responses instead of aborting requests, so a
  // superseded search never surfaces as a runtime AbortError.
  const latest = useRef(0);

  async function load(offset: number) {
    const id = ++latest.current;
    setLoading(true);
    setError("");
    try {
      const result = await api<ApiSearchResults>(
        queryPath("/search", { q: term, type: group, limit: pageSize, offset }),
      );
      if (id !== latest.current) return;
      const page = result[group] as unknown[];
      setRows((current) => (offset ? [...current, ...page] : page));
      setHasMore(page.length === pageSize);
    } catch (err) {
      if (id === latest.current) setError(apiMessage(err));
    } finally {
      if (id === latest.current) setLoading(false);
    }
  }

  useEffect(() => {
    setRows([]);
    setHasMore(false);
    if (term.length >= minSearchLength) void load(0);
    else setLoading(false);
    return () => {
      latest.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, group]);

  useEffect(
    () =>
      term.length >= minSearchLength
        ? onRelatedChange(() => void load(0))
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [term, group],
  );

  return {
    rows,
    loading,
    error,
    hasMore,
    loadMore: () => load(rows.length),
  };
}
