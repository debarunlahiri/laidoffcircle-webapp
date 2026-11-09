import Avatar from "@/components/ui/avatar";
import Skeleton from "@/components/ui/skeleton";
import { userInitials } from "@/providers/auth-provider";
import {
  BriefcaseBusiness,
  Building2,
  FileText,
  Hash,
  Search,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  Suggestion,
  SuggestionGroup,
  SuggestionKind,
} from "./suggestions";

const icons: Record<Exclude<SuggestionKind, "user">, ReactNode> = {
  post: <FileText size={18} />,
  referral: <BriefcaseBusiness size={18} />,
  company: <Building2 size={18} />,
  topic: <Hash size={18} />,
};

function SuggestionRow({
  id,
  item,
  active,
  onChoose,
  onHover,
}: {
  id: string;
  item: Suggestion;
  active: boolean;
  onChoose: () => void;
  onHover: () => void;
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      className={`search-option${active ? " highlighted" : ""}`}
      onPointerDown={(event) => event.preventDefault()}
      onMouseEnter={onHover}
      onClick={onChoose}
    >
      {item.kind === "user" ? (
        <Avatar initials={userInitials(item.label)} src={item.imageUrl} small />
      ) : (
        <span className="search-option-icon">{icons[item.kind]}</span>
      )}
      <span className="search-option-text">
        <strong>{item.label}</strong>
        {item.detail && <small>{item.detail}</small>}
      </span>
    </div>
  );
}

// Presentational dropdown: grouped suggestions plus a "See all results" row.
export default function SearchSuggestions({
  id,
  groups,
  query,
  loading,
  error,
  activeIndex,
  onChoose,
  onHover,
  onSeeAll,
}: {
  id: string;
  groups: SuggestionGroup[];
  query: string;
  loading: boolean;
  error: string;
  activeIndex: number;
  onChoose: (item: Suggestion) => void;
  onHover: (index: number) => void;
  onSeeAll: () => void;
}) {
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  let index = -1;
  return (
    <div className="search-dropdown card" id={id} role="listbox">
      {groups.map((group) => (
        <div key={group.title} role="group" aria-label={group.title}>
          <p className="search-group-title">{group.title}</p>
          {group.items.map((item) => {
            index += 1;
            const position = index;
            return (
              <SuggestionRow
                key={item.key}
                id={`${id}-option-${position}`}
                item={item}
                active={activeIndex === position}
                onChoose={() => onChoose(item)}
                onHover={() => onHover(position)}
              />
            );
          })}
        </div>
      ))}
      {loading && !total && <Skeleton rows={3} label="Searching" />}
      {error && (
        <p className="search-status" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && !total && (
        <p className="search-status">No quick matches for “{query}”.</p>
      )}
      <div
        id={`${id}-option-${total}`}
        role="option"
        aria-selected={activeIndex === total}
        className={`search-option search-see-all${activeIndex === total ? " highlighted" : ""}`}
        onPointerDown={(event) => event.preventDefault()}
        onMouseEnter={() => onHover(total)}
        onClick={onSeeAll}
      >
        <span className="search-option-icon">
          <Search size={18} />
        </span>
        <span className="search-option-text">
          <strong>See all results for “{query}”</strong>
        </span>
      </div>
    </div>
  );
}
