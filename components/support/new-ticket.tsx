"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, ShieldCheck } from "lucide-react";
import { api, apiMessage, invalidate } from "@/lib/api";
import {
  supportRequestBody,
  ticketCategories,
  ticketPriorities,
} from "@/lib/support";
import { SupportImagePicker } from "./support-images";
import { SupportError } from "./support-ui";

export default function NewTicket() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [category, setCategory] =
    useState<keyof typeof ticketCategories>("technical");
  const [priority, setPriority] =
    useState<keyof typeof ticketPriorities>("normal");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  return (
    <div className="support-page support-compose">
      <header className="support-header">
        <div>
          <p>Share a few details so we can understand and follow up.</p>
        </div>
      </header>
      <form
        className="support-form card"
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy.current || !subject.trim() || !description.trim()) return;
          busy.current = true;
          setSaving(true);
          setError("");
          try {
            const result = await api<{ id: string }>("/support", {
              method: "POST",
              body: supportRequestBody(
                {
                  subject: subject.trim(),
                  category,
                  priority,
                  description: description.trim(),
                },
                images,
              ),
            });
            invalidate("support");
            router.push(`/support/${result.id}`);
          } catch (error) {
            setError(apiMessage(error));
          } finally {
            busy.current = false;
            setSaving(false);
          }
        }}
      >
        <fieldset disabled={saving}>
          <label className="field-label">
            Subject
            <input
              required
              maxLength={160}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="A short summary of what you need help with"
            />
          </label>
          <div className="support-form-columns">
            <label className="field-label">
              Category
              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value as keyof typeof ticketCategories,
                  )
                }
              >
                {Object.entries(ticketCategories).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Priority
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value as keyof typeof ticketPriorities,
                  )
                }
              >
                {Object.entries(ticketPriorities).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field-label">
            What happened?
            <textarea
              required
              rows={8}
              maxLength={10000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the issue, where it happened, and any steps to reproduce it. For an error, include the message you saw."
            />
            <small>
              {description.length.toLocaleString()}/10,000 characters
            </small>
          </label>
          <SupportImagePicker
            files={images}
            onChange={setImages}
            disabled={saving}
          />
        </fieldset>
        <p className="support-privacy">
          <ShieldCheck size={16} /> Only you and our support team can read this
          ticket. Please don’t include passwords or payment details.
        </p>
        {error && <SupportError message={error} />}
        <div className="support-form-actions">
          <Link href="/support">Cancel</Link>
          <button
            type="submit"
            className="primary support-primary"
            disabled={saving || !subject.trim() || !description.trim()}
          >
            <Send size={16} />
            {saving ? "Submitting…" : "Submit ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
