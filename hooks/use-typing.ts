"use client";
import { realtime } from "@/lib/realtime";
import { useCallback, useEffect, useRef, useState } from "react";

const pingEvery = 2500; // resend "typing" at most this often while keys are pressed
const expireAfter = 4500; // hide the indicator if no update arrives

// Typing indicator over the shared WebSocket.
export function useTyping(conversationId: string | null) {
  const [partnerTyping, setPartnerTyping] = useState(false);
  const lastPing = useRef(0);
  const sent = useRef(false);
  const expiry = useRef<number | undefined>(undefined);
  const idle = useRef<number | undefined>(undefined);

  const stopSending = useCallback(() => {
    window.clearTimeout(idle.current);
    if (sent.current && conversationId)
      realtime.send({ type: "typing", conversationId, typing: false });
    sent.current = false;
    lastPing.current = 0;
  }, [conversationId]);

  useEffect(() => {
    setPartnerTyping(false);
    if (!conversationId) return;
    const stop = realtime.subscribe((event) => {
      if (event.type === "typing" && event.conversationId === conversationId) {
        window.clearTimeout(expiry.current);
        setPartnerTyping(event.typing);
        if (event.typing)
          expiry.current = window.setTimeout(
            () => setPartnerTyping(false),
            expireAfter,
          );
      } else if (
        event.type === "message.new" &&
        event.conversationId === conversationId
      ) {
        // A delivered message means they're no longer typing it.
        window.clearTimeout(expiry.current);
        setPartnerTyping(false);
      }
    });
    return () => {
      stop();
      window.clearTimeout(expiry.current);
      stopSending();
    };
  }, [conversationId, stopSending]);

  // Call on every keystroke; sends a throttled ping and a "stopped" after a pause.
  const notifyTyping = useCallback(
    (hasText: boolean) => {
      if (!conversationId) return;
      if (!hasText) return stopSending();
      const now = Date.now();
      if (now - lastPing.current >= pingEvery) {
        lastPing.current = now;
        sent.current = true;
        realtime.send({ type: "typing", conversationId, typing: true });
      }
      window.clearTimeout(idle.current);
      idle.current = window.setTimeout(stopSending, 3000);
    },
    [conversationId, stopSending],
  );

  return { partnerTyping, notifyTyping, stopTyping: stopSending };
}
