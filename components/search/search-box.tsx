"use client";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { useSearchOverview, minSearchLength } from "@/hooks/use-search";
import { usePlatform } from "@/providers/platform-provider";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import SearchIdle from "./search-idle";
import SearchSuggestions from "./search-suggestions";
import { buildSuggestions, searchHref, type Suggestion } from "./suggestions";

export default function SearchBox() {
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { setExploreTopic, navigate, postTopics } = usePlatform();
  const recent = useRecentSearches();
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const { term, results, loading, error } = useSearchOverview(value, 4, 250);

  // Keep the box in sync with the results page's query.
  const urlQuery = pathname === "/search" ? (params.get("q") ?? "") : null;
  useEffect(() => {
    if (urlQuery !== null) setValue(urlQuery);
  }, [urlQuery]);

  const groups = useMemo(
    () => buildSuggestions(results, term),
    [results, term],
  );
  const flat = groups.flatMap((group) => group.items);
  const ready = value.trim().length >= minSearchLength;
  const showDropdown = open && ready;
  const showIdle =
    open && !value.trim() && (recent.items.length > 0 || postTopics.length > 0);

  function close() {
    setOpen(false);
    setActive(-1);
  }
  function seeAll(term = value.trim()) {
    if (term.length < minSearchLength) return;
    recent.add(term);
    setValue(term);
    router.push(searchHref(term));
    close();
  }
  function pickTopic(topic: string) {
    close();
    setExploreTopic(topic);
    navigate("Explore");
  }

  // Press "/" anywhere (outside a field) to jump to search.
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (
        event.key !== "/" ||
        event.metaKey ||
        event.ctrlKey ||
        target.closest("input, textarea, select, [contenteditable]")
      )
        return;
      event.preventDefault();
      input.current?.focus();
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  function choose(item: Suggestion) {
    if (value.trim().length >= minSearchLength) recent.add(value.trim());
    close();
    if (item.topic) {
      setExploreTopic(item.topic);
      navigate("Explore");
    } else if (item.href) router.push(item.href);
  }

  return (
    <div
      className="topbar-search search-combobox"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
    >
      <label className="search-box">
        <Search size={17} />
        <input
          ref={input}
          role="combobox"
          aria-label="Search the community"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? `${id}-list` : undefined}
          aria-activedescendant={
            showDropdown && active >= 0
              ? `${id}-list-option-${active}`
              : undefined
          }
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Search LaidOffCircle  ( / )"
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setValue(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            const last = flat.length; // the "See all" row
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              if (!ready) return;
              event.preventDefault();
              setOpen(true);
              setActive((current) =>
                event.key === "ArrowDown"
                  ? current >= last
                    ? 0
                    : current + 1
                  : current <= 0
                    ? last
                    : current - 1,
              );
            } else if (event.key === "Enter") {
              event.preventDefault();
              if (showDropdown && active >= 0 && active < flat.length)
                choose(flat[active]);
              else seeAll();
            } else if (event.key === "Escape") {
              close();
            }
          }}
        />
        {value && (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setValue("");
              setActive(-1);
              setOpen(true);
              input.current?.focus();
              if (pathname === "/search") router.replace("/search");
            }}
          >
            <X size={15} />
          </button>
        )}
      </label>
      {showIdle && (
        <SearchIdle
          id={`${id}-idle`}
          recent={recent.items}
          topics={postTopics}
          onPick={(term) => seeAll(term)}
          onTopic={pickTopic}
          onRemove={recent.remove}
          onClear={recent.clear}
        />
      )}
      {showDropdown && (
        <SearchSuggestions
          id={`${id}-list`}
          groups={groups}
          query={value.trim()}
          loading={loading || term !== value.trim()}
          error={error}
          activeIndex={active}
          onChoose={choose}
          onHover={setActive}
          onSeeAll={() => seeAll()}
        />
      )}
    </div>
  );
}
