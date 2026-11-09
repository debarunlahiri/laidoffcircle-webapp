"use client";
import { imageRuleMessage, imageTypes, maxImageBytes } from "@/lib/image-file";
import { pastedImages } from "@/lib/paste-files";
import { usePlatform } from "@/providers/platform-provider";
import { useFileDrop } from "@/hooks/use-file-drop";
import { ImagePlus, LoaderCircle, Send, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

// One input used for new comments and replies. A photo or GIF can be attached.
export default function CommentForm({
  label,
  placeholder,
  initialText = "",
  autoFocus = false,
  pending,
  onSubmit,
  onCancel,
}: {
  label: string;
  placeholder: string;
  initialText?: string;
  autoFocus?: boolean;
  pending: boolean;
  onSubmit: (text: string, file?: File) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const { notify } = usePlatform();
  const [text, setText] = useState(initialText);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    const field = input.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(132, Math.max(44, field.scrollHeight))}px`;
  }, [text]);
  useEffect(() => {
    if (!autoFocus) return;
    input.current?.focus();
    input.current?.setSelectionRange(text.length, text.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const { dragging, dropProps } = useFileDrop({
    onFiles: (dropped) => {
      const image = dropped.find((item) => item.type.startsWith("image/"));
      if (
        !image ||
        !imageTypes.includes(image.type) ||
        image.size > maxImageBytes
      )
        notify(imageRuleMessage);
      else setFile(image);
    },
  });
  const canSend = Boolean(text.trim() || file) && !pending;

  return (
    <form
      className={`comment-form comment-composer${dragging ? " drop-active" : ""}`}
      aria-busy={pending}
      {...dropProps}
      onSubmit={async (event) => {
        event.preventDefault();
        if (!canSend) return;
        if (await onSubmit(text.trim(), file ?? undefined)) {
          setText("");
          setFile(null);
          onCancel?.();
        }
      }}
    >
      {dragging && (
        <div className="drop-overlay" aria-hidden="true">
          <ImagePlus size={20} />
          Drop a photo or GIF
        </div>
      )}
      {preview && (
        <div className="comment-attachment">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Attached photo or GIF" />
          <button
            type="button"
            aria-label="Remove attachment"
            onClick={() => setFile(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}
      <input
        ref={picker}
        type="file"
        hidden
        accept={imageTypes.join(",")}
        onChange={(event) => {
          const picked = event.target.files?.[0];
          event.target.value = "";
          if (!picked) return;
          if (!imageTypes.includes(picked.type) || picked.size > maxImageBytes)
            notify(imageRuleMessage);
          else setFile(picked);
        }}
      />
      <textarea
        ref={input}
        className="comment-composer-text"
        rows={1}
        aria-label={label}
        placeholder={placeholder}
        value={text}
        maxLength={5000}
        onChange={(event) => setText(event.target.value)}
        onPaste={(event) => {
          const [pasted] = pastedImages(event);
          if (!pasted) return;
          if (!imageTypes.includes(pasted.type) || pasted.size > maxImageBytes)
            notify(imageRuleMessage);
          else setFile(pasted);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel?.();
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <button
        type="button"
        className="icon-button"
        aria-label="Add a photo or GIF"
        title="Add a photo or GIF"
        onClick={() => picker.current?.click()}
      >
        <ImagePlus size={18} />
      </button>
      <button
        type="submit"
        className="icon-button"
        aria-label={pending ? "Sending comment" : "Send comment"}
        disabled={!canSend}
      >
        {pending ? (
          <LoaderCircle size={18} className="auth-spinner" />
        ) : (
          <Send size={18} />
        )}
      </button>
    </form>
  );
}
