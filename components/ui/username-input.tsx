"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export const usernamePattern = /^[a-z0-9_]{3,30}$/;

type Status = "idle" | "checking" | "available" | "unavailable";

// Username field with a live availability check. `current` is the member's own
// username so keeping it unchanged is never reported as taken.
export default function UsernameInput({
  value,
  onChange,
  current,
  onValidity,
  id = "username",
  name,
}: {
  value: string;
  onChange: (value: string) => void;
  current?: string;
  onValidity?: (valid: boolean) => void;
  id?: string;
  name?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [reason, setReason] = useState("");
  const normalized = value.trim().replace(/^@/, "").toLowerCase();

  useEffect(() => {
    if (!normalized || normalized === current) {
      setStatus("idle");
      setReason("");
      onValidity?.(normalized === current && Boolean(normalized));
      return;
    }
    if (!usernamePattern.test(normalized)) {
      setStatus("unavailable");
      setReason("Use 3–30 letters, numbers or underscores.");
      onValidity?.(false);
      return;
    }
    setStatus("checking");
    onValidity?.(false);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await api<{ available: boolean; reason?: string }>(
          `/users/username-available?username=${encodeURIComponent(normalized)}`,
          { signal: controller.signal },
        );
        setStatus(result.available ? "available" : "unavailable");
        setReason(result.reason ?? "");
        onValidity?.(result.available);
      } catch {
        if (controller.signal.aborted) return;
        // The server re-checks on submit, so a failed lookup should not block typing.
        setStatus("idle");
        onValidity?.(true);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized, current]);

  return (
    <label className="field-label" htmlFor={id}>
      Username
      <span className="username-field">
        <span aria-hidden="true">@</span>
        <input
          id={id}
          name={name}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={31}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="your_username"
          aria-describedby={`${id}-hint`}
          aria-invalid={status === "unavailable"}
        />
      </span>
      <small
        id={`${id}-hint`}
        className={`username-hint ${status}`}
        role="status"
      >
        {status === "checking" && "Checking…"}
        {status === "available" && `@${normalized} is available`}
        {status === "unavailable" && reason}
        {status === "idle" && "Letters, numbers and underscores. 3–30 characters."}
      </small>
    </label>
  );
}
