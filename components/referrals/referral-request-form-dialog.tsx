"use client";
import Dialog from "@/components/ui/dialog";
import { apiMessage } from "@/lib/api";
import { fileSize } from "@/lib/referral-meta";
import { usePlatform } from "@/providers/platform-provider";
import { FileText, Loader2, Send, Upload, X } from "lucide-react";
import { useState } from "react";

type Uploaded = { id: string; name: string; size: number };

// The questions are whatever the referrer chose to ask for.
export default function ReferralRequestFormDialog() {
  const {
    requestTarget: target,
    setRequestTarget,
    submitRequest,
    requestSending,
    uploadDocument,
    notify,
  } = usePlatform();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, Uploaded>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  if (!target) return null;
  const close = () => {
    setRequestTarget(null);
    setAnswers({});
    setFiles({});
    setMessage("");
  };
  const missing = target.requestFields.some(
    (field) =>
      field.required &&
      (field.type === "file" ? !files[field.id] : !answers[field.id]?.trim()),
  );

  async function pick(fieldId: string, file: File | undefined) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return notify("Files can be up to 5 MB.");
    setUploading(fieldId);
    try {
      const uploaded = await uploadDocument(file);
      setFiles((current) => ({ ...current, [fieldId]: uploaded }));
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setUploading(null);
    }
  }

  return (
    <Dialog label="Request a referral" onClose={close}>
      <div className="modal-heading">
        <h2>Request a referral</h2>
        <button className="icon-button" aria-label="Close" onClick={close}>
          <X size={21} />
        </button>
      </div>
      <p className="subtle-text">
        {target.title} at {target.company}. {target.person} asked for the
        details below. Your answers are shared only with them.
      </p>
      <form
        className="referral-create-form"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!target.id) return;
          const documents = Object.fromEntries(
            Object.entries(files).map(([key, value]) => [key, value.id]),
          );
          if (
            await submitRequest(target.id, {
              message,
              answers,
              documents,
            })
          ) {
            setAnswers({});
            setFiles({});
            setMessage("");
          }
        }}
      >
        {target.requestFields.map((field) => (
          <div className="field-label" key={field.id}>
            <label htmlFor={`rf-${field.id}`}>
              {field.label}
              {field.required ? (
                <span className="required-mark"> *</span>
              ) : (
                <span className="optional-mark"> (optional)</span>
              )}
            </label>
            {field.type === "file" ? (
              files[field.id] ? (
                <div className="file-chip">
                  <FileText size={16} />
                  <span>
                    {files[field.id].name}
                    <small>{fileSize(files[field.id].size)}</small>
                  </span>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remove ${files[field.id].name}`}
                    onClick={() =>
                      setFiles((current) => {
                        const next = { ...current };
                        delete next[field.id];
                        return next;
                      })
                    }
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <label className="file-drop" htmlFor={`rf-${field.id}`}>
                  {uploading === field.id ? (
                    <Loader2 size={18} className="spin" />
                  ) : (
                    <Upload size={18} />
                  )}
                  <span>
                    {uploading === field.id
                      ? "Uploading…"
                      : "Upload a PDF or Word file (up to 5 MB)"}
                  </span>
                  <input
                    id={`rf-${field.id}`}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => {
                      void pick(field.id, event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
              )
            ) : field.type === "textarea" ? (
              <textarea
                id={`rf-${field.id}`}
                maxLength={1500}
                value={answers[field.id] ?? ""}
                onChange={(event) =>
                  setAnswers({ ...answers, [field.id]: event.target.value })
                }
              />
            ) : field.type === "select" ? (
              <select
                id={`rf-${field.id}`}
                className="filter-select"
                value={answers[field.id] ?? ""}
                onChange={(event) =>
                  setAnswers({ ...answers, [field.id]: event.target.value })
                }
              >
                <option value="">Choose…</option>
                {field.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                id={`rf-${field.id}`}
                type={
                  field.type === "number"
                    ? "number"
                    : field.type === "url"
                      ? "url"
                      : "text"
                }
                placeholder={field.type === "url" ? "https://" : undefined}
                maxLength={300}
                value={answers[field.id] ?? ""}
                onChange={(event) =>
                  setAnswers({ ...answers, [field.id]: event.target.value })
                }
              />
            )}
          </div>
        ))}
        <label className="field-label">
          Note to {target.person.split(" ")[0]}{" "}
          <span className="optional-mark">(optional)</span>
          <textarea
            maxLength={500}
            placeholder="Anything else that helps them refer you…"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>
        <div className="modal-bottom">
          <span>Referrals are always free.</span>
          <button
            className="primary"
            disabled={missing || requestSending || uploading !== null}
          >
            <Send size={15} />
            Send request
          </button>
        </div>
      </form>
    </Dialog>
  );
}
