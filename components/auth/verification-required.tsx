"use client";

import Link from "next/link";
import BrandLogo from "@/components/ui/brand-logo";
import { useAuth } from "@/providers/auth-provider";
import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";

// Shown instead of the portal once an unverified member's preview window has ended.
export default function VerificationRequired() {
  const { user, refreshSession, resendVerification, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Picks up verification done in another tab or device without a manual refresh.
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refreshSession();
    }, 10000);
    return () => clearInterval(timer);
  }, [refreshSession]);

  async function resend() {
    setBusy(true);
    setMessage("");
    try {
      await resendVerification();
      setMessage(
        "A new verification email is on its way. Check your inbox and spam folder.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Couldn’t send the email.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="verify-page">
      <div className="verify-card" role="alert">
        <BrandLogo href="/" />
        <MailCheck className="verify-bad" size={44} />
        <h2>Verify your email to continue</h2>
        <p>
          Your free preview of LaidOffCircle has ended. Confirm{" "}
          <strong>{user?.email}</strong> to get back in. We sent you a link when
          you signed up. Open it, then come back here.
        </p>
        <button
          className="primary verify-action"
          onClick={resend}
          disabled={busy}
        >
          {busy ? "Sending…" : "Resend verification email"}
        </button>
        <button
          className="verify-secondary"
          onClick={() => void refreshSession()}
        >
          I’ve verified, continue
        </button>
        {message && <p className="verify-note">{message}</p>}
        <Link href="/support" className="verify-secondary">
          Need help? Contact support
        </Link>
        <button className="adm-link" onClick={() => void logout()}>
          Sign out
        </button>
      </div>
    </div>
  );
}
