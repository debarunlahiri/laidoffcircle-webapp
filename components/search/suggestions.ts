import type { ApiSearchResults } from "@/lib/api-types";

export type SuggestionKind = "user" | "post" | "referral" | "company" | "topic";
export type Suggestion = {
  key: string;
  kind: SuggestionKind;
  label: string;
  detail?: string;
  initials?: string;
  imageUrl?: string | null;
  // Where choosing the suggestion goes.
  href?: string;
  topic?: string;
};
export type SuggestionGroup = { title: string; items: Suggestion[] };

const clip = (text: string, length = 70) =>
  text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;

export const searchHref = (query: string, type?: string) =>
  `/search?q=${encodeURIComponent(query)}${type ? `&type=${type}` : ""}`;

// Turns API results into grouped, keyboard-navigable suggestions.
export function buildSuggestions(
  results: ApiSearchResults,
  query: string,
): SuggestionGroup[] {
  const groups: SuggestionGroup[] = [
    {
      title: "People",
      items: results.users.map((user) => ({
        key: `user-${user.id}`,
        kind: "user",
        label: user.name,
        detail: user.role,
        imageUrl: user.profileImageUrl,
        href: `/users/${user.id}`,
      })),
    },
    {
      title: "Posts",
      items: results.posts.map((post) => ({
        key: `post-${post.id}`,
        kind: "post",
        label: post.text ? clip(post.text) : "Photo post",
        detail: [post.topic, post.name].filter(Boolean).join(" · "),
        href: searchHref(query, "posts"),
      })),
    },
    {
      title: "Referrals",
      items: results.referrals.map((item) => ({
        key: `referral-${item.id}`,
        kind: "referral",
        label: item.title,
        detail: [item.company, item.location].filter(Boolean).join(" · "),
        href: searchHref(query, "referrals"),
      })),
    },
    {
      title: "Companies",
      items: results.companies.map((company) => ({
        key: `company-${company.id}`,
        kind: "company",
        label: company.name,
        href: searchHref(company.name),
      })),
    },
    {
      title: "Topics",
      items: results.topics.map((topic) => ({
        key: `topic-${topic}`,
        kind: "topic",
        label: topic,
        topic,
      })),
    },
  ];
  return groups.filter((group) => group.items.length > 0);
}
