import SearchResultsView from "@/components/search/search-results-view";
import { Suspense } from "react";

export default function SearchPage() {
  return (
    <Suspense fallback={<p role="status">Loading results…</p>}>
      <SearchResultsView />
    </Suspense>
  );
}
