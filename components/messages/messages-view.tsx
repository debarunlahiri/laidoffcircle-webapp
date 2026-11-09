"use client";

import { usePlatform } from "@/providers/platform-provider";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ChatWindow from "./chat-window";
import EmptyChat from "./empty-chat";
import InboxPanel from "./inbox-panel";

export default function MessagesView() {
  const {
    conversations,
    activeConversation,
    selectConversation,
    message,
    setMessage,
    partnerTyping,
    sendMessage,
    attachments,
    attachmentError,
    addAttachments,
    removeAttachment,
    messageSending,
    messagesLoading,
    messagesError,
    retryMessages,
    conversationsHasMore,
    loadMoreConversations,
    messagesHasMore,
    loadOlderMessages,
    navigate,
    requestedChatId,
    clearRequestedChat,
  } = usePlatform();
  const panel = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(Boolean(requestedChatId));
  useEffect(() => {
    if (!requestedChatId) return;
    setChatOpen(true);
    clearRequestedChat();
  }, [requestedChatId, clearRequestedChat]);
  useEffect(() => {
    if (!chatOpen || window.matchMedia("(min-width: 720px)").matches) return;
    const viewport = window.visualViewport;
    // The panel is pinned to the top of the screen and only its height follows
    // the visible area, so opening the keyboard shrinks the chat from the
    // bottom: the header stays put and the composer sits above the keyboard.
    const update = () => {
      // iOS scrolls the page to reveal the focused input; undo that so
      // nothing slides upward.
      if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
      panel.current?.style.setProperty(
        "--chat-height",
        `${viewport?.height ?? window.innerHeight}px`,
      );
      panel.current?.style.setProperty("--chat-top", "0px");
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    return () => {
      document.body.style.overflow = overflow;
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
    };
  }, [chatOpen]);
  function backToInbox() {
    setChatOpen(false);
    selectConversation(null);
  }
  const visible = conversations.filter((conversation) =>
    `${conversation.name} ${conversation.role}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <section
      ref={panel}
      className={`card messaging${chatOpen ? " chat-open" : ""}`}
      aria-label="Messages"
    >
      <InboxPanel
        conversations={conversations}
        visible={visible}
        activeId={activeConversation?.id}
        query={query}
        onQueryChange={setQuery}
        onSelect={(id) => {
          selectConversation(id);
          setChatOpen(true);
        }}
        loading={messagesLoading}
        error={messagesError}
        hasMore={conversationsHasMore}
        onLoadMore={() => void loadMoreConversations()}
        onFindPeople={() => navigate("My network")}
        onRetry={retryMessages}
      />
      {activeConversation ? (
        <ChatWindow
          conversation={activeConversation}
          chatOpen={chatOpen}
          draft={message}
          sending={messageSending}
          loading={messagesLoading}
          hasMore={messagesHasMore}
          typing={partnerTyping}
          onBack={backToInbox}
          error={messagesError}
          onRetry={retryMessages}
          onDraftChange={setMessage}
          onSend={sendMessage}
          attachments={attachments}
          attachmentError={attachmentError}
          onAttach={addAttachments}
          onRemoveAttachment={removeAttachment}
          onLoadOlder={() => void loadOlderMessages()}
        />
      ) : chatOpen ? (
        <div className="chat-window chat-pending">
          <button
            className="icon-button"
            aria-label="Back to inbox"
            onClick={backToInbox}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="inbox-empty">
            <MessageCircle size={32} />
            {messagesError ? (
              <p role="alert">{messagesError}</p>
            ) : (
              <p role="status">
                {messagesLoading || conversationsHasMore
                  ? "Opening conversation…"
                  : "This conversation could not be loaded."}
              </p>
            )}
            {!messagesLoading && (
              <button className="secondary" onClick={retryMessages}>
                Try again
              </button>
            )}
          </div>
        </div>
      ) : (
        <EmptyChat
          loading={messagesLoading}
          onFindPeople={() => navigate("My network")}
        />
      )}
    </section>
  );
}
