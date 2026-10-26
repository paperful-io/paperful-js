import type { Paperful } from "../client";
import type { MetadataFilter } from "../types/paper";
import type { SearchEvent, SearchResult } from "../types/search";
import { hydrateError, type DehydratedError } from "../utils/error";

export class Search {
  constructor(private readonly client: Paperful) {}

  /**
   * Performs a search query across papers in the current workspace.
   *
   * Results are paginated, use the returned `cursor` to get the next or
   * previous page.
   *
   * @example
   * const { items, cursor } = await paperful.search.query("total amount", {
   *   metadata: { category: "invoice", amount: { gte: 100 } },
   * });
   *
   * const next = await paperful.search.query("total amount", {
   *   next: cursor?.next,
   * });
   *
   * @example
   * // show the results before they are reranked
   * await paperful.search.query("total amount", {
   *   onEvent: ({ event, data }) => {
   *     if (event === "results") render(data.items);
   *   },
   * });
   */
  async query(
    query: string,
    params: {
      /**
       * The search mode to use.
       *
       * @default "hybrid"
       */
      mode?: "fulltext" | "hybrid" | "semantic";
      /**
       * Expand the query with synonyms before searching. Not used in
       * `fulltext` mode.
       *
       * @default true
       */
      expand?: boolean;
      /**
       * Rerank the results of each page by relevance to the query. Not used in
       * `fulltext` mode.
       *
       * @default true
       */
      rerank?: boolean;
      /**
       * Only search papers matching this metadata. Arrays match any of the
       * values and objects with `gt`, `gte`, `lt`, `lte` match numeric ranges.
       */
      metadata?: MetadataFilter;
      /**
       * Cursor of the next page, from a previous result's `cursor.next`.
       */
      next?: string;
      /**
       * Cursor of the previous page, from a previous result's `cursor.prev`.
       */
      prev?: string;
      /**
       * Receives the search steps as they happen. When set, the search is
       * streamed.
       */
      onEvent?: (event: SearchEvent) => void;
    } = {},
  ): Promise<SearchResult> {
    const { onEvent, ...rest } = params;

    const request = {
      path: "/search",
      query: { query, ...rest },
      init: {
        method: "GET",
      },
    };

    if (!onEvent) return await this.client.request<SearchResult>(request);

    const stream = this.client.stream<
      SearchEvent | { event: "failed"; data: { error: DehydratedError } }
    >(request);

    for await (const { event, data } of stream) {
      if (event === "failed") throw hydrateError(data.error);

      onEvent({ event, data } as SearchEvent);

      if (event === "completed") return data;
    }

    throw new Error("Paperful API error: search stream ended unexpectedly");
  }
}
