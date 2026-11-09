"use client";
import { useEffect, useId, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { SupportImage } from "@/lib/support";

export const maxSupportImages = 5;
const maxImageBytes = 5 * 1024 * 1024;
const imageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function SelectedImage({
  file,
  onRemove,
  disabled,
}: {
  file: File;
  onRemove: () => void;
  disabled: boolean;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const preview = URL.createObjectURL(file);
    setUrl(preview);
    return () => URL.revokeObjectURL(preview);
  }, [file]);
  return (
    <div className="support-image-preview">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url && <img src={url} alt={file.name} />}
      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
      >
        <X size={15} />
      </button>
      <span title={file.name}>{file.name}</span>
    </div>
  );
}

export function SupportImagePicker({
  files,
  onChange,
  disabled = false,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [error, setError] = useState("");
  return (
    <div className="support-image-picker">
      <div className="support-image-picker-heading">
        <label htmlFor={id}>
          Images <span>(optional)</span>
        </label>
        <span>
          {files.length}/{maxSupportImages}
        </span>
      </div>
      <p id={`${id}-hint`}>
        Add up to 5 screenshots or photos. JPG, PNG, WebP, or GIF; 5 MB each.
      </p>
      {files.length > 0 && (
        <div className="support-image-previews">
          {files.map((file, index) => (
            <SelectedImage
              file={file}
              key={`${index}-${file.name}-${file.lastModified}`}
              disabled={disabled}
              onRemove={() => {
                onChange(files.filter((_, i) => i !== index));
                setError("");
              }}
            />
          ))}
        </div>
      )}
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        disabled={disabled || files.length >= maxSupportImages}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (!selected.length) return;
          if (files.length + selected.length > maxSupportImages) {
            setError(
              "You can attach up to 5 images. Remove one before adding more.",
            );
            return;
          }
          if (selected.some((file) => !imageTypes.has(file.type))) {
            setError("Choose JPG, PNG, WebP, or GIF images.");
            return;
          }
          if (
            selected.some(
              (file) => file.size === 0 || file.size > maxImageBytes,
            )
          ) {
            setError("Each image must be nonempty and 5 MB or smaller.");
            return;
          }
          setError("");
          onChange([...files, ...selected]);
        }}
      />
      <label
        htmlFor={id}
        className={`support-add-images${disabled || files.length >= maxSupportImages ? " is-disabled" : ""}`}
      >
        <ImagePlus size={17} />{" "}
        {files.length ? "Add more images" : "Attach images"}
      </label>
      {error && (
        <p id={`${id}-error`} className="support-image-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function SupportImages({
  images,
  ticketPath,
}: {
  images?: SupportImage[];
  ticketPath: string;
}) {
  if (!images?.length) return null;
  return (
    <div className="support-image-gallery">
      {images.map((image, index) => {
        const url = `/api/backend${ticketPath}/images/${encodeURIComponent(image.id)}`;
        return (
          <a
            href={url}
            key={image.id}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open image ${index + 1}: ${image.name}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={image.name || `Attachment ${index + 1}`}
              loading="lazy"
              width={image.width}
              height={image.height}
            />
            <span>{image.name}</span>
          </a>
        );
      })}
    </div>
  );
}
