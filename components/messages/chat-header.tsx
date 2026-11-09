import Avatar from "@/components/ui/avatar";
import UserLink from "@/components/ui/user-link";
import { ArrowLeft } from "lucide-react";
import type { ActiveConversation } from "./types";

export default function ChatHeader({
  conversation,
  typing = false,
  onBack,
}: {
  conversation: ActiveConversation;
  typing?: boolean;
  onBack: () => void;
}) {
  return (
    <div className="conversation-heading">
      <button
        className="icon-button inbox-back"
        aria-label="Back to inbox"
        onClick={onBack}
      >
        <ArrowLeft size={20} />
      </button>
      <UserLink id={conversation.userId} username={conversation.username}>
        <Avatar
          initials={conversation.initials}
          src={conversation.imageUrl}
          color={conversation.color}
        />
        <span>
          <strong>{conversation.name}</strong>
          <small className={typing ? "typing-label" : undefined}>
            {typing ? "typing…" : conversation.role}
          </small>
        </span>
      </UserLink>
    </div>
  );
}
