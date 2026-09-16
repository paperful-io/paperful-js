import type { Paperful } from "../client";
import type { operations } from "../generated/schema";

export class Search {
  constructor(private readonly client: Paperful) {}

  /**
   * Performs a search query across papers in the current workspace.
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
    } = {},
  ) {
    return await this.client.request<
      operations["search"]["responses"]["200"]["content"]["application/json"]
    >({
      path: "/search",
      query: { query, ...(params.mode ? { mode: params.mode } : {}) },
      init: {
        method: "GET",
      },
    });
  }
}
