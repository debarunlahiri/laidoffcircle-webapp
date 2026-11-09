"use client";
import ProfileCard, {
  type ProfileEditField,
} from "@/components/profile/profile-card";
import ProfileEditDialog from "@/components/profile/profile-edit-dialog";
import { useProfileImageControls } from "@/components/profile/profile-image-controls";
import ProfileTabs from "@/components/profile/profile-tabs";
import { useApiResource } from "@/hooks/use-api-resource";
import type { ApiProfileStats } from "@/lib/api-types";
import { useAuth } from "@/providers/auth-provider";
import { Pencil, Share2 } from "lucide-react";
import { usePlatform } from "@/providers/platform-provider";
import { useState } from "react";

export default function ProfileView() {
  const { user } = useAuth();
  const [editing, setEditing] = useState<ProfileEditField | null>(null);
  const { notify } = usePlatform();
  const imageControls = useProfileImageControls();
  const stats = useApiResource<ApiProfileStats | null>(
    user ? `/users/${user.id}/stats` : null,
    null,
  );
  async function shareProfile() {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/users/${encodeURIComponent(user.id)}`,
      );
      notify("Profile link copied.");
    } catch {
      notify("Couldn’t copy your profile link. Please try again.");
    }
  }
  if (!user) return null;
  return (
    <>
      <ProfileCard
        profile={user}
        onEdit={setEditing}
        coverControls={imageControls.coverControls}
        avatarControls={imageControls.avatarControls}
        actions={
          <>
            <button
              type="button"
              className="secondary pf-share"
              onClick={() => void shareProfile()}
            >
              <Share2 size={16} /> Share profile
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => setEditing("name")}
            >
              <Pencil size={15} /> Edit profile
            </button>
          </>
        }
      >
        {imageControls.dialog}
        {editing && (
          <ProfileEditDialog
            initialField={editing}
            onClose={() => setEditing(null)}
          />
        )}
      </ProfileCard>
      <ProfileTabs id={user.id} stats={stats.data} own />
    </>
  );
}
