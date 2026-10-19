/**
 * Serializes a query object into a URL query string, supporting nested
 * objects with bracket notation (`metadata[amount][gte]=100`) and arrays as
 * comma separated values (`extension=pdf,md`). `undefined` and `null` values
 * are skipped.
 */
export const serializeQuery = (query: Record<string, unknown>): string => {
  const params = new URLSearchParams();

  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      if (value.length) params.append(key, value.map(String).join(","));
      return;
    }

    if (typeof value === "object") {
      for (const [child, childValue] of Object.entries(value))
        append(`${key}[${child}]`, childValue);
      return;
    }

    params.append(key, String(value));
  };

  for (const [key, value] of Object.entries(query)) append(key, value);

  return params.toString();
};
