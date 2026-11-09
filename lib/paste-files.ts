import type { ClipboardEvent } from "react";

// Image files on the clipboard (a screenshot, or "Copy image" from a page).
// Stops the default paste when any are found so no stray text is inserted.
export function pastedImages(event: ClipboardEvent<HTMLElement>): File[] {
  const files = Array.from(event.clipboardData?.files ?? []).filter((file) =>
    file.type.startsWith("image/"),
  );
  if (files.length) event.preventDefault();
  return files;
}
