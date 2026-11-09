"use client";
import { apiMessage } from "@/lib/api";
import { readImageFile } from "@/lib/image-file";
import { useRef, useState, type DragEvent } from "react";

const hasFiles = (event: DragEvent) =>
  Array.from(event.dataTransfer?.types ?? []).includes("Files");

// Drag-and-drop for a single image. Spread `dropProps` on the drop target and
// use `dragging` to show a drop hint.
export function useImageDrop({
  onImages,
  onError,
  canDrop = () => true,
}: {
  onImages: (dataUrls: string[]) => void;
  onError: (message: string) => void;
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
    async onDrop(event: DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth.current = 0;
      setDragging(false);
      if (!canDrop()) return;
      const files = Array.from(event.dataTransfer.files);
      const images = files.filter((item) => item.type.startsWith("image/"));
      if (!images.length)
        return onError("Drop image files (PNG, JPEG, WebP or GIF).");
      const results = await Promise.allSettled(images.map((image) => readImageFile(image)));
      const good = results.flatMap((r) =>
        r.status === "fulfilled" ? [r.value] : [],
      );
      const failed = results.find((r) => r.status === "rejected");
      if (failed) onError(apiMessage((failed as PromiseRejectedResult).reason));
      if (good.length) onImages(good);
    },
  };
  return { dragging, dropProps };
}
