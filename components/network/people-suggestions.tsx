"use client";
import VerifiedBadge from "@/components/ui/verified-badge";
import Avatar from "@/components/ui/avatar";
import UserLink from "@/components/ui/user-link";
import { usePlatform } from "@/providers/platform-provider";
import ConnectButton from "@/components/network/connect-button";
import { ArrowRight, Users } from "lucide-react";

export default function PeopleSuggestions() {
  const { suggestedPeople, navigate } = usePlatform();
  const people = suggestedPeople;

  return (
    <section className="card rail-card">
      <div className="rail-heading">
        <h3>People to know</h3>
        <Users size={17} />
      </div>
      <p className="rail-subtitle">A new connection can change everything.</p>
      {!people.length && (
        <p className="rail-subtitle">You’re connected with everyone here.</p>
      )}
      {people.slice(0, 3).map((person) => (
        <div className="suggestion" key={person.id}>
          <UserLink id={person.id} username={person.username}>
            <Avatar
              initials={person.initials}
              color={person.color}
              src={person.imageUrl}
              small
            />
            <div>
              <strong>
                {person.name}
                <VerifiedBadge type={person.badge} />
              </strong>
              {person.username && (
                <span className="user-handle">@{person.username}</span>
              )}
              <span>{person.role}</span>
              {person.detail && <small>{person.detail}</small>}
            </div>
          </UserLink>
          <ConnectButton personId={person.id} iconOnly />
        </div>
      ))}
      <button className="rail-link" onClick={() => navigate("My network")}>
        Explore your network <ArrowRight size={15} />
      </button>
    </section>
  );
}
