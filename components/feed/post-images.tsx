"use client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePhotoGestures } from "@/hooks/use-photo-gestures";

const maxTiles = 4;

// Photos on a post: 1–4 tiles in a grid (extra photos collapse into "+N"),
// and a lightbox with keyboard navigation.
export default function PostImages({
  images,
  author,
}: {
  images: string[];
  author: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  if (!images.length) return null;
  const tiles = images.slice(0, maxTiles);
  const extra = images.length - maxTiles;
  return (
    <>
      <div className={`post-images count-${tiles.length}`}>
        {tiles.map((src, index) => (
          <button
            key={src}
            type="button"
            className="post-image-tile"
            aria-label={`Open photo ${index + 1} of ${images.length}`}
            onClick={() => setOpen(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Photo ${index + 1} shared by ${author}`} />
            {extra > 0 && index === maxTiles - 1 && (
              <span className="post-image-more">+{extra}</span>
            )}
          </button>
        ))}
      </div>
      {open !== null && (
        <Lightbox
          images={images}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          author={author}
        />
      )}
    </>
  );
}

export function Lightbox({
  images,
  index,
  onIndex,
  onClose,
  author,
}: {
  images: string[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  author: string;
}) {
  const viewer = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const current = useRef({ index, images, onIndex, onClose });
  const gestures = usePhotoGestures({
    photo: `${index}:${images[index]}`,
    onNext: () => onIndex((index + 1) % images.length),
    onPrevious: () => onIndex((index - 1 + images.length) % images.length),
    onClose,
    canNavigate: images.length > 1,
  });
  useEffect(() => {
    current.current = { index, images, onIndex, onClose };
  }, [index, images, onIndex, onClose]);
  useEffect(() => {
    const previous = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    function key(event: KeyboardEvent) {
      const { index, images, onIndex, onClose } = current.current;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        onIndex((index + direction + images.length) % images.length);
      } else if (event.key === "Tab") {
        const controls =
          viewer.current?.querySelectorAll<HTMLButtonElement>("button");
        const first = controls?.[0];
        const last = controls?.[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", key);
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <div
      ref={viewer}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photos shared by ${author}`}
      style={{
        backgroundColor: `rgba(8, 10, 14, ${gestures.transform.scale === 1 ? Math.max(0.35, 1 - Math.max(0, gestures.transform.y) / 500) : 1})`,
        transition: gestures.dragging ? "none" : "background-color 220ms ease",
      }}
      onClick={onClose}
    >
      <button
        ref={closeButton}
        type="button"
        className="lightbox-close"
        aria-label="Close photo viewer"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <X size={22} />
      </button>
      {images.length > 1 && (
        <button
          className="lightbox-nav prev"
          aria-label="Previous photo"
          onClick={(event) => {
            event.stopPropagation();
            onIndex((index - 1 + images.length) % images.length);
          }}
        >
          <ChevronLeft size={28} />
        </button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...gestures.props}
        style={{
          transform: `translate(${gestures.transform.x}px, ${gestures.transform.y}px) scale(${gestures.transform.scale})`,
          cursor:
            gestures.transform.scale > 1
              ? gestures.dragging
                ? "grabbing"
                : "grab"
              : "pointer",
        }}
        src={images[index]}
        alt={`Photo ${index + 1} of ${images.length} shared by ${author}`}
        onClick={(event) => event.stopPropagation()}
      />
      {images.length > 1 && (
        <>
          <button
            className="lightbox-nav next"
            aria-label="Next photo"
            onClick={(event) => {
              event.stopPropagation();
              onIndex((index + 1) % images.length);
            }}
          >
            <ChevronRight size={28} />
          </button>
          <span className="lightbox-count">
            {index + 1} / {images.length}
          </span>
        </>
      )}
    </div>,
    document.body,
  );
}
