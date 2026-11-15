import type { Metadata } from "next";
import { pageMetadata } from "@/lib/share-metadata";
import ExploreView from "@/components/explore/explore-view";

export const metadata: Metadata = pageMetadata({
  title: "Explore topics and conversations · LaidOffCircle",
  description:
    "Find your people and your path: trending topics and conversations from people rebuilding after a layoff.",
  path: "/explore",
});

export default function ExplorePage() {
  return <ExploreView />;
}
