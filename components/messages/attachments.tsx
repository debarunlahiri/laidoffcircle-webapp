"use client";
import type { ApiAttachment } from "@/lib/api-types";
import { fileSize } from "@/lib/referral-meta";
import { FileText, Paperclip, X } from "lucide-react";
import { Lightbox } from "@/components/feed/post-images";
import { useRef, useState } from "react";

export const maxAttachments = 3;
export const maxAttachmentBytes = 5 * 1024 * 1024;
export const attachmentAccept =
  ".png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv";

// Adds picked files to the current ones, enforcing the same limits as the API.
export function addFiles(
  current: File[],
  picked: File[],
): { files: File[]; error: string } {
  const files = [...current];
  let error = "";
  for (const file of picked) {
    if (files.length >= maxAttachments) {
      error = `You can attach up to ${maxAttachments} files.`;
      break;
    }
    if (file.size > maxAttachmentBytes) {
      error = `"${file.name}" is larger than ${fileSize(maxAttachmentBytes)}.`;
      continue;
    }
    files.push(file);
  }
  return { files, error };
}

export function attachmentUrl(
  conversationId: string,
  attachment: ApiAttachment,
  download = false,
) {
  return `/api/backend/conversations/${conversationId}/attachments/${attachment.id}${download ? "?download=1" : ""}`;
}

export function AttachButton({
  disabled,
  onPick,
}: {
  disabled?: boolean;
  onPick: (files: File[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        className="icon-button msg-attach-button"
        aria-label="Attach files"
        title="Attach files"
        disabled={disabled}
        onClick={() => input.current?.click()}
      >
        <Paperclip size={18} />
      </button>
      <input
        ref={input}
        type="file"
        multiple
        hidden
        accept={attachmentAccept}
        onChange={(event) => {
          onPick(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
    </>
  );
}

// Files chosen but not yet sent.
export function AttachmentTray({
  files,
  error,
  onRemove,
}: {
  files: File[];
  error?: string;
  onRemove: (index: number) => void;
}) {
  if (!files.length && !error) return null;
  return (
    <div className="msg-attach-tray">
      {files.map((file, index) => (
        <span className="msg-attach-chip" key={`${file.name}-${index}`}>
          <FileText size={14} />
          <span>{file.name}</span>
          <small>{fileSize(file.size)}</small>
          <button
            type="button"
            aria-label={`Remove ${file.name}`}
            onClick={() => onRemove(index)}
          >
            <X size={13} />
          </button>
        </span>
      ))}
      {error && (
        <p role="alert" className="msg-attach-error">
          {error}
        </p>
      )}
    </div>
  );
}

// Files on a sent message: images show as thumbnails, the rest as file cards.
export function AttachmentList({
  conversationId,
  attachments,
}: {
  conversationId: string;
  attachments?: ApiAttachment[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  if (!attachments?.length) return null;
  const images = attachments.filter((file) => file.mime.startsWith("image/"));
  const urls = images.map((file) => attachmentUrl(conversationId, file));
  return (
    <div className="msg-attachments">
      {open !== null && (
        <Lightbox
          images={urls}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          author="this conversation"
        />
      )}
      {attachments.map((file) =>
        file.mime.startsWith("image/") ? (
          <button
            key={file.id}
            type="button"
            className="msg-attach-image"
            aria-label={`Open ${file.name}`}
            onClick={() => setOpen(images.indexOf(file))}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachmentUrl(conversationId, file)}
              alt={file.name}
              loading="lazy"
            />
          </button>
        ) : (
          <a
            key={file.id}
            href={attachmentUrl(conversationId, file, true)}
            download={file.name}
            className="msg-attach-file"
          >
            <FileText size={20} />
            <span>
              <strong>{file.name}</strong>
              <small>{fileSize(file.size)}</small>
            </span>
          </a>
        ),
      )}
    </div>
  );
}
