"use client";
// In-memory stale-while-revalidate cache for GET requests. Pages show the last
// known data instantly and refresh it quietly, instead of starting from a spinner.
type Entry = { data: unknown; at: number };
const store = new Map<string, Entry>();
const MAX_ENTRIES = 200;
const MAX_AGE_MS = 10 * 60 * 1000;

export function cacheGet<T>(
  key: string | null,
): { data: T; at: number } | undefined {
  if (!key) return undefined;
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.at > MAX_AGE_MS) {
    store.delete(key);
    return undefined;
  }
  return entry as { data: T; at: number };
}
export function cacheSet(key: string, data: unknown) {
  store.delete(key);
  if (store.size >= MAX_ENTRIES)
    store.delete(store.keys().next().value as string);
  store.set(key, { data, at: Date.now() });
}
// Drop entries whose path starts with one of the changed roots, e.g. "posts".
export function cacheInvalidate(roots: string[]) {
  for (const key of [...store.keys()])
    if (roots.some((root) => key.split("?")[0].startsWith(`/${root}`)))
      store.delete(key);
}
export const cacheClear = () => store.clear();
