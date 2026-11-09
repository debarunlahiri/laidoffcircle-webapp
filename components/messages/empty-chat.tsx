import { MessageSquare } from "lucide-react";

export default function EmptyChat({
  loading,
  onFindPeople,
}: {
  loading: boolean;
  onFindPeople: () => void;
}) {
  return (
    <div className="chat-window inbox-empty">
      <MessageSquare size={40} />
      <h3>{loading ? "Loading inbox…" : "Start a conversation"}</h3>
      <p>Choose someone from your network to send a message.</p>
      <button className="primary" onClick={onFindPeople}>
        Find people
      </button>
    </div>
  );
}
