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

export type PaperRenderFormat = "webp" | "jpeg" | "png";

/**
 * Render a page, a region of it with `extract`, or the region of a `node`.
 */
export type PaperRenderParams = {
  /**
   * A single dimension, e.g. `900`, or `[width, height]`. Use `-1` to keep
   * the original size on that axis.
   */
  size: number | [number, number];
  /**
   * @default "webp"
   */
  format?: PaperRenderFormat;
} & (
  | {
      /**
       * The page to render, defaults to the first page.
       */
      page?: number;
      /**
       * Region of the page to crop, relative to its size (0 to 1).
       */
      extract?: { x: number; y: number; w: number; h: number };
      node?: never;
    }
  | {
      /**
       * Renders the region of a node, its page and crop come from the node.
       */
      node: string;
      page?: never;
      extract?: never;
    }
);
