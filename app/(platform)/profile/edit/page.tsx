"use client";

import ProfileEditDialog from "@/components/profile/profile-edit-dialog";
import { appStackDepth } from "@/components/layout/navigation-history";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();
  return (
    <ProfileEditDialog
      presentation="page"
      onClose={() => {
        if (appStackDepth() > 0) router.back();
        else router.replace("/profile");
      }}
    />
  );
}
