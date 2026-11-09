import { useEffect, useRef } from "react";
import MessageBubble from "./message-bubble";
import TypingIndicator from "./typing-indicator";
import type { ActiveConversation } from "./types";

export default function MessageList({
  conversation,
  scrollKey,
  loading,
  hasMore,
  typing,
  onLoadOlder,
}: {
  conversation: ActiveConversation;
  scrollKey: unknown;
  loading: boolean;
  hasMore: boolean;
  typing: boolean;
  onLoadOlder: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [conversation.id, conversation.messages.length, scrollKey, typing]);

  return (
    <div
      className="message-history"
      ref={ref}
      role="log"
      aria-label={`Conversation with ${conversation.name}`}
      aria-live="polite"
      tabIndex={0}
    >
      {hasMore && (
        <button
          className="text-button"
          disabled={loading}
          onClick={onLoadOlder}
        >
          Load earlier messages
        </button>
      )}
      {loading && <p role="status">Loading messages…</p>}
      {conversation.messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          conversationId={conversation.id}
        />
      ))}
      {typing && <TypingIndicator name={conversation.name} />}
    </div>
  );
}
