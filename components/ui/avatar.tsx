"use client";
import { mediaUrl } from "@/lib/api";
import { useState } from "react";

export default function Avatar({
  initials,
  color = "mint",
  small = false,
  src,
}: {
  initials: string;
  color?: string;
  small?: boolean;
  src?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  // Uploaded photos are stored as /uploads/<file>; serve them through the media route.
  const url = src?.startsWith("/uploads/") ? mediaUrl(src) : src;
  return (
    <span className={`avatar ${color} ${small ? "small" : ""}`}>
      {url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}
