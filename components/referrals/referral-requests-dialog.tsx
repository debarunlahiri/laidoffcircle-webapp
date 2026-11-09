"use client";
import VerifiedBadge from "@/components/ui/verified-badge";
import Dialog from "@/components/ui/dialog";
import { usePlatform } from "@/providers/platform-provider";
import Avatar from "@/components/ui/avatar";
import { fileSize, postedAgo } from "@/lib/referral-meta";
import { Download, FileText, X } from "lucide-react";
export default function ReferralRequestsDialog() {
  const {
    requestReferralId,
    setRequestReferralId,
    referralRequests,
    referralRequestsLoading,
    referralRequestsError,
    decideReferral,
    referralPending,
    referralRequestsHasMore,
    loadMoreReferralRequests,
  } = usePlatform();
  if (!requestReferralId) return null;
  return (
    <Dialog
      label="Referral requests"
      onClose={() => setRequestReferralId(null)}
    >
      <div className="modal-heading">
        <h2>Referral requests</h2>
        <button
          className="icon-button"
          aria-label="Close requests"
          onClick={() => setRequestReferralId(null)}
        >
          <X size={20} />
        </button>
      </div>
      {referralRequestsLoading && <p role="status">Loading requests…</p>}
      {referralRequestsError && <p role="alert">{referralRequestsError}</p>}
      {!referralRequestsLoading &&
        !referralRequestsError &&
        !referralRequests.length && <p>No requests yet.</p>}
      {referralRequests.map((item) => (
        <div className="request-row" key={item.userId}>
          <div className="request-row-head">
            <Avatar
              initials={item.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
              src={item.profileImageUrl}
              small
            />
            <span>
              <strong>
                {item.name}
                <VerifiedBadge type={item.badge} />
              </strong>
              <small>
                {item.role}
                {item.createdAt ? ` · ${postedAgo(item.createdAt)}` : ""}
              </small>
            </span>
          </div>
          {item.message && <p className="request-note">“{item.message}”</p>}
          {item.answers && item.answers.length > 0 && (
            <dl className="request-answers">
              {item.answers.map((answer) => (
                <div key={answer.label}>
                  <dt>{answer.label}</dt>
                  <dd>
                    {answer.file ? (
                      <a
                        className="file-chip link"
                        href={`/api/backend/referrals/documents/${answer.file.id}`}
                        download={answer.file.name}
                      >
                        <FileText size={15} />
                        <span>
                          {answer.file.name}
                          <small>{fileSize(answer.file.size)}</small>
                        </span>
                        <Download size={14} />
                      </a>
                    ) : answer.type === "url" ? (
                      <a
                        href={answer.value}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        {answer.value}
                      </a>
                    ) : (
                      answer.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <div className="request-actions">
            {item.status === "pending" ? (
              <>
                <button
                  className="primary"
                  disabled={referralPending.includes(item.userId)}
                  onClick={() => void decideReferral(item.userId, "accepted")}
                >
                  Accept
                </button>
                <button
                  className="text-button"
                  disabled={referralPending.includes(item.userId)}
                  onClick={() => void decideReferral(item.userId, "declined")}
                >
                  Decline
                </button>
              </>
            ) : (
              <span className="tag">{item.status}</span>
            )}
          </div>
        </div>
      ))}
      {referralRequestsHasMore && (
        <button
          className="text-button"
          onClick={() => void loadMoreReferralRequests()}
        >
          Load more requests
        </button>
      )}
    </Dialog>
  );
}
