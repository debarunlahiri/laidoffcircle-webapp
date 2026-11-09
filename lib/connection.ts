"use client";
// Shared "can I reach the internet and the server?" state. Used before every
// action that changes data, and by the connection banner.
export type ConnectionState = "online" | "offline" | "server-down";
export const connectionMessages: Record<
  Exclude<ConnectionState, "online">,
  string
> = {
  offline: "You’re offline. Check your internet connection, then try again.",
  "server-down":
    "We can’t reach the LaidOffCircle server right now. Please try again in a moment.",
};

let state: ConnectionState = "online";
let checkedAt = 0;
let pending: Promise<ConnectionState> | null = null;
const listeners = new Set<() => void>();
function set(next: ConnectionState) {
  if (next === state) return;
  state = next;
  listeners.forEach((listener) => listener());
}
export const getConnectionState = () => state;
export function subscribeConnection(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}
// A request just failed at the network level.
export function reportConnectionFailure() {
  checkedAt = 0;
  set(navigator.onLine ? "server-down" : "offline");
}
// A good result is trusted for 10 s so a burst of actions doesn't re-test each time.
export function checkConnection(force = false): Promise<ConnectionState> {
  if (!navigator.onLine) {
    checkedAt = 0;
    set("offline");
    return Promise.resolve("offline");
  }
  if (!force && state === "online" && Date.now() - checkedAt < 10000)
    return Promise.resolve("online");
  pending ??= (async (): Promise<ConnectionState> => {
    let next: ConnectionState;
    try {
      const response = await fetch("/api/health", {
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      });
      const body = (await response.json()) as { backend?: boolean };
      next = body.backend ? "online" : "server-down";
    } catch {
      next = navigator.onLine ? "server-down" : "offline";
    }
    checkedAt = Date.now();
    set(next);
    return next;
  })().finally(() => {
    pending = null;
  });
  return pending;
}
