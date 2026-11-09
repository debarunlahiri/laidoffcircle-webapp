"use client";

import Dialog from "@/components/ui/dialog";
import { LogIn, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignInDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("auth:required", show);
    return () => window.removeEventListener("auth:required", show);
  }, []);

  if (!open) return null;
  const go = (page: "login" | "register") =>
    router.push(
      `/${page}?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
    );

  return (
    <Dialog label="Sign in required" onClose={() => setOpen(false)}>
      <div className="modal-heading">
        <h2>Sign in to continue</h2>
        <button
          className="icon-button"
          aria-label="Close"
          onClick={() => setOpen(false)}
        >
          <X size={21} />
        </button>
      </div>
      <p className="subtle-text">
        You need an account to like, comment, post, follow or message. It only
        takes a minute.
      </p>
      <div className="modal-bottom">
        <button onClick={() => go("register")}>Create account</button>
        <button className="primary" onClick={() => go("login")}>
          <LogIn size={16} />
          Sign in
        </button>
      </div>
    </Dialog>
  );
}
