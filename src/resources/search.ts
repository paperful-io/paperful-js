import type { Paperful } from "../client";
import { SearchItem } from "../models/search";
import type { MetadataFilter } from "../types/paper";
import type {
  SearchEvent,
  SearchResult,
  SearchResults,
} from "../types/search";
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
   * // the result and the nodes around it, in a single request
   * const { items } = await paperful.search.query("revenue in europe");
   * const context = await items[0]?.context({ before: 3, after: 3 });
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
  ): Promise<SearchResults> {
    const { onEvent, ...rest } = params;

    const request = {
      path: "/search",
      query: { query, ...rest },
      init: {
        method: "GET",
      },
    };

    if (!onEvent)
      return this.toResults(
        await this.client.request<SearchResult>(request),
      );

    const stream = this.client.stream<
      | { event: "started" | "expanded"; data: {} }
      | { event: "reranking"; data: { count: number } }
      | { event: "results" | "completed"; data: SearchResult }
      | { event: "failed"; data: { error: DehydratedError } }
    >(request);

    for await (const { event, data } of stream) {
      if (event === "failed") throw hydrateError(data.error);

      if (event === "results" || event === "completed") {
        const results = this.toResults(data);

        onEvent({ event, data: results });

        if (event === "completed") return results;
        continue;
      }

      onEvent({ event, data } as SearchEvent);
    }

    throw new Error("Paperful API error: search stream ended unexpectedly");
  }

  private toResults(result: SearchResult): SearchResults {
    return {
      ...result,
      items: result.items.map((item) => new SearchItem(item, this.client)),
    };
  }
}
