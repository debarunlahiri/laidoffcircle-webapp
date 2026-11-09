"use client";

import { useAuth } from "@/providers/auth-provider";
import { Clock, MailCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

// Opens when an unverified member tries to do anything other than look around.
export default function VerifyPrompt() {
  const { user, refreshSession, resendVerification } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const show = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "EMAIL_NOT_VERIFIED") {
        setMessage("");
        setOpen(true);
      }
    };
    window.addEventListener("auth:unverified", show);
    return () => window.removeEventListener("auth:unverified", show);
  }, []);
  // Verified (e.g. in another tab): nothing left to prompt.
  useEffect(() => {
    if (user && !user.verificationRequired) setOpen(false);
  }, [user]);
  if (!open || !user) return null;

  const deadline = user.emailVerificationDeadline
    ? new Date(user.emailVerificationDeadline).toLocaleString()
    : null;
  async function resend() {
    setBusy(true);
    setMessage("");
    try {
      await resendVerification();
      setMessage("Verification email sent. Check your inbox and spam folder.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Couldn’t send the email.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="vp-overlay" onClick={() => setOpen(false)}>
      <div
        className="vp-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vp-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="vp-close"
          aria-label="Close"
          onClick={() => setOpen(false)}
        >
          <X size={18} />
        </button>
        <span className="vp-icon" aria-hidden="true">
          <MailCheck size={28} />
        </span>
        <h2 id="vp-title">Verify your email to continue</h2>
        <p className="vp-text">
          Confirm your address to post, comment, message, connect or make any
          other change.
        </p>
        <span className="vp-email">{user.email}</span>
        {deadline && (
          <div className="vp-deadline">
            <Clock size={16} />
            <span>
              You can keep browsing until <strong>{deadline}</strong>. After
              that, verification is required to sign in.
            </span>
          </div>
        )}
        <div className="vp-actions">
          <button className="primary" onClick={resend} disabled={busy}>
            {busy ? "Sending…" : "Resend verification email"}
          </button>
          <button onClick={() => void refreshSession()}>I’ve verified</button>
        </div>
        {message && (
          <p className="vp-note" role="status">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
