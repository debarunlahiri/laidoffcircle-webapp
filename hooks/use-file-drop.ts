"use client";
import { useRef, useState, type DragEvent } from "react";

const hasFiles = (event: DragEvent) =>
  Array.from(event.dataTransfer?.types ?? []).includes("Files");

// Drag-and-drop for raw File objects (unlike useImageDrop, which reads data
// URLs). Spread `dropProps` on the drop target; `dragging` shows the hint.
export function useFileDrop({
  onFiles,
  canDrop = () => true,
}: {
  onFiles: (files: File[]) => void;
  canDrop?: () => boolean;
}) {
  const [dragging, setDragging] = useState(false);
  // dragenter/dragleave fire for child elements too, so count them.
  const depth = useRef(0);

  const dropProps = {
    onDragEnter(event: DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth.current += 1;
      setDragging(true);
    },
    onDragOver(event: DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    onDragLeave(event: DragEvent) {
      if (!hasFiles(event)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    },
    onDrop(event: DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth.current = 0;
      setDragging(false);
      if (!canDrop()) return;
      const files = Array.from(event.dataTransfer.files);
      if (files.length) onFiles(files);
    },
  };
  return { dragging, dropProps };
}
