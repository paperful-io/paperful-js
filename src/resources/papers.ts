import type { Paperful } from "../client";

export class Papers {
  constructor(private readonly client: Paperful) {}

  /**
   * Uploads a new paper to the current workspace.
   */
  async upload() {}

  /**
   * Retrieves a paper by its ID.
   */
  async get(id: string, { versionId }: { versionId?: string } = {}) {}

  /**
   * List papers
   */
  async list() {}

  /**
   * Deletes a paper by its ID.
   */
  async delete(id: string) {}

  /**
   * Downloads a paper
   */
  async download(id: string) {}
}
