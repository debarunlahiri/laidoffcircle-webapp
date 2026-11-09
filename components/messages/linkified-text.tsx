import { mapsLink } from "@/lib/google-maps";
import type { ReactNode } from "react";

type Kind = "url" | "email" | "address" | "phone";
type Hit = { kind: Kind; start: number; end: number; text: string };

const patterns: [Kind, RegExp][] = [
  ["url", /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi],
  ["email", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
  [
    "address",
    /\b\d{1,5}[A-Z]?(?:[ ,/-]+[A-Z0-9.'#-]+){1,6}?[ ,]+(?:street|st|road|rd|avenue|ave|lane|ln|boulevard|blvd|drive|dr|nagar|colony|sector|marg|highway|hwy|way|court|ct|plaza|block|floor)\b\.?(?:,\s*[A-Z0-9.'#-]+(?: [A-Z0-9.'#-]+){0,2}){0,3}/gi,
  ],
  ["phone", /(?<![\w.])\+?\d[\d\s().-]{7,}\d(?![\w])/g],
];

// Trailing punctuation is usually part of the sentence, not the link.
function trimEnd(text: string) {
  const match = text.match(/[.,;:!?)\]]+$/);
  return match ? text.slice(0, -match[0].length) : text;
}

function find(text: string): Hit[] {
  const hits: Hit[] = [];
  for (const [kind, pattern] of patterns) {
    for (const match of text.matchAll(pattern)) {
      let value = kind === "phone" ? match[0] : trimEnd(match[0]);
      // Stop an address before the sentence carries on ("... London on Friday").
      if (kind === "address")
        value = value.replace(
          /\s+(?:on|at|and|or|the|to|from|by|for|with|please|call|me|is)\b.*$/i,
          "",
        );
      if (kind === "phone") {
        const digits = value.replace(/\D/g, "").length;
        // Skip dates, ids and short numbers.
        if (digits < (value.startsWith("+") ? 8 : 10) || digits > 15) continue;
      }
      const start = match.index ?? 0;
      hits.push({
        kind,
        start,
        end: start + value.length,
        text: value,
      });
    }
  }
  // Earlier and longer matches win when two overlap (a URL containing digits).
  hits.sort((a, b) => a.start - b.start || b.end - a.end);
  const chosen: Hit[] = [];
  for (const hit of hits)
    if (!chosen.length || hit.start >= chosen[chosen.length - 1].end)
      chosen.push(hit);
  return chosen;
}

function href(hit: Hit) {
  if (hit.kind === "url")
    return /^https?:\/\//i.test(hit.text) ? hit.text : `https://${hit.text}`;
  if (hit.kind === "email") return `mailto:${hit.text}`;
  if (hit.kind === "phone") return `tel:${hit.text.replace(/[^\d+]/g, "")}`;
  return mapsLink(hit.text);
}

// Message text with links, emails, phone numbers and street addresses made
// tappable. Built from React nodes only, so message text is never parsed as HTML.
export default function LinkifiedText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const hit of find(text)) {
    if (hit.start > cursor) nodes.push(text.slice(cursor, hit.start));
    const external = hit.kind === "url" || hit.kind === "address";
    nodes.push(
      <a
        key={hit.start}
        className={`msg-link msg-link-${hit.kind}`}
        href={href(hit)}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        title={
          hit.kind === "address"
            ? "Open in Google Maps"
            : hit.kind === "phone"
              ? "Call this number"
              : hit.kind === "email"
                ? "Send an email"
                : "Open link"
        }
      >
        {hit.text}
      </a>,
    );
    cursor = hit.end;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}
