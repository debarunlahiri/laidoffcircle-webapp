"use client";
import { useCallback, useEffect, useState } from "react";

const key = "laidoffcircle:recent-searches";
const limit = 6;

// Per-viewer convenience only; storage may be blocked, so every access is guarded.
function read(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(raw)
      ? raw.filter((item) => typeof item === "string").slice(0, limit)
      : [];
  } catch {
    return [];
  }
}
function write(items: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}

export function useRecentSearches() {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => setItems(read()), []);
  const add = useCallback((term: string) => {
    const next = [
      term,
      ...read().filter((item) => item.toLowerCase() !== term.toLowerCase()),
    ].slice(0, limit);
    write(next);
    setItems(next);
  }, []);
  const remove = useCallback((term: string) => {
    const next = read().filter((item) => item !== term);
    write(next);
    setItems(next);
  }, []);
  const clear = useCallback(() => {
    write([]);
    setItems([]);
  }, []);
  return { items, add, remove, clear };
}
