import type { Paperful } from "../client";
import type { operations } from "../generated/schema";
import type { MetadataFilter } from "../types/paper";

export class Search {
  constructor(private readonly client: Paperful) {}

  /**
   * Performs a search query across papers in the current workspace.
   *
   * @example
   * const results = await paperful.search.query("total amount", {
   *   metadata: { category: "invoice", amount: { gte: 100 } },
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
       * Only search papers matching this metadata. Arrays match any of the
       * values and objects with `gt`, `gte`, `lt`, `lte` match numeric ranges.
       */
      metadata?: MetadataFilter;
    } = {},
  ) {
    return await this.client.request<
      operations["search"]["responses"]["200"]["content"]["application/json"]
    >({
      path: "/search",
      query: { query, mode: params.mode, metadata: params.metadata },
      init: {
        method: "GET",
      },
    });
  }
}
