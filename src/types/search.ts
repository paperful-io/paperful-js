import type { operations } from "../generated/schema";

export type SearchResult =
  operations["search"]["responses"]["200"]["content"]["application/json"];

export type SearchResultItem = SearchResult["items"][number];

export type SearchEvent =
  | { event: "started"; data: {} }
  /** The query was expanded with synonyms */
  | { event: "expanded"; data: {} }
  /** The results before reranking */
  | { event: "results"; data: SearchResult }
  /** The results are being reranked */
  | { event: "reranking"; data: { count: number } }
  | { event: "completed"; data: SearchResult };
