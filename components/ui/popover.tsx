"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import BottomSheet from "./bottom-sheet";

export default function Popover({
  label,
  icon,
  children,
  presentation = "popover",
}: {
  label: string;
  icon: ReactNode;
  children: (close: () => void) => ReactNode;
  presentation?: "popover" | "sheet";
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open || presentation === "sheet") return;
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    root.current
      ?.querySelector<HTMLElement>(
        ".control-popover-panel button, .control-popover-panel select",
      )
      ?.focus();
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, presentation]);
  function close() {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }
  return (
    <div
      className="control-popover"
      ref={root}
      onBlur={(event) => {
        if (
          presentation === "popover" &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="icon-button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup={presentation === "sheet" ? "dialog" : undefined}
        aria-controls={open && presentation === "popover" ? id : undefined}
        onClick={() => setOpen(!open)}
      >
        {icon}
      </button>
      {open && presentation === "sheet" && (
        <BottomSheet title={label} onClose={close}>
          <div className="bottom-sheet-menu">{children(close)}</div>
        </BottomSheet>
      )}
      {open && presentation === "popover" && (
        <div
          id={id}
          className="control-popover-panel"
          role="region"
          aria-label={label}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}
