import type { operations } from "../generated/schema";
import type { SearchItem } from "../models/search";

export type SearchResult =
  operations["search"]["responses"]["200"]["content"]["application/json"];

export type SearchResultItem = SearchResult["items"][number];

/**
 * The search results, with each item able to fetch its context.
 */
export type SearchResults = Omit<SearchResult, "items"> & {
  items: SearchItem[];
};

export type SearchEvent =
  | { event: "started"; data: {} }
  /** The query was expanded with synonyms */
  | { event: "expanded"; data: {} }
  /** The results before reranking */
  | { event: "results"; data: SearchResults }
  /** The results are being reranked */
  | { event: "reranking"; data: { count: number } }
  | { event: "completed"; data: SearchResults };
