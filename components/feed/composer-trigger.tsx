"use client";

import { userInitials } from "@/providers/auth-provider";
import {
  AddPhotosLabel,
  usePhotoPicker,
} from "@/components/feed/composer-photos";
import { maxPostImages } from "@/lib/image-file";
import Avatar from "@/components/ui/avatar";
import { usePlatform } from "@/providers/platform-provider";
import { useImageDrop } from "@/hooks/use-image-drop";
import { requireSignIn } from "@/lib/api";
import { BarChart3, Earth, ImagePlus } from "lucide-react";

export default function ComposerTrigger() {
  const {
    currentUser,
    setComposer,
    anonymous,
    postImages,
    addPostImages,
    notify,
    pollOpen,
    setPollOpen,
  } = usePlatform();

  const { dragging, dropProps } = useImageDrop({
    onImages: (dataUrls) => {
      addPostImages(dataUrls);
      setComposer(true);
    },
    onError: notify,
    canDrop: () => {
      if (currentUser) return true;
      requireSignIn();
      return false;
    },
  });

  const picker = usePhotoPicker({
    onAdd: addPostImages,
    onError: notify,
    onPicked: () => setComposer(true),
  });

  function expand() {
    if (!currentUser) {
      window.location.assign(
        `/login?next=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    setComposer(true);
  }

  return (
    <section
      className={`composer card${dragging ? " drop-active" : ""}`}
      aria-label="Create a post"
      {...dropProps}
    >
      {dragging && (
        <div className="drop-overlay" aria-hidden="true">
          <ImagePlus size={26} />
          Drop photos to attach them
        </div>
      )}
      <div>
        <Avatar
          initials={
            anonymous ? "AM" : userInitials(currentUser?.name ?? "Member")
          }
          src={anonymous ? null : currentUser?.profileImageUrl}
        />
        <button aria-haspopup="dialog" onClick={() => expand()}>
          What’s on your mind?
        </button>
        <span className="public-label">
          <Earth size={13} />
          Public
        </span>
      </div>
      {picker.input}
      <div className="composer-tools">
        <button
          disabled={postImages.length >= maxPostImages}
          onClick={() => {
            expand();
            if (currentUser) picker.open();
          }}
        >
          <AddPhotosLabel count={postImages.length} />
        </button>
        <button
          type="button"
          aria-pressed={pollOpen}
          onClick={() => {
            expand();
            if (currentUser) setPollOpen(!pollOpen);
          }}
        >
          <BarChart3 size={16} /> {pollOpen ? "Remove poll" : "Add poll"}
        </button>
      </div>
    </section>
  );
}
