import type { Paperful } from "../client";

export class Search {
  constructor(private readonly client: Paperful) {}

  /**
   * Performs a search query across papers in the current workspace.
   */
  async query() {}
}
