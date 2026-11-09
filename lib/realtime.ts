import { api } from "@/lib/api";

export type RealtimeEvent =
  | { type: "ready" }
  | { type: "message.new"; conversationId: string; senderId: string }
  | { type: "message.read"; conversationId: string; readerId: string }
  | { type: "notification" }
  | { type: "typing"; conversationId: string; userId: string; typing: boolean };

type Listener = (event: RealtimeEvent) => void;
type StatusListener = (connected: boolean) => void;

// The browser can't send the HttpOnly session cookie to the API server, so it
// first fetches a one-time ticket through the normal proxy, then opens the socket.
function socketUrl(ticket: string) {
  const explicit = process.env.NEXT_PUBLIC_WS_URL;
  const base =
    explicit ??
    `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:9090/ws`;
  return `${base}?ticket=${encodeURIComponent(ticket)}`;
}

// One shared, self-reconnecting connection for the whole app.
class RealtimeClient {
  private socket: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private statusListeners = new Set<StatusListener>();
  private retry = 0;
  private timer: number | undefined;
  private wanted = false;
  // Bumped on every stop so an in-flight open() from a previous start gives up
  // (React strict mode starts, stops and restarts effects in development).
  private generation = 0;
  connected = false;

  start() {
    if (this.wanted) return;
    this.wanted = true;
    void this.open();
  }
  stop() {
    this.wanted = false;
    this.generation++;
    window.clearTimeout(this.timer);
    this.socket?.close();
    this.socket = null;
    this.setConnected(false);
  }
  send(data: unknown) {
    if (this.socket?.readyState === WebSocket.OPEN)
      this.socket.send(JSON.stringify(data));
  }
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  }
  onStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    return () => void this.statusListeners.delete(listener);
  }

  private setConnected(value: boolean) {
    if (this.connected === value) return;
    this.connected = value;
    this.statusListeners.forEach((listener) => listener(value));
  }
  private async open() {
    const generation = this.generation;
    try {
      const { ticket } = await api<{ ticket: string }>("/ws-ticket", {
        method: "POST",
      });
      if (!this.wanted || generation !== this.generation) return;
      const socket = new WebSocket(socketUrl(ticket));
      this.socket = socket;
      socket.onopen = () => {
        this.retry = 0;
        this.setConnected(true);
      };
      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(String(message.data)) as RealtimeEvent;
          this.listeners.forEach((listener) => listener(event));
        } catch {
          // Ignore malformed frames.
        }
      };
      socket.onclose = () => {
        if (this.socket === socket) this.socket = null;
        this.setConnected(false);
        this.scheduleReconnect();
      };
      socket.onerror = () => socket.close();
    } catch {
      this.setConnected(false);
      this.scheduleReconnect();
    }
  }
  // Exponential backoff (1s, 2s, 4s … 30s) with a little jitter.
  private scheduleReconnect() {
    if (!this.wanted) return;
    window.clearTimeout(this.timer);
    const delay = Math.min(30000, 1000 * 2 ** this.retry++);
    this.timer = window.setTimeout(
      () => void this.open(),
      delay + Math.random() * 500,
    );
  }
}

export const realtime = new RealtimeClient();
