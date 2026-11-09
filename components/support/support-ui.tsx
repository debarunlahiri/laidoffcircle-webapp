import { LoaderCircle, RotateCw } from "lucide-react";
import { ticketStatusLabel, type TicketStatus } from "@/lib/support";

export function TicketBadge({
  status,
  admin = false,
}: {
  status: TicketStatus;
  admin?: boolean;
}) {
  return (
    <span className={`support-badge support-status-${status}`}>
      {ticketStatusLabel(status, admin)}
    </span>
  );
}
export function SupportLoading() {
  return (
    <p className="support-loading" role="status">
      <LoaderCircle size={18} className="auth-spinner" /> Loading support…
    </p>
  );
}
export function SupportError({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="support-error" role="alert">
      <p>{message}</p>
      {retry && (
        <button type="button" onClick={retry}>
          <RotateCw size={14} /> Try again
        </button>
      )}
    </div>
  );
}
