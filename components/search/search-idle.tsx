import { Clock, Hash, X } from "lucide-react";

// Shown when the box is focused but empty: recent searches and quick topics.
export default function SearchIdle({
  id,
  recent,
  topics,
  onPick,
  onTopic,
  onRemove,
  onClear,
}: {
  id: string;
  recent: string[];
  topics: string[];
  onPick: (term: string) => void;
  onTopic: (topic: string) => void;
  onRemove: (term: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="search-dropdown card" id={id}>
      {recent.length > 0 && (
        <div>
          <p className="search-group-title search-group-row">
            Recent
            <button
              type="button"
              className="text-button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={onClear}
            >
              Clear
            </button>
          </p>
          {recent.map((term) => (
            <div className="search-option" key={term}>
              <button
                type="button"
                className="search-option-main"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => onPick(term)}
              >
                <span className="search-option-icon">
                  <Clock size={18} />
                </span>
                <span className="search-option-text">
                  <strong>{term}</strong>
                </span>
              </button>
              <button
                type="button"
                className="icon-button search-option-remove"
                aria-label={`Remove ${term} from recent searches`}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => onRemove(term)}
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
      {topics.length > 0 && (
        <div>
          <p className="search-group-title">Browse topics</p>
          <div className="search-chips">
            {topics.map((topic) => (
              <button
                type="button"
                className="secondary topic-result"
                key={topic}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => onTopic(topic)}
              >
                <Hash size={14} /> {topic}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="search-status">
        Search people, posts, referrals and companies.
      </p>
    </div>
  );
}
