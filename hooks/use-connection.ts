"use client";
import { useCallback, useEffect, useState } from "react";

export type ConnectionStatus =
  "checking" | "online" | "offline" | "server-down";

export { connectionMessages } from "@/lib/connection";

// Tests the device's internet and the app server. Rechecks when the browser
// goes on/offline and every 15 seconds while the page is visible.
export function useConnection() {
  const [status, setStatus] = useState<ConnectionStatus>("checking");

  const check = useCallback(async (): Promise<ConnectionStatus> => {
    let next: ConnectionStatus;
    if (!navigator.onLine) next = "offline";
    else {
      try {
        const response = await fetch("/api/health", {
          cache: "no-store",
          signal: AbortSignal.timeout(6000),
        });
        const body = (await response.json()) as { backend?: boolean };
        next = body.backend ? "online" : "server-down";
      } catch {
        // The web app itself didn't answer: the network is the likelier cause.
        next = navigator.onLine ? "server-down" : "offline";
      }
    }
    setStatus(next);
    return next;
  }, []);

  useEffect(() => {
    const run = () => void check();
    run();
    window.addEventListener("online", run);
    window.addEventListener("offline", run);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") run();
    }, 15000);
    return () => {
      window.removeEventListener("online", run);
      window.removeEventListener("offline", run);
      clearInterval(timer);
    };
  }, [check]);

  return { status, check };
}
