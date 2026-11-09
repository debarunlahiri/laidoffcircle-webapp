"use client";
import ImageCropperDialog from "@/components/ui/image-cropper-dialog";
import {
  imageSpecs,
  useProfileImages,
  type ImageKind,
} from "@/hooks/use-profile-images";
import { usePlatform } from "@/providers/platform-provider";
import { Camera, Trash2 } from "lucide-react";
import { useRef } from "react";

// Owner-only buttons to change or remove the profile photo and cover image,
// plus the crop dialog that opens after a file is chosen.
export function useProfileImageControls() {
  const { notify } = usePlatform();
  const images = useProfileImages(notify);
  const picker = useRef<HTMLInputElement>(null);
  const kind = useRef<ImageKind>("profile");

  function pick(next: ImageKind) {
    kind.current = next;
    picker.current?.click();
  }

  const input = (
    <input
      ref={picker}
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      hidden
      onChange={(event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (file) void images.choose(kind.current, file);
      }}
    />
  );
  const dialog = images.pending && (
    <ImageCropperDialog
      {...imageSpecs[images.pending.kind]}
      src={images.pending.src}
      saving={images.saving}
      onCancel={images.cancel}
      onConfirm={(blob) => void images.save(blob)}
    />
  );

  return {
    dialog: (
      <>
        {input}
        {dialog}
      </>
    ),
    coverControls: (
      <div className="cover-controls">
        <button className="secondary" onClick={() => pick("cover")}>
          <Camera size={15} /> Change cover
        </button>
        <button
          className="icon-button"
          aria-label="Remove cover image"
          onClick={() => void images.remove("cover")}
        >
          <Trash2 size={15} />
        </button>
      </div>
    ),
    avatarControls: (
      <button
        className="avatar-edit"
        aria-label="Change profile photo"
        title="Change profile photo"
        onClick={() => pick("profile")}
      >
        <Camera size={16} />
      </button>
    ),
  };
}
