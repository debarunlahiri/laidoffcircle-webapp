"use client";

import BrandLogo from "@/components/ui/brand-logo";
import { useAuth } from "@/providers/auth-provider";
import { CircleCheck, LoaderCircle, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type State =
  | { status: "working" }
  | { status: "done" }
  | { status: "failed"; message: string };

export default function VerifyEmail() {
  const token = useSearchParams().get("token") ?? "";
  const { user, refreshSession, resendVerification } = useAuth();
  const [state, setState] = useState<State>(
    token
      ? { status: "working" }
      : { status: "failed", message: "This verification link is incomplete." },
  );
  const [resent, setResent] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true; // links are single-use, so never submit twice
    (async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          cache: "no-store",
        });
        const data = await response.json().catch(() => null);
        if (!response.ok)
          throw new Error(
            data?.error?.message ??
              "We couldn’t verify your email. Please try again.",
          );
        setState({ status: "done" });
        void refreshSession();
      } catch (error) {
        setState({
          status: "failed",
          message:
            error instanceof Error
              ? error.message
              : "We couldn’t verify your email. Please try again.",
        });
      }
    })();
  }, [token, refreshSession]);

  async function resend() {
    setResent("");
    try {
      await resendVerification();
      setResent("A new verification email is on its way.");
    } catch (error) {
      setResent(
        error instanceof Error
          ? error.message
          : "Couldn’t send the email. Please try again.",
      );
    }
  }

  return (
    <div className="verify-page">
      <div className="verify-card" role="status" aria-live="polite">
        <BrandLogo href="/" />
        {state.status === "working" && (
          <>
            <LoaderCircle className="auth-spinner" size={32} />
            <h2>Verifying your email…</h2>
          </>
        )}
        {state.status === "done" && (
          <>
            <CircleCheck className="verify-ok" size={40} />
            <h2>Email verified</h2>
            <p>Thanks! Your email address is confirmed.</p>
            <Link className="primary verify-action" href="/">
              Continue to LaidOffCircle
            </Link>
          </>
        )}
        {state.status === "failed" && (
          <>
            <TriangleAlert className="verify-bad" size={40} />
            <h2>Link not valid</h2>
            <p>{state.message}</p>
            {user ? (
              <>
                <button className="primary verify-action" onClick={resend}>
                  Send me a new link
                </button>
                {resent && <p className="verify-note">{resent}</p>}
              </>
            ) : (
              <Link className="primary verify-action" href="/login?next=%2F">
                Sign in to request a new link
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
