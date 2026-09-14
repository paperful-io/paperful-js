import type { Paperful } from "../client";
import type { operations } from "../generated/schema";

export class Usage {
  constructor(private readonly client: Paperful) {}

  /**
   * Retrieves usage information for the current workspace.
   */
  async get() {
    return this.client.request<
      operations["getUsage"]["responses"]["200"]["content"]["application/json"]
    >({
      path: "/usage",
      init: {
        method: "GET",
      },
    });
  }
}
