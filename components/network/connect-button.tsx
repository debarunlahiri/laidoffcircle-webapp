"use client";
import { usePlatform } from "@/providers/platform-provider";
import { Check, Clock, UserPlus, X } from "lucide-react";

// Connect / Requested / Connected for one person; incoming requests get Accept + Decline.
export default function ConnectButton({
  personId,
  iconOnly = false,
}: {
  personId?: string;
  iconOnly?: boolean;
}) {
  const {
    connections,
    currentUser,
    toggleConnection,
    acceptConnection,
    networkPending,
  } = usePlatform();
  const link = connections.find(
    (item) =>
      (item.requester_id === currentUser?.id
        ? item.recipient_id
        : item.requester_id) === personId,
  );
  const busy =
    !personId ||
    networkPending.includes(personId) ||
    (link ? networkPending.includes(link.id) : false);
  const incoming =
    link?.status === "pending" && link.recipient_id === currentUser?.id;

  if (incoming)
    return (
      <>
        <button
          className={`connect-btn connect-primary${iconOnly ? " icon-only" : ""}`}
          aria-label="Accept request"
          title="Accept request"
          disabled={busy}
          onClick={() => void acceptConnection(link!.id)}
        >
          <Check size={16} />
          {!iconOnly && " Accept"}
        </button>
        <button
          className="connect-icon"
          aria-label="Decline request"
          title="Decline request"
          disabled={busy}
          onClick={() => personId && void toggleConnection(personId)}
        >
          <X size={16} />
        </button>
      </>
    );
  const state = !link
    ? {
        label: "Connect",
        title: undefined,
        icon: <UserPlus size={16} />,
        cls: "connect-primary",
      }
    : link.status === "accepted"
      ? {
          label: "Connected",
          title: "Disconnect",
          icon: <Check size={16} />,
          cls: "connect-done",
        }
      : {
          label: "Requested",
          title: "Cancel request",
          icon: <Clock size={16} />,
          cls: "connect-pending",
        };
  return (
    <button
      className={`connect-btn ${state.cls}${iconOnly ? " icon-only" : ""}`}
      title={state.title ?? state.label}
      aria-label={state.title ? `${state.label}. ${state.title}` : state.label}
      disabled={busy}
      onClick={() => personId && void toggleConnection(personId)}
    >
      {state.icon}
      {!iconOnly && state.label}
    </button>
  );
}
