import type { components } from "../generated/schema";

export type Cursor =
  | {
      next?: string | undefined;
      prev?: string | undefined;
    }
  | undefined;

export type Bbox = components["schemas"]["Bbox"];
