"use client";

import {
  checkConnection,
  connectionMessages,
  getConnectionState,
  subscribeConnection,
} from "@/lib/connection";
import { TriangleAlert, WifiOff } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

// Appears whenever the internet or the server can't be reached, and clears itself.
export default function ConnectionBanner() {
  const state = useSyncExternalStore(
    subscribeConnection,
    getConnectionState,
    () => "online" as const,
  );
  useEffect(() => {
    const run = () => void checkConnection(true);
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
  }, []);
  if (state === "online") return null;
  return (
    <div className="conn-banner" role="alert">
      {state === "offline" ? (
        <WifiOff size={18} />
      ) : (
        <TriangleAlert size={18} />
      )}
      <span>{connectionMessages[state]}</span>
      <button onClick={() => void checkConnection(true)}>Retry</button>
    </div>
  );
}
