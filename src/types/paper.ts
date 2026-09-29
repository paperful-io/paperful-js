import type { components } from "../generated/schema";

export type PaperUploadEvent =
  | { event: "started"; data: {} }
  | {
      event: "completed";
      data: components["schemas"]["Paper"];
    }
  | {
      event: "progress";
      data: {
        processed: number;
        total: number;
      };
    };
