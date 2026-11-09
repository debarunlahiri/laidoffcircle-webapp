"use client";
import Avatar from "@/components/ui/avatar";
import type { ApiNotification } from "@/lib/api-types";
import { initials } from "@/lib/api";
import { notificationMeta } from "@/lib/notification-meta";
import { postedAgo } from "@/lib/referral-meta";

export default function NotificationRow({
  item,
  detailed = false,
  onOpen,
}: {
  item: ApiNotification;
  detailed?: boolean;
  onOpen: (item: ApiNotification) => void;
}) {
  const { label, icon: Icon } = notificationMeta(item);
  const isNew = !item.readAt;
  return (
    <button
      type="button"
      className={`notification-item${isNew ? " is-new" : ""}${detailed ? " detailed" : ""}`}
      onClick={() => onOpen(item)}
    >
      <span className="notification-avatar">
        <Avatar
          initials={initials(item.actorName)}
          src={item.actorImageUrl}
          small={!detailed}
        />
        <span className="notification-type-icon" aria-hidden="true">
          <Icon size={11} />
        </span>
      </span>
      <span className="notification-body">
        <span className="notification-text">{item.text}</span>
        {detailed && item.actorHeadline && (
          <span className="notification-sub">
            {item.actorName} · {item.actorHeadline}
          </span>
        )}
        {item.preview && (
          <span className="notification-preview">“{item.preview}”</span>
        )}
        <span className="notification-meta">
          {isNew && <b className="new-badge">New</b>}
          <span>{label}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={item.createdAt}>{postedAgo(item.createdAt)}</time>
        </span>
      </span>
      {isNew && <i className="new-dot" aria-label="Unread" />}
    </button>
  );
}
