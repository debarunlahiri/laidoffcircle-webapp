"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { useApiList, useApiResource } from "@/hooks/use-api-resource";
import {
  api,
  apiMessage,
  displayDate,
  displayTime,
  invalidate,
} from "@/lib/api";
import {
  supportRequestBody,
  ticketCategories,
  ticketPriorities,
  ticketReference,
  ticketStatuses,
  ticketStatusLabel,
  type SupportMessage,
  type SupportTicket,
  type TicketStatus,
} from "@/lib/support";
import { SupportImagePicker, SupportImages } from "./support-images";
import { SupportError, SupportLoading, TicketBadge } from "./support-ui";

export default function TicketDetail({
  id,
  admin = false,
}: {
  id: string;
  admin?: boolean;
}) {
  const base = admin ? "/admin/support" : "/support";
  const path = `${base}/${encodeURIComponent(id)}`;
  const resource = useApiResource<SupportTicket | null>(path, null, 30000);
  const messages = useApiList<SupportMessage>(
    resource.data ? `${path}/messages` : null,
    15000,
  );
  const [images, setImages] = useState<File[]>([]);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const busy = useRef(false);
  const ticket = resource.data;
  async function mutate(body: { status: TicketStatus } | { body: string }) {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError("");
    setNotice("");
    const isReply = "body" in body;
    try {
      await api(isReply ? `${path}/messages` : path, {
        method: isReply ? "POST" : "PATCH",
        body: isReply ? supportRequestBody({ body: body.body }, images) : body,
      });
      if (isReply) {
        setReply("");
        setImages([]);
      }
      setNotice(isReply ? "Your reply was sent." : "Ticket status updated.");
      invalidate("support", "admin/support", "notifications");
    } catch (error) {
      setError(apiMessage(error));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  if (resource.loading && !ticket) return <SupportLoading />;
  if (!ticket)
    return (
      <div className="support-page">
        {admin && (
          <Link href={base} className="support-back">
            <ArrowLeft size={16} /> Back to tickets
          </Link>
        )}
        <SupportError
          message={resource.error || "Ticket not found."}
          retry={() => void resource.reload()}
        />
      </div>
    );
  const closed = ticket.status === "resolved" || ticket.status === "closed";
  return (
    <div className="support-page">
      {admin && (
        <Link href={base} className="support-back">
          <ArrowLeft size={16} /> {admin ? "Support queue" : "Your tickets"}
        </Link>
      )}
      <header className="support-header">
        <div>
          <div className="support-ticket-meta">
            <span>{ticketReference(ticket.id)}</span>
            <span>{ticketCategories[ticket.category]}</span>
          </div>
          <h1>{ticket.subject}</h1>
          <p>
            Created {displayDate(ticket.createdAt)} · Updated{" "}
            {displayDate(ticket.updatedAt)}
          </p>
        </div>
        <TicketBadge status={ticket.status} admin={admin} />
      </header>
      {resource.error && (
        <SupportError
          message={resource.error}
          retry={() => void resource.reload()}
        />
      )}
      <div className="support-detail-layout">
        <section
          className="support-conversation card"
          aria-label="Ticket conversation"
        >
          <div className="support-conversation-heading">
            <h2>Conversation</h2>
            <button
              type="button"
              className="support-back"
              disabled={messages.loading || resource.loading}
              onClick={() => {
                void resource.reload();
                void messages.reload();
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
          <article className="support-message">
            <div className="support-message-heading">
              <strong>{admin ? ticket.requesterName : "You"}</strong>
              <time>
                {displayDate(ticket.createdAt)} ·{" "}
                {displayTime(ticket.createdAt)}
              </time>
            </div>
            <p className="support-message-body">{ticket.description}</p>
            <SupportImages images={ticket.images} ticketPath={path} />
          </article>
          {messages.error && (
            <SupportError
              message={messages.error}
              retry={() => void messages.reload()}
            />
          )}
          {messages.hasMore && (
            <button
              type="button"
              className="support-load-more"
              disabled={messages.loading}
              onClick={() => void messages.loadMore()}
            >
              {messages.loading ? "Loading…" : "Load earlier replies"}
            </button>
          )}
          {messages.loading && !messages.data.length && <SupportLoading />}
          {[...messages.data].reverse().map((message) =>
            message.kind === "status" ? (
              <p key={message.id} className="support-event">
                <Check size={14} />
                {message.body}
                <time>
                  {displayDate(message.createdAt)} ·{" "}
                  {displayTime(message.createdAt)}
                </time>
              </p>
            ) : (
              <article
                className={`support-message${message.isStaff ? " support-message-staff" : ""}`}
                key={message.id}
              >
                <div className="support-message-heading">
                  <strong>
                    {message.isStaff ? "Support team" : message.authorName}
                    {message.isStaff && <ShieldCheck size={14} />}
                  </strong>
                  <time>
                    {displayDate(message.createdAt)} ·{" "}
                    {displayTime(message.createdAt)}
                  </time>
                </div>
                <p className="support-message-body">{message.body}</p>
                <SupportImages images={message.images} ticketPath={path} />
              </article>
            ),
          )}
          {notice && (
            <p className="support-notice" role="status">
              {notice}
            </p>
          )}
          {error && <SupportError message={error} />}
          {closed ? (
            <div className="support-closed">
              <h3>
                This ticket is {ticketStatuses[ticket.status].toLowerCase()}.
              </h3>
              <p>Still need help? Reopen it to continue the conversation.</p>
              <button
                type="button"
                disabled={saving}
                onClick={() => void mutate({ status: "open" })}
              >
                <RefreshCw size={15} /> Reopen ticket
              </button>
            </div>
          ) : (
            <form
              className="support-reply"
              onSubmit={(event) => {
                event.preventDefault();
                if (reply.trim()) void mutate({ body: reply.trim() });
              }}
            >
              <label className="field-label">
                {admin ? "Reply to member" : "Add a reply"}
                <textarea
                  required
                  rows={4}
                  maxLength={10000}
                  value={reply}
                  disabled={saving}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Add details or follow up on your issue…"
                />
              </label>
              <SupportImagePicker
                files={images}
                onChange={setImages}
                disabled={saving}
              />
              <div className="support-form-actions">
                <small>{reply.length.toLocaleString()}/10,000 characters</small>
                <button
                  className="primary support-primary"
                  disabled={saving || !reply.trim()}
                >
                  <Send size={15} />
                  {saving ? "Saving…" : "Send reply"}
                </button>
              </div>
            </form>
          )}
        </section>
        <details
          className="support-ticket-info card"
          open={admin ? true : undefined}
        >
          <summary>Request details</summary>
          <dl>
            {admin && (
              <>
                <dt>Member</dt>
                <dd>
                  {ticket.requesterName}
                  <small>{ticket.requesterEmail}</small>
                </dd>
              </>
            )}
            <dt>Category</dt>
            <dd>{ticketCategories[ticket.category]}</dd>
            <dt>Priority</dt>
            <dd className={`support-priority-${ticket.priority}`}>
              {ticketPriorities[ticket.priority]}
            </dd>
          </dl>
          {admin ? (
            <label className="field-label">
              Status
              <select
                value={ticket.status}
                disabled={saving}
                onChange={(event) =>
                  void mutate({ status: event.target.value as TicketStatus })
                }
              >
                {Object.keys(ticketStatuses).map((value) => (
                  <option key={value} value={value}>
                    {ticketStatusLabel(value as TicketStatus, admin)}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            !closed && (
              <button
                type="button"
                className="support-resolve"
                disabled={saving}
                onClick={() => void mutate({ status: "resolved" })}
              >
                <Check size={15} /> Mark as resolved
              </button>
            )
          )}
          <p className="support-private-note">
            <ShieldCheck size={15} /> Private support conversation
          </p>
        </details>
      </div>
    </div>
  );
}
