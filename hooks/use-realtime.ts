"use client";
import { invalidate } from "@/lib/api";
import { realtime } from "@/lib/realtime";
import { useEffect, useState } from "react";

// Keeps the socket open while signed in, and turns server events into reloads
// of the data they affect. Returns whether the live connection is up so callers
// can fall back to polling when it isn't.
export function useRealtimeConnection(userId: string | undefined) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;
    realtime.start();
    const stopStatus = realtime.onStatus(setConnected);
    const stopEvents = realtime.subscribe((event) => {
      if (event.type === "message.new")
        invalidate("conversations", "notifications");
      else if (event.type === "message.read") invalidate("conversations");
      else if (event.type === "notification") invalidate("notifications");
    });
    setConnected(realtime.connected);
    return () => {
      stopStatus();
      stopEvents();
      realtime.stop();
      setConnected(false);
    };
  }, [userId]);

  return connected;
}
