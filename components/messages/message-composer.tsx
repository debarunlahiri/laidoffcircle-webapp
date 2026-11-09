import { pastedImages } from "@/lib/paste-files";
import { Send } from "lucide-react";
import { AttachButton, AttachmentTray } from "./attachments";

export default function MessageComposer({
  recipient,
  value,
  sending,
  onChange,
  onSend,
  attachments,
  attachmentError,
  onAttach,
  onRemoveAttachment,
}: {
  recipient: string;
  value: string;
  sending: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  attachments: File[];
  attachmentError: string;
  onAttach: (files: File[]) => void;
  onRemoveAttachment: (index: number) => void;
}) {
  return (
    <div className="chat-composer">
      <AttachmentTray
        files={attachments}
        error={attachmentError}
        onRemove={onRemoveAttachment}
      />
      <form
        className="message-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <AttachButton disabled={sending} onPick={onAttach} />
        <input
          aria-label={`Message ${recipient}`}
          placeholder="Write a message…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onPaste={(event) => {
            const pasted = pastedImages(event);
            if (pasted.length) onAttach(pasted);
          }}
          autoComplete="off"
        />
        <button
          className="primary"
          aria-label="Send message"
          disabled={(!value.trim() && !attachments.length) || sending}
        >
          <Send size={19} />
        </button>
      </form>
      <p className="subtle-text">
        Messages are shared with this conversation’s participant.
      </p>
    </div>
  );
}
