export const getFileName = (file: unknown): string | undefined => {
  if (
    typeof file === "object" &&
    file !== null &&
    "name" in file &&
    typeof file.name === "string"
  ) {
    // sometimes the name can be a full path, so get the actual file name
    if (file.name.includes("/")) {
      const parts = file.name.split("/");
      return parts[parts.length - 1] as string;
    }

    return file.name;
  }

  return undefined;
};

/**
 * Extracts the file name from a `Content-Disposition` header.
 */
export const getFileNameFromContentDisposition = (
  header: string | null,
): string | undefined => {
  if (!header) return undefined;

  const encoded = header.match(/filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ""));
    } catch {
      // fall back to the plain filename
    }
  }

  const plain = header.match(/filename\s*=\s*("([^"]*)"|[^;]+)/i);
  return (plain?.[2] ?? plain?.[1])?.trim() || undefined;
};
