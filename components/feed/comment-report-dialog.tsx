"use client";
import { reportIcon } from "@/lib/report-icons";
import Dialog from "@/components/ui/dialog";
import { useApiResource } from "@/hooks/use-api-resource";
import type { ReportCategory } from "@/hooks/use-post-reports";
import { api, apiMessage } from "@/lib/api";
import { usePlatform } from "@/providers/platform-provider";
import { Flag, X } from "lucide-react";
import { useState } from "react";

// Report a single comment. Uses the same categories as post reports.
export default function CommentReportDialog({
  postId,
  commentId,
  onClose,
}: {
  postId: string;
  commentId: string;
  onClose: () => void;
}) {
  const { notify } = usePlatform();
  const categories = useApiResource<ReportCategory[]>(
    "/posts/report-categories",
    [],
  );
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!category || saving) return;
    setSaving(true);
    try {
      await api(`/posts/${postId}/comments/${commentId}/reports`, {
        method: "POST",
        body: {
          category,
          subcategory: subcategory || undefined,
          reason: reason.trim(),
        },
      });
      onClose();
      notify("Thanks. Your report was submitted for review.");
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog label="Report this comment" onClose={onClose}>
      <div className="modal-heading">
        <h2>Report this comment</h2>
        <button className="icon-button" aria-label="Close" onClick={onClose}>
          <X size={21} />
        </button>
      </div>
      <p className="subtle-text">
        Tell us what’s wrong. Reports are reviewed by the team, and the author
        isn’t told who reported.
      </p>
      <form
        className="referral-create-form"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <fieldset className="report-categories">
          <legend className="sr-only">Reason for report</legend>
          {categories.loading && <p role="status">Loading…</p>}
          {categories.data.map((item) => (
            <label key={item.value} className="checkbox-label">
              <input
                type="radio"
                name="comment-report-category"
                value={item.value}
                checked={category === item.value}
                onChange={() => (setCategory(item.value), setSubcategory(""))}
              />
              {(() => {
                const I = reportIcon(item.icon);
                return <I size={15} aria-hidden />;
              })()}{" "}
              {item.label}
            </label>
          ))}
        </fieldset>
        {(() => {
          const subs =
            categories.data.find((c) => c.value === category)?.subcategories ??
            [];
          return subs.length ? (
            <div className="report-subcategories">
              <p className="subtle-text">What best describes it?</p>
              {subs.map((sub) => (
                <label key={sub.value} className="checkbox-label">
                  <input
                    type="radio"
                    name="report-subcategory"
                    value={sub.value}
                    checked={subcategory === sub.value}
                    onChange={() => setSubcategory(sub.value)}
                  />
                  {sub.label}
                </label>
              ))}
            </div>
          ) : null;
        })()}

        <label className="field-label">
          More details (optional)
          <textarea
            maxLength={1000}
            placeholder="Anything that helps us review this faster…"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        <div className="modal-bottom">
          <span />
          <button
            className="primary"
            disabled={
              !category ||
              saving ||
              (Boolean(
                categories.data.find((c) => c.value === category)?.subcategories
                  ?.length,
              ) &&
                !subcategory)
            }
          >
            <Flag size={16} />
            {saving ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
