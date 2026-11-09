"use client";

import Dialog from "@/components/ui/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export default function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return createPortal(
    <Dialog
      label={title}
      onClose={onClose}
      className="bottom-sheet"
      backdropClassName="bottom-sheet-backdrop"
    >
      <div className="bottom-sheet-handle" aria-hidden="true" />
      <header className="bottom-sheet-heading">
        <h2>{title}</h2>
        <button
          type="button"
          className="icon-button"
          aria-label={`Close ${title.toLowerCase()}`}
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </header>
      <div className="bottom-sheet-content">{children}</div>
    </Dialog>,
    document.body,
  );
}
