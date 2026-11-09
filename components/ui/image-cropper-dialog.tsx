"use client";
import Dialog from "@/components/ui/dialog";
import { Check, X, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";

type Props = {
  label: string;
  src: string; // data URL of the chosen image
  aspect: number; // width / height of the final image
  outputWidth: number; // pixels
  round?: boolean; // circular preview (avatars)
  saving?: boolean;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
};

const frameWidth = 360; // CSS px of the crop frame; height follows aspect
const maxZoom = 4;

// Pan and zoom an image inside a fixed frame, then export exactly what is framed.
export default function ImageCropperDialog({
  label,
  src,
  aspect,
  outputWidth,
  round = false,
  saving = false,
  onCancel,
  onConfirm,
}: Props) {
  const frameHeight = Math.round(frameWidth / aspect);
  const image = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");

  // Scale at zoom 1: the image just covers the frame.
  const base = size ? Math.max(frameWidth / size.w, frameHeight / size.h) : 1;
  const scale = base * zoom;

  function clamp(x: number, y: number, nextScale: number) {
    if (!size) return { x, y };
    return {
      x: Math.min(0, Math.max(frameWidth - size.w * nextScale, x)),
      y: Math.min(0, Math.max(frameHeight - size.h * nextScale, y)),
    };
  }

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      image.current = img;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const s = Math.max(frameWidth / w, frameHeight / h);
      setSize({ w, h });
      setOffset({ x: (frameWidth - w * s) / 2, y: (frameHeight - h * s) / 2 });
    };
    img.onerror = () => setError("This image could not be opened.");
    img.src = src;
  }, [src, frameHeight]);

  function changeZoom(next: number) {
    if (!size) return;
    // Keep the point at the frame's centre fixed while zooming.
    const cx = (frameWidth / 2 - offset.x) / scale;
    const cy = (frameHeight / 2 - offset.y) / scale;
    const nextScale = base * next;
    setZoom(next);
    setOffset(
      clamp(
        frameWidth / 2 - cx * nextScale,
        frameHeight / 2 - cy * nextScale,
        nextScale,
      ),
    );
  }

  function onPointerDown(event: PointerEvent) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  }
  function onPointerMove(event: PointerEvent) {
    const start = drag.current;
    if (!start) return;
    setOffset(
      clamp(
        start.ox + event.clientX - start.x,
        start.oy + event.clientY - start.y,
        scale,
      ),
    );
  }

  function confirm() {
    const img = image.current;
    if (!img || !size) return;
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = Math.round(outputWidth / aspect);
    const context = canvas.getContext("2d");
    if (!context) return setError("Cropping isn’t supported in this browser.");
    context.imageSmoothingQuality = "high";
    context.drawImage(
      img,
      -offset.x / scale,
      -offset.y / scale,
      frameWidth / scale,
      frameHeight / scale,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    canvas.toBlob(
      (blob) =>
        blob ? onConfirm(blob) : setError("Could not crop this image."),
      "image/webp",
      0.9,
    );
  }

  return (
    <Dialog label={label} onClose={onCancel} className="cropper-dialog">
      <div className="modal-heading">
        <h2>{label}</h2>
        <button
          className="icon-button"
          aria-label="Cancel cropping"
          onClick={onCancel}
        >
          <X size={21} />
        </button>
      </div>
      <p className="subtle-text">Drag to reposition. Use the slider to zoom.</p>
      <div
        className={`cropper-frame${round ? " round" : ""}`}
        style={{ width: frameWidth, height: frameHeight }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        {size && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            draggable={false}
            style={{
              width: size.w * scale,
              height: size.h * scale,
              transform: `translate(${offset.x}px, ${offset.y}px)`,
            }}
          />
        )}
      </div>
      <label className="cropper-zoom">
        <ZoomIn size={18} aria-hidden="true" />
        <input
          type="range"
          min={1}
          max={maxZoom}
          step={0.01}
          value={zoom}
          aria-label="Zoom"
          onChange={(event) => changeZoom(Number(event.target.value))}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <div className="modal-bottom">
        <button className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="primary"
          disabled={!size || saving}
          onClick={confirm}
        >
          <Check size={16} />
          {saving ? "Saving…" : "Save photo"}
        </button>
      </div>
    </Dialog>
  );
}
