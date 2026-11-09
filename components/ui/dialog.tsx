"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

type DialogProps = {
  label: string;
  onClose: () => void;
  className?: string;
  backdropClassName?: string;
  // Extra props for the dialog element (e.g. drag-and-drop handlers).
  sectionProps?: HTMLAttributes<HTMLElement>;
  children: ReactNode;
};

export default function Dialog({
  label,
  onClose,
  className = "",
  backdropClassName = "",
  sectionProps,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusableSelector =
      'button:not(:disabled), input, textarea, select, a[href], [tabindex="0"]';
    const firstInput = dialog?.querySelector<HTMLElement>("textarea, input");
    const firstControl = dialog?.querySelector<HTMLElement>(focusableSelector);
    (firstInput || firstControl || dialog)?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "Tab" || !dialog) return;
      const controls = [
        ...dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div className={`modal-backdrop ${backdropClassName}`} onClick={onClose}>
      <section
        {...sectionProps}
        ref={dialogRef}
        className={`modal card ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </section>
    </div>
  );
}
