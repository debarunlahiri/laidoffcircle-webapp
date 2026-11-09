"use client";
import { apiMessage } from "@/lib/api";
import { maxPostImages, readImageFile } from "@/lib/image-file";
import { ImagePlus, X } from "lucide-react";
import { useRef, type ReactNode } from "react";

// Thumbnails of the photos attached to a draft post.
export function PhotoGrid({
  images,
  onRemove,
}: {
  images: string[];
  onRemove: (index: number) => void;
}) {
  if (!images.length) return null;
  return (
    <div className={`composer-photos count-${Math.min(images.length, 4)}`}>
      {images.map((src, index) => (
        <div className="composer-photo" key={`${index}-${src.length}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`Selected photo ${index + 1}`} />
          <button
            type="button"
            className="icon-button"
            aria-label={`Remove photo ${index + 1}`}
            onClick={() => onRemove(index)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

// Multi-file picker. Render `input` once and call `open()` from any button.
export function usePhotoPicker({
  onAdd,
  onError,
  onPicked,
}: {
  onAdd: (dataUrls: string[]) => void;
  onError: (message: string) => void;
  onPicked?: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const input: ReactNode = (
    <input
      ref={ref}
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      multiple
      hidden
      onChange={async (event) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";
        if (!files.length) return;
        const results = await Promise.allSettled(
          files.map((file) => readImageFile(file)),
        );
        const good = results.flatMap((r) =>
          r.status === "fulfilled" ? [r.value] : [],
        );
        const failed = results.find((r) => r.status === "rejected");
        if (failed)
          onError(apiMessage((failed as PromiseRejectedResult).reason));
        if (good.length) {
          onAdd(good);
          onPicked?.();
        }
      }}
    />
  );
  return { input, open: () => ref.current?.click() };
}

export function AddPhotosLabel({ count }: { count: number }) {
  return (
    <>
      <ImagePlus size={17} />
      <span>
        {count ? `Add more photos (${count}/${maxPostImages})` : "Add photos"}
      </span>
    </>
  );
}
