import type { ApiReferral } from "@/lib/api-types";
import type { ReferralOpportunity } from "@/types";

// Converts an API referral into the shape the UI components render.
// MariaDB returns COUNT() values as strings, so numbers are normalised here.
export function toOpportunity(item: ApiReferral): ReferralOpportunity {
  return {
    ...item,
    own: Boolean(item.own),
    letter: item.company[0]?.toUpperCase() ?? "",
    color: "purple",
    requestFields: item.requestFields ?? [],
    myFeedback: item.myFeedback ?? null,
    requestCount: Number(item.requestCount ?? 0),
    helpfulCount: Number(item.helpfulCount ?? 0),
    shares: Number(item.shares ?? 0),
    notHelpfulCount: Number(item.notHelpfulCount ?? 0),
    authorVotes: Number(item.authorVotes ?? 0),
    authorHelpful: Number(item.authorHelpful ?? 0),
  };
}
