export function sanitizeFileName(originalName: string): string {
  const lastDot = originalName.lastIndexOf(".");
  const hasExtension = lastDot !== -1 && lastDot < originalName.length - 1;

  const name = hasExtension ? originalName.slice(0, lastDot) : originalName;
  const extension = hasExtension ? originalName.slice(lastDot) : "";

  const sanitizedName = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${sanitizedName}${extension.toLowerCase()}`;
}
