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
