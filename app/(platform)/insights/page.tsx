import type { Metadata } from "next";
import { pageMetadata } from "@/lib/share-metadata";
import InsightsView from "@/components/insights/insights-view";

export const metadata: Metadata = pageMetadata({
  title: "Workforce insights · LaidOffCircle",
  description:
    "A clearer view of the workforce: layoff and hiring trends shared with the LaidOffCircle community.",
  path: "/insights",
});

export default function InsightsPage() {
  return <InsightsView />;
}
