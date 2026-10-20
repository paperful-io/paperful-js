import type { Paperful } from "../client";
import type { operations } from "../generated/schema";
import type { PaperMetadata } from "../types/paper";

export class Metadata {
  constructor(private readonly client: Paperful) {}

  /**
   * Replaces all the metadata of a paper.
   *
   * @example
   * await paperful.papers.metadata.replace(id, { category: "receipt" });
   */
  async replace(id: string, metadata: PaperMetadata) {
    return await this.client.request<
      operations["replacePaperMetadata"]["responses"]["200"]["content"]["application/json"]
    >({
      path: `/papers/${id}/metadata`,
      init: {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      },
    });
  }
}
