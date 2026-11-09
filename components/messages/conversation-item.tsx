import Avatar from "@/components/ui/avatar";
import { Check, CheckCheck } from "lucide-react";
import type { Conversation } from "./types";

export default function ConversationItem({
  conversation,
  active,
  onSelect,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`conversation-preview${active ? " active" : ""}`}
      aria-pressed={active}
      onClick={onSelect}
    >
      <Avatar
        initials={conversation.initials}
        src={conversation.imageUrl}
        color={conversation.color}
      />
      <span className="conversation-summary">
        <span className="conversation-preview-heading">
          <strong>{conversation.name}</strong>
          <time>{conversation.time}</time>
        </span>
        <span className="conversation-snippet">
          {conversation.lastFromMe && (
            <>
              <span
                className={`delivery${conversation.lastRead ? " seen" : ""}`}
                aria-label={conversation.lastRead ? "Seen" : "Sent"}
              >
                {conversation.lastRead ? (
                  <CheckCheck size={14} />
                ) : (
                  <Check size={14} />
                )}
              </span>
              <b>You: </b>
            </>
          )}
          {conversation.preview}
        </span>
      </span>
      {conversation.unread > 0 && (
        <span
          className="conversation-unread"
          aria-label={`${conversation.unread} unread message`}
        >
          {conversation.unread}
        </span>
      )}
    </button>
  );
}
