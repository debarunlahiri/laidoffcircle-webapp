"use client";
import { useConfirm } from "@/providers/confirm-provider";
import { api, apiMessage } from "@/lib/api";
import { readImageFile } from "@/lib/image-file";

// Photos are cropped and shrunk in the browser before upload, so camera-sized
// originals are fine here (post images keep the 5 MB limit).
const originalLimit = {
  maxBytes: 30 * 1024 * 1024,
  message: "Choose a PNG, JPEG, WebP, or GIF under 30 MB.",
};
import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";

export type ImageKind = "profile" | "cover";
export const imageSpecs = {
  profile: {
    label: "Crop profile photo",
    aspect: 1,
    outputWidth: 512,
    round: true,
  },
  cover: {
    label: "Crop cover image",
    aspect: 3,
    outputWidth: 1500,
    round: false,
  },
} as const;

// Pick -> crop -> upload -> attach to the signed-in member's profile.
export function useProfileImages(notify: (message: string) => void) {
  const confirm = useConfirm();
  const { applyProfile } = useAuth();
  const [pending, setPending] = useState<{
    kind: ImageKind;
    src: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  async function choose(kind: ImageKind, file: File) {
    try {
      setPending({ kind, src: await readImageFile(file, originalLimit) });
    } catch (error) {
      notify(apiMessage(error));
    }
  }

  async function save(blob: Blob) {
    if (!pending) return;
    setSaving(true);
    try {
      const body = new FormData();
      body.append("photo", blob, `${pending.kind}.webp`);
      const { id } = await api<{ id: string }>("/uploads", {
        method: "POST",
        body,
      });
      const { url } = await api<{ url: string }>(`/me/images/${pending.kind}`, {
        method: "PUT",
        body: { uploadId: id },
      });
      applyProfile(
        pending.kind === "profile"
          ? { profileImageUrl: url }
          : { coverImageUrl: url },
      );
      notify(
        pending.kind === "profile"
          ? "Profile photo updated."
          : "Cover updated.",
      );
      setPending(null);
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function remove(kind: ImageKind) {
    if (
      !(await confirm({
        title:
          kind === "profile"
            ? "Remove your profile photo?"
            : "Remove your cover?",
        confirmLabel: "Remove",
        tone: "danger",
      }))
    )
      return;
    try {
      await api(`/me/images/${kind}`, { method: "DELETE" });
      applyProfile(
        kind === "profile"
          ? { profileImageUrl: null }
          : { coverImageUrl: null },
      );
      notify(kind === "profile" ? "Profile photo removed." : "Cover removed.");
    } catch (error) {
      notify(apiMessage(error));
    }
  }

  return {
    pending,
    saving,
    choose,
    save,
    remove,
    cancel: () => setPending(null),
  };
}
