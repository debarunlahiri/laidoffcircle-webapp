"use client";
import PostComposerFields from "@/components/feed/post-composer-fields";
import { userInitials } from "@/providers/auth-provider";
import Dialog from "@/components/ui/dialog";
import Avatar from "@/components/ui/avatar";
import { usePlatform } from "@/providers/platform-provider";
import { useImageDrop } from "@/hooks/use-image-drop";
import { requireSignIn } from "@/lib/api";
import { ArrowRight, Earth, ImagePlus, X } from "lucide-react";
import { createPortal } from "react-dom";

export default function PostComposerDialog() {
  const {
    currentUser,
    composer,
    setComposer,
    quoting,
    anonymous,
    publish,
    postSaving,
    addPostImages,
    canPublish,
    notify,
  } = usePlatform();
  const { dragging, dropProps } = useImageDrop({
    onImages: addPostImages,
    onError: notify,
    canDrop: () => {
      if (currentUser) return true;
      requireSignIn();
      return false;
    },
  });

  if (!composer) return null;

  return createPortal(
    <Dialog
      label="Create a public post"
      onClose={() => setComposer(false)}
      backdropClassName="composer-sheet-backdrop"
      className={`post-composer-dialog${dragging ? " drop-active" : ""}`}
      sectionProps={dropProps}
    >
      {dragging && (
        <div className="drop-overlay" aria-hidden="true">
          <ImagePlus size={26} />
          Drop photos to attach them
        </div>
      )}
      <div className="modal-heading">
        <h2>{quoting ? "Quote this post" : "New post"}</h2>
        <button
          className="icon-button"
          aria-label="Close composer"
          onClick={() => setComposer(false)}
        >
          <X size={21} />
        </button>
      </div>
      <div className="composer-sheet-body">
        <div className="composer-identity">
          <Avatar
            initials={
              anonymous ? "AM" : userInitials(currentUser?.name ?? "Member")
            }
            src={anonymous ? null : currentUser?.profileImageUrl}
          />
          <span>
            <strong>
              {anonymous
                ? "Anonymous member"
                : (currentUser?.name ?? "Community member")}
            </strong>
            <small>
              <Earth size={12} />
              Public · Visible across all companies
            </small>
          </span>
        </div>
        <PostComposerFields />
      </div>
      <div className="modal-bottom">
        <span>No company or topic required. Everyone’s welcome.</span>
        <button
          className="primary"
          disabled={!canPublish || postSaving}
          onClick={publish}
        >
          {quoting ? "Post quote" : "Publish post"} <ArrowRight size={16} />
        </button>
      </div>
    </Dialog>,
    document.body,
  );
}
