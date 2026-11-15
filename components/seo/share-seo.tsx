import JsonLd from "@/components/seo/json-ld";
import { loadShare, type ShareKind } from "@/lib/share-metadata";

// Pages render their content in the browser, so crawlers that do not run
// JavaScript would see an empty shell. This adds the same text, server-rendered,
// plus structured data. Only indexable content gets the text; anonymous posts,
// private profiles and closed referrals get neither.
const offscreen = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  border: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;

export default async function ShareSeo({
  kind,
  id,
}: {
  kind: ShareKind;
  id: string;
}) {
  const card = await loadShare(kind, id);
  if (!card?.indexable) return null;
  return (
    <>
      {card.jsonLd ? <JsonLd data={card.jsonLd} /> : null}
      {card.body ? (
        <article aria-hidden="true" style={offscreen}>
          <h2>{card.title}</h2>
          {card.byline ? <p>{card.byline}</p> : null}
          <p>{card.body}</p>
          {card.facts.length ? <p>{card.facts.join(" · ")}</p> : null}
        </article>
      ) : null}
    </>
  );
}
