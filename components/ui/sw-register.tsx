"use client";
import { useEffect } from "react";

/**
 * Registers the service worker once the app has hydrated.
 * Silent on browsers that don't support service workers.
 */
export default function SwRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    )
      return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.debug("[SW] registered:", reg.scope);
        // Check for updates every 60 s while the tab is open
        const id = setInterval(() => reg.update(), 60_000);
        return () => clearInterval(id);
      })
      .catch((err) => console.warn("[SW] registration failed:", err));
  }, []);

  return null;
}
