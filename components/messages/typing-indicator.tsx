// Three bouncing dots in an incoming-style bubble. The live region announces it
// once to screen readers instead of animating noise.
export default function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="typing-row" role="status" aria-live="polite">
      <span className="typing-bubble" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="sr-only">{name} is typing</span>
    </div>
  );
}
