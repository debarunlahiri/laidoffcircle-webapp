"use client";
import Avatar from "@/components/ui/avatar";
import UserLink from "@/components/ui/user-link";
import { initials } from "@/lib/api";
import { usePlatform } from "@/providers/platform-provider";
import { Check, X } from "lucide-react";

// Incoming connection requests with one-tap accept / decline.
export default function ConnectionRequests() {
  const {
    connections,
    currentUser,
    acceptConnection,
    toggleConnection,
    networkPending,
  } = usePlatform();
  const incoming = connections.filter(
    (link) =>
      link.recipient_id === currentUser?.id && link.status === "pending",
  );
  if (!incoming.length) return null;
  return (
    <section className="card rq" aria-label="Connection requests">
      <header className="rq-head">
        <h2>Connection requests</h2>
        <span className="count-pill">{incoming.length}</span>
      </header>
      <ul className="rq-list">
        {incoming.map((link) => (
          <li className="rq-item" key={link.id}>
            <UserLink id={link.requester_id}>
              <Avatar
                initials={initials(link.name)}
                src={link.profileImageUrl}
              />
            </UserLink>
            <div className="rq-who">
              <UserLink id={link.requester_id}>
                <strong>{link.name}</strong>
              </UserLink>
              <small>{link.role || "Community member"}</small>
            </div>
            <div className="rq-actions">
              <button
                className="rq-accept"
                disabled={networkPending.includes(link.id)}
                onClick={() => void acceptConnection(link.id)}
              >
                <Check size={15} /> Accept
              </button>
              <button
                className="rq-decline"
                aria-label={`Decline ${link.name}`}
                disabled={networkPending.includes(link.requester_id)}
                onClick={() => void toggleConnection(link.requester_id)}
              >
                <X size={15} /> Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
