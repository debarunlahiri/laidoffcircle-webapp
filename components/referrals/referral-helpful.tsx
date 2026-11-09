"use client";
import { helpfulRate, isTopRated } from "@/lib/referral-meta";
import type { ReferralOpportunity } from "@/types";
import { usePlatform } from "@/providers/platform-provider";
import { BadgeCheck, ThumbsDown, ThumbsUp } from "lucide-react";

// Shows how helpful this referrer has been and lets people they helped say so.
export default function ReferralHelpful({
  item,
}: {
  item: ReferralOpportunity;
}) {
  const { referralFeedback, rateReferral } = usePlatform();
  const live = item.id ? referralFeedback[item.id] : undefined;
  const mine = live ? live.myFeedback : item.myFeedback;
  const helpful = live ? live.helpfulCount : item.helpfulCount;
  const notHelpful = live ? live.notHelpfulCount : item.notHelpfulCount;
  const rate = helpfulRate(item.authorHelpful, item.authorVotes);
  const canRate = Boolean(item.id && item.requestStatus && !item.own);

  return (
    <div className="referral-trust">
      <div className="trust-summary">
        <span className={`trust-score ${rate === null ? "unrated" : ""}`}>
          <ThumbsUp size={14} />
          {rate === null ? "Not rated yet" : `${rate}% helpful`}
          <small>
            {item.authorVotes === 0
              ? "No ratings for this referrer"
              : `${item.authorVotes} rating${item.authorVotes === 1 ? "" : "s"} for ${item.person.split(" ")[0]}`}
          </small>
        </span>
        {isTopRated(item.authorHelpful, item.authorVotes) && (
          <span className="tag top-rated-tag">
            <BadgeCheck size={13} /> Top referrer
          </span>
        )}
      </div>
      <div
        className="trust-votes"
        role="group"
        aria-label={`Was ${item.person} helpful with this referral?`}
      >
        {canRate && (
          <span className="trust-question">Was this referral helpful?</span>
        )}
        <button
          type="button"
          className={mine === "helpful" ? "voted" : ""}
          aria-pressed={mine === "helpful"}
          disabled={!canRate}
          title={
            canRate
              ? "This referrer helped me"
              : item.own
                ? "You cannot rate your own referral"
                : "Request this referral to rate it"
          }
          onClick={() =>
            item.id &&
            void rateReferral(item.id, mine === "helpful" ? null : true)
          }
        >
          <ThumbsUp size={14} /> Helpful <b>{helpful}</b>
        </button>
        <button
          type="button"
          className={mine === "not_helpful" ? "voted negative" : ""}
          aria-pressed={mine === "not_helpful"}
          disabled={!canRate}
          title={
            canRate
              ? "This referrer did not help"
              : item.own
                ? "You cannot rate your own referral"
                : "Request this referral to rate it"
          }
          onClick={() =>
            item.id &&
            void rateReferral(item.id, mine === "not_helpful" ? null : false)
          }
        >
          <ThumbsDown size={14} /> Not helpful <b>{notHelpful}</b>
        </button>
      </div>
    </div>
  );
}
