import LinkifiedText from "./linkified-text";
import { AttachmentList } from "./attachments";
import { Check, CheckCheck } from "lucide-react";
import type { ChatMessage } from "./types";

export default function MessageBubble({
  message,
  conversationId,
}: {
  message: ChatMessage;
  conversationId: string;
}) {
  return (
    <div className={`message ${message.outgoing ? "outgoing" : "incoming"}`}>
      {message.text && (
        <p>
          <LinkifiedText text={message.text} />
        </p>
      )}
      <AttachmentList
        conversationId={conversationId}
        attachments={message.attachments}
      />
      <small>
        <time>
          {message.date} · {message.time}
        </time>
        {message.outgoing && (
          <span
            className={`delivery${message.readAt ? " seen" : ""}`}
            aria-label={message.readAt ? "Seen" : "Sent"}
          >
            {message.readAt ? <CheckCheck size={15} /> : <Check size={15} />}
            {message.readAt ? "Seen" : "Sent"}
          </span>
        )}
      </small>
    </div>
  );
}
