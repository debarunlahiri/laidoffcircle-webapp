"use client";
import ConnectButton from "@/components/network/connect-button";
import Avatar from "@/components/ui/avatar";
import UserLink from "@/components/ui/user-link";
import { mediaUrl } from "@/lib/api";
import { usePlatform } from "@/providers/platform-provider";
import type { Person } from "@/types";
import { LoaderCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

// A stable accent colour per person, so cards feel distinct without extra data.
const hue = (name: string) =>
  [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;

export default function PersonCard({ person }: { person: Person }) {
  const { startConversation, startingChatUserId } = usePlatform();
  return (
    <article
      className="person-card pc card"
      style={{ "--hue": hue(person.name) } as CSSProperties}
    >
      <div
        className={`pc-banner${person.coverUrl ? " has-cover" : ""}`}
        style={
          person.coverUrl
            ? { backgroundImage: `url(${mediaUrl(person.coverUrl)})` }
            : undefined
        }
        aria-hidden="true"
      />
      <div className="pc-avatar">
        <UserLink id={person.id} username={person.username}>
          <Avatar
            initials={person.initials}
            color={person.color}
            src={person.imageUrl}
          />
        </UserLink>
      </div>
      <div className="pc-body">
        <h3>
          {person.id ? (
            <Link
              className="pc-profile-link"
              href={`/users/${person.username || person.id}`}
              aria-label={`View ${person.name}’s profile`}
            >
              {person.name}
            </Link>
          ) : (
            person.name
          )}
        </h3>
        {person.username && <p className="user-handle">@{person.username}</p>}
        <p className="pc-role">{person.role || "Community member"}</p>
        {person.detail && <span className="pc-detail">{person.detail}</span>}
      </div>
      <div className="pc-actions">
        <ConnectButton personId={person.id} />
        <button
          className="pc-message"
          aria-label={`Message ${person.name}`}
          title="Message"
          disabled={!person.id || Boolean(startingChatUserId)}
          aria-busy={startingChatUserId === person.id}
          onClick={() => person.id && void startConversation(person.id)}
        >
          {startingChatUserId === person.id ? (
            <LoaderCircle size={18} className="chat-start-spinner" />
          ) : (
            <MessageCircle size={18} />
          )}
        </button>
      </div>
    </article>
  );
}
