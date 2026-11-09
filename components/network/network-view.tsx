"use client";
import ConnectionRequests from "@/components/network/connection-requests";
import NetworkStats from "@/components/network/network-stats";
import PersonCard from "@/components/network/person-card";
import { usePlatform } from "@/providers/platform-provider";
import { Users } from "lucide-react";
export default function NetworkView() {
  const {
    suggestedPeople,
    connections,
    currentUser,
    networkStats,
    networkLoading,
    networkError,
    peopleHasMore,
    loadMorePeople,
    connectionsHasMore,
    loadMoreConnections,
  } = usePlatform();
  // People who already asked to connect are shown in the requests panel above.
  const requesters = new Set(
    connections
      .filter(
        (link) =>
          link.recipient_id === currentUser?.id && link.status === "pending",
      )
      .map((link) => link.requester_id),
  );
  const discover = suggestedPeople.filter(
    (person) => !requesters.has(person.id ?? ""),
  );
  return (
    <>
      <NetworkStats stats={networkStats} />
      <ConnectionRequests />
      <div className="section-bar">
        <div>
          <h2>People to take the next step with</h2>
          <p className="section-sub">Members from across the community.</p>
        </div>
        <Users size={19} />
      </div>
      {networkLoading && <p role="status">Loading your network…</p>}
      {networkError && <p role="alert">{networkError}</p>}
      <div className="people-grid">
        {discover.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>
      {!networkLoading && !networkError && !discover.length && (
        <p className="empty card">No people to discover yet.</p>
      )}
      {peopleHasMore && (
        <button
          className="secondary"
          disabled={networkLoading}
          onClick={() => void loadMorePeople()}
        >
          Load more people
        </button>
      )}
      {connectionsHasMore && (
        <button
          className="secondary"
          disabled={networkLoading}
          onClick={() => void loadMoreConnections()}
        >
          Load more connections
        </button>
      )}
    </>
  );
}
