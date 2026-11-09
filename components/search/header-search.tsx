"use client";

import { useRecentSearches } from "@/hooks/use-recent-searches";
import { minSearchLength } from "@/hooks/use-search";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { searchHref } from "./suggestions";

export default function HeaderSearch({ onCancel }: { onCancel: () => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") ?? "";
  const [value, setValue] = useState(query);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recent = useRecentSearches();

  function stopPendingSearch() {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }

  useEffect(() => {
    setValue(query);
    return stopPendingSearch;
  }, [query]);

  function search(next: string) {
    const term = next.trim();
    router.replace(term ? searchHref(term) : "/search", { scroll: false });
  }

  function cancel() {
    stopPendingSearch();
    onCancel();
  }

  return (
    <form
      className="header-search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        stopPendingSearch();
        search(value);
        if (value.trim().length >= minSearchLength) recent.add(value.trim());
        input.current?.blur();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          cancel();
        }
      }}
    >
      <div className="header-search-field">
        <Search size={20} aria-hidden="true" />
        <input
          ref={input}
          autoFocus
          type="search"
          enterKeyHint="search"
          aria-label="Search the community"
          placeholder="Search LaidoffCircle"
          autoComplete="off"
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            setValue(next);
            stopPendingSearch();
            timer.current = setTimeout(() => search(next), 300);
          }}
        />
        {value && (
          <button
            type="button"
            className="icon-button"
            aria-label="Clear search"
            onClick={() => {
              stopPendingSearch();
              setValue("");
              search("");
              input.current?.focus();
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>
      <button type="button" className="text-button" onClick={cancel}>
        Cancel
      </button>
    </form>
  );
}
