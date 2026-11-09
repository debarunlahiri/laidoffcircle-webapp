import { useFileDrop } from "@/hooks/use-file-drop";
import { Paperclip } from "lucide-react";
import ChatHeader from "./chat-header";
import MessageComposer from "./message-composer";
import MessageList from "./message-list";
import type { ActiveConversation } from "./types";

export default function ChatWindow({
  conversation,
  chatOpen,
  draft,
  sending,
  loading,
  hasMore,
  typing,
  onBack,
  error,
  onRetry,
  onDraftChange,
  onSend,
  onLoadOlder,
  attachments,
  attachmentError,
  onAttach,
  onRemoveAttachment,
}: {
  conversation: ActiveConversation;
  chatOpen: boolean;
  draft: string;
  sending: boolean;
  loading: boolean;
  hasMore: boolean;
  typing: boolean;
  onBack: () => void;
  error: string;
  onRetry: () => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onLoadOlder: () => void;
  attachments: File[];
  attachmentError: string;
  onAttach: (files: File[]) => void;
  onRemoveAttachment: (index: number) => void;
}) {
  const { dragging, dropProps } = useFileDrop({ onFiles: onAttach });
  return (
    <div
      className={`chat-window${dragging ? " drop-active" : ""}`}
      {...dropProps}
    >
      {dragging && (
        <div className="drop-overlay" aria-hidden="true">
          <Paperclip size={26} />
          Drop files to attach them
        </div>
      )}
      <ChatHeader conversation={conversation} typing={typing} onBack={onBack} />
      {error && (
        <div className="chat-error" role="alert">
          {error}
          <button className="text-button" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
      <MessageList
        conversation={conversation}
        scrollKey={chatOpen}
        loading={loading}
        hasMore={hasMore}
        typing={typing}
        onLoadOlder={onLoadOlder}
      />
      <MessageComposer
        recipient={conversation.name}
        value={draft}
        sending={sending}
        onChange={onDraftChange}
        onSend={onSend}
        attachments={attachments}
        attachmentError={attachmentError}
        onAttach={onAttach}
        onRemoveAttachment={onRemoveAttachment}
      />
    </div>
  );
}
