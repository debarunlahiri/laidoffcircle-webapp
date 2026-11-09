"use client";
import PillTabs from "@/components/ui/pill-tabs";
import VerifiedBadge from "@/components/ui/verified-badge";
import LinkifiedText from "@/components/messages/linkified-text";
import { useFileDrop } from "@/hooks/use-file-drop";
import { pastedImages } from "@/lib/paste-files";
import {
  AttachButton,
  AttachmentList,
  AttachmentTray,
  addFiles,
} from "@/components/messages/attachments";
import Avatar from "@/components/ui/avatar";
import { useApiList } from "@/hooks/use-api-resource";
import { useTyping } from "@/hooks/use-typing";
import {
  api,
  apiMessage,
  displayDate,
  displayTime,
  initials,
  invalidate,
  utcDate,
} from "@/lib/api";
import type { ApiConversation, ApiMessage } from "@/lib/api-types";
import { usePlatform } from "@/providers/platform-provider";
import {
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  Maximize2,
  Minus,
  Search,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const maxWindows = 2;

type Row = ApiConversation & {
  initials: string;
  unreadCount: number;
  time: string;
};

// A LinkedIn-style dock: a conversation list pinned bottom-right, with up to
// two chat windows opening to its left.
export default function MessagingDock() {
  const { currentUser, notify } = usePlatform();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  // Slid fully off to the right edge, leaving only a small tab, to free up room.
  const [tucked, setTucked] = useState(false);
  const [tab, setTab] = useState<"focused" | "unread">("focused");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string[]>([]);
  const [minimized, setMinimized] = useState<string[]>([]);
  const list = useApiList<ApiConversation>(
    currentUser ? "/conversations" : null,
    20000,
  );

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("laidoffcircle:dock") !== "open");
      const saved = localStorage.getItem("laidoffcircle:dock-tucked");
      // First visit on a small screen: start tucked away.
      setTucked(saved ? saved === "yes" : window.innerWidth < 1100);
    } catch {}
  }, []);
  function tuck(next: boolean) {
    setTucked(next);
    try {
      localStorage.setItem("laidoffcircle:dock-tucked", next ? "yes" : "no");
    } catch {}
  }
  function toggle() {
    setCollapsed((current) => {
      try {
        localStorage.setItem("laidoffcircle:dock", current ? "open" : "closed");
      } catch {}
      return !current;
    });
  }

  const rows: Row[] = useMemo(
    () =>
      list.data.map((item) => ({
        ...item,
        initials: initials(item.name),
        unreadCount: Number(item.unread),
        time: item.lastMessageAt ? shortDate(item.lastMessageAt) : "",
      })),
    [list.data],
  );
  const totalUnread = rows.reduce((sum, row) => sum + row.unreadCount, 0);
  const term = search.trim().toLowerCase();
  const shown = rows.filter(
    (row) =>
      (tab === "focused" || row.unreadCount > 0) &&
      (!term ||
        row.name.toLowerCase().includes(term) ||
        (row.preview ?? "").toLowerCase().includes(term)),
  );

  function openChat(id: string) {
    setMinimized((current) => current.filter((item) => item !== id));
    setOpen((current) =>
      current.includes(id) ? current : [...current, id].slice(-maxWindows),
    );
  }
  function closeChat(id: string) {
    setOpen((current) => current.filter((item) => item !== id));
  }
  function toggleMinimize(id: string) {
    setMinimized((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  // Other parts of the app (e.g. the Message button on a profile) ask the dock
  // to open a chat window for a conversation.
  useEffect(() => {
    const onOpen = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (id) openChat(id);
    };
    window.addEventListener("dock:open-chat", onOpen);
    return () => window.removeEventListener("dock:open-chat", onOpen);
  }, []);

  // The full inbox page already shows everything the dock does.
  if (!currentUser || pathname.startsWith("/messages")) return null;

  return (
    <>
      <div className={`msg-dock-windows${tucked ? " tucked" : ""}`}>
        {open.map((id) => {
          const row = rows.find((item) => item.id === id);
          return row ? (
            <ChatWindow
              key={id}
              row={row}
              userId={currentUser.id}
              minimized={minimized.includes(id)}
              onToggle={() => toggleMinimize(id)}
              onClose={() => closeChat(id)}
              notify={notify}
            />
          ) : null;
        })}
      </div>
      {tucked ? (
        <button
          type="button"
          className="msg-dock-tab"
          aria-label={`Show messaging${totalUnread ? `, ${totalUnread} unread` : ""}`}
          title="Show messaging"
          onClick={() => tuck(false)}
        >
          <ChevronsLeft size={16} />
          <span className="msg-dock-me">
            <Avatar
              initials={initials(currentUser.name)}
              src={currentUser.profileImageUrl}
              small
            />
            <i className="msg-online" />
          </span>
          {totalUnread > 0 && (
            <span className="msg-count">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </button>
      ) : (
        <aside
          className={`msg-dock${collapsed ? " collapsed" : ""}`}
          aria-label="Messaging"
        >
          <div className="msg-dock-top">
            <button
              type="button"
              className="msg-dock-header"
              aria-expanded={!collapsed}
              onClick={toggle}
            >
              <span className="msg-dock-me">
                <Avatar
                  initials={initials(currentUser.name)}
                  src={currentUser.profileImageUrl}
                  small
                />
                <i className="msg-online" />
              </span>
              <strong>Messaging</strong>
              {totalUnread > 0 && (
                <span
                  className="msg-count"
                  aria-label={`${totalUnread} unread`}
                >
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
              <span className="msg-dock-chevron">
                {collapsed ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </span>
            </button>
            <button
              type="button"
              className="msg-dock-hide"
              aria-label="Hide messaging to the side"
              title="Hide to the side"
              onClick={() => tuck(true)}
            >
              <ChevronsRight size={18} />
            </button>
          </div>
          {!collapsed && (
            <>
              <label className="msg-dock-search">
                <Search size={16} />
                <input
                  aria-label="Search messages"
                  placeholder="Search messages"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <PillTabs
                label="Messages"
                items={[
                  { key: "focused", label: "Focused" },
                  {
                    key: "unread",
                    label: `Unread${totalUnread > 0 ? ` (${totalUnread})` : ""}`,
                  },
                ]}
                active={tab}
                onChange={setTab}
              />
              <div className="msg-dock-list">
                {list.loading && !rows.length && (
                  <p className="msg-dock-note" role="status">
                    Loading conversations…
                  </p>
                )}
                {list.error && (
                  <p className="msg-dock-note" role="alert">
                    {list.error}
                  </p>
                )}
                {!list.loading && !shown.length && (
                  <p className="msg-dock-note">
                    {term
                      ? "No conversations match your search."
                      : tab === "unread"
                        ? "No unread messages."
                        : "No conversations yet."}
                  </p>
                )}
                {shown.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    className={`msg-dock-row${row.unreadCount ? " unread" : ""}${open.includes(row.id) ? " active" : ""}`}
                    onClick={() => openChat(row.id)}
                  >
                    <Avatar
                      initials={row.initials}
                      src={row.profileImageUrl}
                      color="blue"
                    />
                    <span className="msg-dock-row-body">
                      <span className="msg-dock-row-top">
                        <strong>
                          {row.name}
                          <VerifiedBadge type={row.badge} />
                        </strong>
                        <time>{row.time}</time>
                      </span>
                      <span className="msg-dock-row-snippet">
                        {row.lastSenderId === currentUser.id && <b>You: </b>}
                        {row.preview ?? "Start a conversation"}
                      </span>
                    </span>
                    {row.unreadCount > 0 && <i className="msg-new-dot" />}
                  </button>
                ))}
                {list.hasMore && (
                  <button
                    className="text-button msg-dock-more"
                    onClick={() => void list.loadMore()}
                  >
                    Load more
                  </button>
                )}
              </div>
            </>
          )}
        </aside>
      )}
    </>
  );
}

function shortDate(value: string) {
  const date = utcDate(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return displayTime(value);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date);
}

function ChatWindow({
  row,
  userId,
  minimized,
  onToggle,
  onClose,
  notify,
}: {
  row: Row;
  userId: string;
  minimized: boolean;
  onToggle: () => void;
  onClose: () => void;
  notify: (message: string) => void;
}) {
  const history = useApiList<ApiMessage>(
    `/conversations/${row.id}/messages`,
    10000,
  );
  const [cache, setCache] = useState<ApiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const log = useRef<HTMLDivElement>(null);
  const { partnerTyping, notifyTyping, stopTyping } = useTyping(row.id);

  useEffect(() => {
    if (!history.data.length) return;
    setCache((current) => {
      const merged = new Map(current.map((item) => [item.id, item]));
      for (const item of history.data) merged.set(item.id, item);
      return [...merged.values()].sort(
        (a, b) =>
          utcDate(a.createdAt).getTime() - utcDate(b.createdAt).getTime(),
      );
    });
  }, [history.data]);

  useEffect(() => {
    const element = log.current;
    if (element && !minimized) element.scrollTop = element.scrollHeight;
  }, [cache.length, minimized, partnerTyping]);

  // Opening a chat reads it.
  useEffect(() => {
    if (minimized || !row.unreadCount) return;
    void api(`/conversations/${row.id}/read`, { method: "PUT" })
      .then(() => invalidate("conversations", "notifications"))
      .catch((error) => notify(apiMessage(error)));
  }, [minimized, row.id, row.unreadCount, notify]);

  async function send() {
    const text = draft.trim();
    if ((!text && !files.length) || sending) return;
    stopTyping();
    setSending(true);
    try {
      let body: FormData | { text: string };
      if (files.length) {
        body = new FormData();
        body.append("text", text);
        for (const file of files) body.append("files", file);
      } else body = { text };
      await api(`/conversations/${row.id}/messages`, {
        method: "POST",
        body,
      });
      setDraft("");
      setFiles([]);
      setFileError("");
      invalidate("conversations");
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setSending(false);
    }
  }
  function pick(picked: File[]) {
    const result = addFiles(files, picked);
    setFiles(result.files);
    setFileError(result.error);
  }

  const { dragging, dropProps } = useFileDrop({ onFiles: pick });

  return (
    <section
      className={`msg-window${minimized ? " minimized" : ""}${dragging ? " drop-active" : ""}`}
      aria-label={`Chat with ${row.name}`}
      {...dropProps}
    >
      {dragging && (
        <div className="drop-overlay" aria-hidden="true">
          Drop files to attach them
        </div>
      )}
      <div className="msg-window-header">
        <button
          type="button"
          className="msg-window-title"
          onClick={onToggle}
          aria-expanded={!minimized}
        >
          <Avatar initials={row.initials} src={row.profileImageUrl} small />
          <span>
            <strong>
              {row.name}
              <VerifiedBadge type={row.badge} />
            </strong>
            <small className={partnerTyping ? "typing-label" : undefined}>
              {partnerTyping ? "typing…" : row.role}
            </small>
          </span>
        </button>
        {row.userId && (
          <Link
            className="icon-button"
            href="/messages"
            aria-label="Open in full messages"
          >
            <Maximize2 size={15} />
          </Link>
        )}
        <button
          type="button"
          className="icon-button"
          aria-label={minimized ? "Restore chat" : "Minimize chat"}
          onClick={onToggle}
        >
          <Minus size={17} />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Close chat"
          onClick={onClose}
        >
          <X size={17} />
        </button>
      </div>
      {!minimized && (
        <>
          <div
            className="msg-window-log"
            ref={log}
            role="log"
            aria-live="polite"
          >
            {history.hasMore && (
              <button
                className="text-button"
                disabled={history.loading}
                onClick={() => void history.loadMore()}
              >
                Load earlier messages
              </button>
            )}
            {history.loading && !cache.length && (
              <p className="msg-dock-note" role="status">
                Loading messages…
              </p>
            )}
            {history.error && (
              <p className="msg-dock-note" role="alert">
                {history.error}
              </p>
            )}
            {cache.map((item, index) => {
              const mine = item.senderId === userId;
              const newDay =
                index === 0 ||
                displayDate(cache[index - 1].createdAt) !==
                  displayDate(item.createdAt);
              return (
                <div key={item.id} className="msg-line">
                  {newDay && (
                    <time className="msg-day">
                      {displayDate(item.createdAt)}
                    </time>
                  )}
                  <div className={`msg-bubble ${mine ? "mine" : "theirs"}`}>
                    {item.text && (
                      <p>
                        <LinkifiedText text={item.text} />
                      </p>
                    )}
                    <AttachmentList
                      conversationId={row.id}
                      attachments={item.attachments}
                    />
                    <small>
                      {displayTime(item.createdAt)}
                      {mine &&
                        (item.readAt ? (
                          <CheckCheck size={13} aria-label="Seen" />
                        ) : (
                          <Check size={13} aria-label="Sent" />
                        ))}
                    </small>
                  </div>
                </div>
              );
            })}
            {partnerTyping && (
              <div className="typing-row" role="status">
                <span className="typing-bubble" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="sr-only">{row.name} is typing</span>
              </div>
            )}
          </div>
          <AttachmentTray
            files={files}
            error={fileError}
            onRemove={(index) => {
              setFiles((current) => current.filter((_, i) => i !== index));
              setFileError("");
            }}
          />
          <form
            className="msg-window-form"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <AttachButton disabled={sending} onPick={pick} />
            <input
              aria-label={`Message ${row.name}`}
              placeholder="Write a message…"
              value={draft}
              autoComplete="off"
              onPaste={(event) => {
                const pasted = pastedImages(event);
                if (pasted.length) pick(pasted);
              }}
              onChange={(event) => {
                setDraft(event.target.value);
                notifyTyping(Boolean(event.target.value.trim()));
              }}
            />
            <button
              className="primary"
              aria-label="Send message"
              disabled={(!draft.trim() && !files.length) || sending}
            >
              <Send size={16} />
            </button>
          </form>
        </>
      )}
    </section>
  );
}
