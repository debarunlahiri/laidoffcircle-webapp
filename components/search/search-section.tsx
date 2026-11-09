import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export default function SearchSection({
  title,
  onSeeAll,
  children,
}: {
  title: string;
  onSeeAll?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="search-section">
      <div className="section-bar">
        <h2>{title}</h2>
        {onSeeAll && (
          <button className="text-button" onClick={onSeeAll}>
            See all <ArrowRight size={15} />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
