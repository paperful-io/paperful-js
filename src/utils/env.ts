// @ts-nocheck

export const getEnvironmentVariable = (name: string): string | undefined => {
  // Node.js / Bun
  if (typeof globalThis.process !== "undefined" && globalThis.process?.env) {
    return globalThis.process.env[name];
  }

  if ("Deno" in globalThis && typeof globalThis.Deno !== "undefined") {
    try {
      return globalThis.Deno.env.get(name);
    } catch {
      // Deno may not have --allow-env permission
    }
  }

  return undefined;
};
