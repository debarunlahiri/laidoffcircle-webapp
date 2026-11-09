"use client";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { addFiles } from "@/components/messages/attachments";
import { useApiList } from "./use-api-resource";
import { useTyping } from "./use-typing";
export function useMessages(
  section: string,
  userId: string,
  notify: (message: string) => void,
  navigate: (section: string) => void,
  live: boolean,
) {
  const list = useApiList<ApiConversation>(
    userId && section === "Messages" ? "/conversations" : null,
    live ? 0 : 15000, // poll only while the live connection is down
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [requestedChatId, setRequestedChatId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [messageSending, setMessageSending] = useState(false);
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [fileError, setFileError] = useState("");
  const starting = useRef(false);
  const [startingChatUserId, setStartingChatUserId] = useState<string | null>(
    null,
  );
  const activeId = section === "Messages" ? selected : null;
  const history = useApiList<ApiMessage>(
    section === "Messages" && activeId
      ? `/conversations/${activeId}/messages`
      : null,
    live ? 0 : 8000,
  );
  const [cache, setCache] = useState<Record<string, ApiMessage[]>>({});
  useEffect(() => {
    if (!activeId || !history.data.length) return;
    setCache((current) => {
      const merged = new Map(
        (current[activeId] ?? []).map((item) => [item.id, item]),
      );
      for (const item of history.data) merged.set(item.id, item);
      return {
        ...current,
        [activeId]: [...merged.values()].sort(
          (a, b) =>
            utcDate(a.createdAt).getTime() - utcDate(b.createdAt).getTime(),
        ),
      };
    });
  }, [activeId, history.data]);
  const conversations = useMemo(
    () =>
      list.data.map((item) => ({
        ...item,
        initials: initials(item.name),
        imageUrl: item.profileImageUrl,
        color: "blue",
        unread: Number(item.unread),
        lastFromMe: Boolean(userId) && item.lastSenderId === userId,
        lastRead: Boolean(item.lastReadAt),
        preview: item.preview ?? "Start a conversation",
        time: item.lastMessageAt ? displayTime(item.lastMessageAt) : "",
      })),
    [list.data],
  );
  const activeRow = conversations.find((item) => item.id === activeId);
  const activeConversation = activeRow
    ? {
        ...activeRow,
        messages: (cache[activeId!] ?? []).map((item) => ({
          ...item,
          outgoing: item.senderId === userId,
          time: displayTime(item.createdAt),
          date: displayDate(item.createdAt),
        })),
      }
    : null;
  // An existing conversation can be beyond the first inbox page.
  useEffect(() => {
    if (activeId && !activeRow && list.hasMore && !list.loading && !list.error)
      void list.loadMore();
  }, [
    activeId,
    activeRow,
    list.hasMore,
    list.loading,
    list.error,
    list.loadMore,
  ]);
  const message = drafts[activeId ?? ""] ?? "";
  const { partnerTyping, notifyTyping, stopTyping } = useTyping(
    section === "Messages" ? activeId : null,
  );
  useEffect(() => {
    if (!activeId || !activeRow?.unread) return;
    void api(`/conversations/${activeId}/read`, { method: "PUT" })
      .then(() => invalidate("conversations", "notifications"))
      .catch((error) => notify(apiMessage(error)));
  }, [activeId, activeRow?.unread, notify]);
  async function sendMessage() {
    const attached = files[activeId ?? ""] ?? [];
    if (!activeId || (!message.trim() && !attached.length) || messageSending)
      return;
    const id = activeId;
    const text = message.trim();
    stopTyping();
    setMessageSending(true);
    try {
      let body: FormData | { text: string };
      if (attached.length) {
        body = new FormData();
        body.append("text", text);
        for (const file of attached) body.append("files", file);
      } else body = { text };
      await api(`/conversations/${id}/messages`, { method: "POST", body });
      setDrafts((current) => ({ ...current, [id]: "" }));
      setFiles((current) => ({ ...current, [id]: [] }));
      setFileError("");
      invalidate("conversations");
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setMessageSending(false);
    }
  }
  async function startConversation(userId: string) {
    if (starting.current) return;
    starting.current = true;
    setStartingChatUserId(userId);
    try {
      const result = await api<{ id: string }>("/conversations", {
        method: "POST",
        body: { userId },
      });
      invalidate("conversations");
      setSelected(result.id);
      setRequestedChatId(result.id);
      navigate("Messages");
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      starting.current = false;
      setStartingChatUserId(null);
    }
  }
  return {
    startingChatUserId,
    requestedChatId,
    clearRequestedChat: () => setRequestedChatId(null),
    conversations,
    activeConversation,
    selectConversation: (id: string | null) => {
      stopTyping();
      setSelected(id);
      setFileError("");
    },
    message,
    setMessage: (text: string) => {
      if (!activeId) return;
      setDrafts((current) => ({ ...current, [activeId]: text }));
      notifyTyping(Boolean(text.trim()));
    },
    attachments: files[activeId ?? ""] ?? [],
    attachmentError: fileError,
    addAttachments: (picked: File[]) => {
      if (!activeId) return;
      const result = addFiles(files[activeId] ?? [], picked);
      setFiles((current) => ({ ...current, [activeId]: result.files }));
      setFileError(result.error);
    },
    removeAttachment: (index: number) => {
      if (!activeId) return;
      setFiles((current) => ({
        ...current,
        [activeId]: (current[activeId] ?? []).filter((_, i) => i !== index),
      }));
      setFileError("");
    },
    partnerTyping,
    sendMessage,
    startConversation,
    messageSending,
    messagesLoading: list.loading || history.loading,
    messagesError: list.error || history.error,
    retryMessages: () => {
      void list.reload();
      void history.reload();
    },
    conversationsHasMore: list.hasMore,
    loadMoreConversations: list.loadMore,
    messagesHasMore: history.hasMore,
    loadOlderMessages: history.loadMore,
  };
}
