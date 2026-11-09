"use client";

import { useAuth } from "@/providers/auth-provider";
import { MailWarning, X } from "lucide-react";
import { useState } from "react";

// Reminds members with an unconfirmed email to verify it; hidden for Google accounts.
export default function VerifyEmailBanner() {
  const { user, resendVerification } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dismissed, setDismissed] = useState(false);
  if (!user || !user.verificationRequired || dismissed) return null;

  async function resend() {
    setBusy(true);
    setMessage("");
    try {
      await resendVerification();
      setMessage("Verification email sent. Check your inbox.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Couldn’t send the email.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="verify-banner" role="status">
      <MailWarning size={18} />
      <span>
        {message ||
          `Verify your email to post, comment and message. You can browse${
            user.emailVerificationDeadline
              ? ` until ${new Date(user.emailVerificationDeadline).toLocaleString()}`
              : " for a limited time"
          }. We sent a link to ${user.email}.`}
      </span>
      <button type="button" onClick={resend} disabled={busy}>
        Resend email
      </button>
      <button
        type="button"
        className="verify-banner-close"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
      >
        <X size={16} />
      </button>
    </div>
  );
}
