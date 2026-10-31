import type { components } from "../generated/schema";

export type PaperUploadEvent =
  | { event: "started"; data: {} }
  /** Waiting for a free processing slot in the workspace */
  | { event: "queued"; data: {} }
  /** Picked up from the queue, processing began */
  | { event: "processing"; data: {} }
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

/**
 * Free-form metadata attached to a paper. Values can be strings, numbers,
 * booleans, arrays of a single type, or objects nested up to 3 levels.
 */
export type PaperMetadata = components["schemas"]["PaperMetadata"];

export type MetadataFilterValue =
  | string
  | number
  | boolean
  /** Matches any of the values */
  | (string | number | boolean)[]
  /** Numeric range */
  | { gt?: number; gte?: number; lt?: number; lte?: number };

/**
 * Filter by metadata, e.g.
 * `{ category: ["invoice", "receipt"], amount: { gte: 100 } }`.
 */
export type MetadataFilter = Record<string, MetadataFilterValue>;
