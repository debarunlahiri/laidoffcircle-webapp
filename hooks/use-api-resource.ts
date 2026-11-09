"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, apiMessage } from "@/lib/api";
import { cacheGet, cacheSet } from "@/lib/cache";
// Ignore superseded requests without aborting fetch during React effect cleanup.
type PendingRequest = { cancelled: boolean };

function cancelRequest(request: PendingRequest | null) {
  if (request) request.cancelled = true;
}

export function useApiResource<T>(path: string | null, initial: T, pollMs = 0) {
  // Last known data for this path (if any) is shown immediately and refreshed quietly.
  const hit = cacheGet<T>(path);
  const [resolvedPath, setResolvedPath] = useState<string | null>(
    hit ? path : null,
  );
  const initialRef = useRef(initial);
  const [data, setData] = useState<T>(hit ? hit.data : initial);
  const [loading, setLoading] = useState(Boolean(path) && !hit);
  const [error, setError] = useState("");
  const controller = useRef<PendingRequest | null>(null);
  const reload = useCallback(async () => {
    cancelRequest(controller.current);
    const active: PendingRequest = { cancelled: false };
    controller.current = active;
    if (!path) {
      setData(initialRef.current);
      setLoading(false);
      setError("");
      return;
    }
    const cached = cacheGet<T>(path);
    if (cached) {
      setData(cached.data);
      setResolvedPath(path);
      setLoading(false);
    } else setLoading(true);
    setError("");
    try {
      const result = await api<T>(path);
      if (!active.cancelled) {
        setData(result);
        setResolvedPath(path);
        cacheSet(path, result);
      }
    } catch (error) {
      // A failed quiet refresh keeps showing the cached data instead of an error.
      if (!active.cancelled && !cached) setError(apiMessage(error));
    } finally {
      if (!active.cancelled) setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    const cached = cacheGet<T>(path);
    setData(cached ? cached.data : initialRef.current);
    void reload();
    return () => cancelRequest(controller.current);
  }, [reload, path]);
  useEffect(() => {
    const change = (event: Event) => {
      const roots = (event as CustomEvent<string[]>).detail;
      if (
        path &&
        roots.some((root) => path.split("?")[0].startsWith(`/${root}`))
      )
        void reload();
    };
    window.addEventListener("api:changed", change);
    const interval =
      pollMs && path
        ? setInterval(() => {
            if (document.visibilityState === "visible") void reload();
          }, pollMs)
        : null;
    // Coming back to the tab refreshes right away instead of waiting for the next tick.
    const wake = () => {
      if (document.visibilityState === "visible") void reload();
    };
    if (pollMs && path) document.addEventListener("visibilitychange", wake);
    return () => {
      window.removeEventListener("api:changed", change);
      document.removeEventListener("visibilitychange", wake);
      if (interval) clearInterval(interval);
    };
  }, [path, reload, pollMs]);
  return {
    data: resolvedPath === path ? data : hit ? hit.data : initialRef.current,
    setData,
    loading: hit && resolvedPath !== path ? false : loading,
    error,
    reload,
  };
}
type ListEntry<T> = { rows: T[]; hasMore: boolean };
function itemKey(item: unknown) {
  const row = item as { id?: string; userId?: string };
  return row.id ?? row.userId;
}
export function useApiList<T>(path: string | null, pollMs = 0) {
  // The first page of each list is cached so revisiting a screen is instant.
  const hit = cacheGet<ListEntry<T>>(path);
  const [resolvedPath, setResolvedPath] = useState<string | null>(
    hit ? path : null,
  );
  const [data, setData] = useState<T[]>(hit ? hit.data.rows : []);
  const [loading, setLoading] = useState(Boolean(path) && !hit);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(hit ? hit.data.hasMore : false);
  const active = useRef<PendingRequest | null>(null);
  const rows = useRef<T[]>(hit ? hit.data.rows : []);
  const busy = useRef(false);
  const pageSize = 50;
  const load = useCallback(
    async (more = false, preserve = false, quiet = false) => {
      if (more && busy.current) return;
      if (!path) {
        setData([]);
        rows.current = [];
        setHasMore(false);
        setLoading(false);
        setError("");
        return;
      }
      cancelRequest(active.current);
      const controller: PendingRequest = { cancelled: false };
      active.current = controller;
      busy.current = true;
      setLoading(!quiet);
      setError("");
      const offset = more ? rows.current.length : 0;
      try {
        const result = await api<T[]>(
          `${path}${path.includes("?") ? "&" : "?"}limit=${pageSize}&offset=${offset}`,
        );
        if (!controller.cancelled) {
          const identifiers = new Set(result.map((item) => itemKey(item)));
          rows.current = more
            ? [
                ...rows.current,
                ...result.filter(
                  (item) =>
                    !rows.current.some(
                      (existing) => itemKey(existing) === itemKey(item),
                    ),
                ),
              ]
            : preserve
              ? [
                  ...result,
                  ...rows.current.filter(
                    (item) => !identifiers.has(itemKey(item)),
                  ),
                ]
              : result;
          setData(rows.current);
          setResolvedPath(path);
          setHasMore(result.length === pageSize);
          if (!more)
            cacheSet(path, {
              rows: rows.current,
              hasMore: result.length === pageSize,
            });
        }
      } catch (error) {
        if (!controller.cancelled && !quiet) setError(apiMessage(error));
      } finally {
        if (!controller.cancelled) {
          setLoading(false);
          busy.current = false;
        }
      }
    },
    [path],
  );
  useEffect(() => {
    const cached = cacheGet<ListEntry<T>>(path);
    rows.current = cached ? cached.data.rows : [];
    setData(rows.current);
    setHasMore(cached ? cached.data.hasMore : false);
    if (cached) setResolvedPath(path);
    void load(false, false, Boolean(cached));
    return () => cancelRequest(active.current);
  }, [load, path]);
  useEffect(() => {
    const change = (event: Event) => {
      const roots = (event as CustomEvent<string[]>).detail;
      if (
        path &&
        roots.some((root) => path.split("?")[0].startsWith(`/${root}`))
      )
        void load(false, pollMs > 0);
    };
    window.addEventListener("api:changed", change);
    const timer =
      pollMs && path
        ? setInterval(() => {
            if (document.visibilityState === "visible") void load(false, true);
          }, pollMs)
        : null;
    const wake = () => {
      if (document.visibilityState === "visible") void load(false, true);
    };
    if (pollMs && path) document.addEventListener("visibilitychange", wake);
    return () => {
      window.removeEventListener("api:changed", change);
      document.removeEventListener("visibilitychange", wake);
      if (timer) clearInterval(timer);
    };
  }, [path, load, pollMs]);
  return {
    data: resolvedPath === path ? data : hit ? hit.data.rows : [],
    loading: hit && resolvedPath !== path ? false : loading,
    error,
    hasMore,
    loadMore: () => load(true),
    reload: () => load(false),
  };
}
export function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
