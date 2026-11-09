"use client";
import Avatar from "@/components/ui/avatar";
import Popover from "@/components/ui/popover";
import ReferralHelpful from "@/components/referrals/referral-helpful";
import { mapsLink } from "@/lib/google-maps";
import { api, invalidate, requireSignIn } from "@/lib/api";
import { levelLabels, postedAgo, workModeLabels } from "@/lib/referral-meta";
import { useAuth } from "@/providers/auth-provider";
import { useConfirm } from "@/providers/confirm-provider";
import { usePlatform } from "@/providers/platform-provider";
import type { ReferralOpportunity } from "@/types";
import RichText from "@/components/ui/rich-text";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import {
  ArrowUpRight,
  Building2,
  Check,
  Clock,
  ExternalLink,
  FileText,
  Globe2,
  Layers,
  Ellipsis,
  Lock,
  MapPin,
  RotateCcw,
  Share2,
  Trash2,
  Users,
} from "lucide-react";

export default function ReferralCard({
  item,
  full = false,
}: {
  item: ReferralOpportunity;
  full?: boolean;
}) {
  const router = useRouter();
  const referralHref = item.id
    ? `/referrals/${encodeURIComponent(item.id)}`
    : null;
  const previewHref = full ? null : referralHref;
  // Long write-ups collapse in the list and show in full on the referral page.
  const descClamped =
    !full &&
    Boolean(item.description) &&
    ((item.description ?? "").length > 320 ||
      (item.description ?? "").split("\n").length > 6);
  const { user } = useAuth();
  const {
    setReferralStatus,
    setRequestReferralId,
    setRequestTarget,
    withdrawRequest,
    deleteReferral,
    referralPending,
    notify,
  } = usePlatform();
  const confirm = useConfirm();
  const busy = Boolean(item.id && referralPending.includes(item.id));
  const closed = item.status === "closed";
  const asks = item.requestFields.length;
  const needsFile = item.requestFields.some((field) => field.type === "file");
  const initials = item.person
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function openReferral(event: MouseEvent<HTMLElement>) {
    const { target, currentTarget } = event;
    if (
      !previewHref ||
      event.defaultPrevented ||
      !(target instanceof Element) ||
      !currentTarget.contains(target) ||
      target.closest(
        'a, button, input, select, textarea, label, [role="dialog"], .control-popover',
      )
    ) {
      return;
    }
    const selection = window.getSelection();
    if (
      selection &&
      !selection.isCollapsed &&
      currentTarget.contains(selection.anchorNode)
    ) {
      return;
    }
    router.push(previewHref);
  }

  // Native share sheet where available, otherwise copy the link.
  async function share() {
    if (!referralHref) return;
    const url = `${window.location.origin}${referralHref}`;
    try {
      if (navigator.share)
        await navigator.share({
          title: `${item.title} at ${item.company}`,
          url,
        });
      else {
        await navigator.clipboard.writeText(url);
        notify("Referral link copied.");
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      notify("Could not share. Copy the link from the address bar.");
      return;
    }
    try {
      await api(`/referrals/${item.id}/share`, { method: "PUT" });
      invalidate("referrals");
    } catch {
      // Counting is best effort; the link was already shared.
    }
  }

  function requestLabel() {
    if (item.requestStatus === "accepted") return "Accepted";
    if (item.requestStatus === "declined") return "Declined";
    return "Requested";
  }

  return (
    <article
      className={`opportunity card${closed ? " is-closed" : ""}${previewHref ? " referral-preview" : ""}`}
      onClick={previewHref ? openReferral : undefined}
    >
      <div className="opportunity-top">
        <span className={`company-logo ${item.color}`}>{item.letter}</span>
        <span>
          <strong>{item.company}</strong>
          <small>
            Employee referral
            {item.createdAt ? ` · ${postedAgo(item.createdAt)}` : ""}
          </small>
        </span>
        <span className={`tag ${closed ? "" : "green-tag"}`}>
          {closed ? "Closed" : "Accepting requests"}
        </span>
      </div>
      {full ? (
        <h1 className="referral-detail-title">{item.title}</h1>
      ) : (
        <h2>
          {previewHref ? (
            <Link href={previewHref}>{item.title}</Link>
          ) : (
            item.title
          )}
        </h2>
      )}
      <div className="referral-facts">
        <a
          className="maps-link"
          href={mapsLink(item.location)}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Google Maps"
        >
          <MapPin size={14} />
          {item.location}
        </a>
        {item.workMode && (
          <span>
            <Globe2 size={14} />
            {workModeLabels[item.workMode]}
          </span>
        )}
        {item.level && (
          <span>
            <Layers size={14} />
            {levelLabels[item.level]}
          </span>
        )}
        <span>
          <Users size={14} />
          {item.requestCount} request{item.requestCount === 1 ? "" : "s"}
        </span>
        <button
          type="button"
          className="text-button referral-share"
          onClick={() => void share()}
        >
          <Share2 size={14} />
          Share · {item.shares} {item.shares === 1 ? "share" : "shares"}
        </button>
      </div>
      <div className="skill-chips">
        {item.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
          .map((skill) => (
            <Link
              className="skill-chip static linked"
              key={skill}
              href={`/referrals?skill=${encodeURIComponent(skill)}`}
              title={`See referrals that need ${skill}`}
            >
              {skill}
            </Link>
          ))}
        {item.minExperience ? (
          <span className="skill-chip static years">
            {item.minExperience}+ years
          </span>
        ) : null}
      </div>
      {item.description && (
        <div
          className={`post-copy referral-description${descClamped ? " is-clamped" : ""}`}
        >
          <RichText text={item.description} clamped={descClamped} />
        </div>
      )}
      {descClamped && referralHref && (
        <Link className="read-more" href={referralHref}>
          Read more
        </Link>
      )}
      {(item.jobLink || item.companyLink) && (
        <p className="referral-links">
          {item.jobLink && (
            <a href={item.jobLink} target="_blank" rel="noopener noreferrer nofollow ugc">
              <FileText size={14} /> Job description <ExternalLink size={12} />
            </a>
          )}
          {item.companyLink && (
            <a href={item.companyLink} target="_blank" rel="noopener noreferrer nofollow ugc">
              <Building2 size={14} /> Company page <ExternalLink size={12} />
            </a>
          )}
        </p>
      )}
      {asks > 0 && (
        <p className="referral-asks">
          {needsFile ? <FileText size={14} /> : <Clock size={14} />}
          Requesting asks for:{" "}
          {item.requestFields.map((field) => field.label).join(", ")}
        </p>
      )}
      <ReferralHelpful item={item} />
      <div className="opportunity-bottom">
        <span className="referral-person">
          <Avatar initials={initials} src={item.personImageUrl} small />
          <span>
            Offered by <strong>{item.person}</strong>
            {item.personRole && <small>{item.personRole}</small>}
          </span>
        </span>
        {item.own ? (
          <Popover label="Referral options" icon={<Ellipsis size={20} />}>
            {(close) => (
              <>
                <button
                  onClick={() => {
                    close();
                    if (item.id) setRequestReferralId(item.id);
                  }}
                >
                  <Users size={16} />
                  View requests
                </button>
                <button
                  disabled={busy}
                  onClick={async () => {
                    close();
                    if (!item.id) return;
                    if (
                      !closed &&
                      !(await confirm({
                        title: "Close this referral?",
                        message:
                          "People will no longer be able to send requests. You can reopen it later.",
                        confirmLabel: "Close referral",
                      }))
                    )
                      return;
                    void setReferralStatus(item.id, closed ? "open" : "closed");
                  }}
                >
                  {closed ? <RotateCcw size={16} /> : <Lock size={16} />}
                  {closed ? "Reopen referral" : "Close referral"}
                </button>
                <button
                  className="danger"
                  disabled={busy}
                  onClick={() => {
                    close();
                    if (item.id) void deleteReferral(item.id);
                  }}
                >
                  <Trash2 size={16} />
                  Delete referral
                </button>
              </>
            )}
          </Popover>
        ) : item.requestStatus ? (
          <div className="referral-owner-actions">
            {item.requestStatus === "pending" && (
              <button
                className="text-button"
                disabled={busy}
                onClick={() => item.id && void withdrawRequest(item.id)}
              >
                Withdraw
              </button>
            )}
            <span className={`request-state ${item.requestStatus}`}>
              <Check size={15} /> {requestLabel()}
            </span>
          </div>
        ) : (
          <button
            disabled={closed || busy}
            className="primary"
            onClick={() => {
              if (!user) return requireSignIn();
              setRequestTarget(item);
            }}
          >
            {closed ? (
              "Closed"
            ) : (
              <>
                Request referral <ArrowUpRight size={15} />
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
