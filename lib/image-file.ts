export const imageTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];
export const maxPostImages = 6;
export const maxImageBytes = 5 * 1024 * 1024;
export const imageRuleMessage = "Choose a PNG, JPEG, WebP, or GIF under 5 MB.";

// Validates an image file and reads it as a data URL. Shared by the file
// picker and drag-and-drop so both enforce the same rules.
export function readImageFile(
  file: File,
  limits: { maxBytes?: number; message?: string } = {},
): Promise<string> {
  const maxBytes = limits.maxBytes ?? maxImageBytes;
  if (!imageTypes.includes(file.type) || file.size > maxBytes)
    return Promise.reject(new Error(limits.message ?? imageRuleMessage));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error("Could not read this photo. Try another image."));
    reader.readAsDataURL(file);
  });
}
