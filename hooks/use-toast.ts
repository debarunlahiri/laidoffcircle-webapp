"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ToastKind = "success" | "warning" | "error";

const errorPattern =
  /\b(unavailable|could not|couldn't|can't|cannot|unable|failed|failure|error|invalid|not found|denied|forbidden|unauthori[sz]ed|expired|too large|too big|not allowed|try again|went wrong|rejected)\b/i;
const warningPattern =
  /\b(already|limit|too many|slow down|offline|sign in|log in|not saved|no changes|nothing to|at most|at least|must|required|check your)\b/i;

// Existing callers pass only a message; the tone is read from the wording so
// every toast is colour-coded without touching each call site.
export function toastKind(message: string): ToastKind {
  if (errorPattern.test(message)) return "error";
  if (warningPattern.test(message)) return "warning";
  return "success";
}

export function useToast() {
  const [toast, setToast] = useState("");
  const [kind, setKind] = useState<ToastKind>("success");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast("");
  }, []);

  const notify = useCallback((message: string, tone?: ToastKind) => {
    if (timer.current) clearTimeout(timer.current);
    const next = tone ?? toastKind(message);
    setKind(next);
    setToast(message);
    // Problems stay longer so they can be read.
    timer.current = setTimeout(
      () => setToast(""),
      next === "success" ? 3500 : 7000,
    );
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { toast, toastKind: kind, notify, dismissToast };
}
