import type { Paperful } from "../client";
import type { components, operations } from "../generated/schema";
import { NotImplemented, UnsupportedMediaType } from "../utils/error";
import { getFileName } from "../utils/papers";

export class Papers {
  constructor(private readonly client: Paperful) {}

  /**
   * Uploads a new paper to the current workspace.
   */
  async upload(params: {
    file: File | Blob | Buffer | Uint8Array | ArrayBuffer;
    fileName?: string;
    /**
     * Wait until the paper finishes processing before resolving.
     *
     * @default true
     */
    waitForProcessing?: boolean;
  }) {
    const fileName = params.fileName ?? getFileName(params.file);

    if (!fileName)
      throw new UnsupportedMediaType(
        "A file name must be provided when it cannot be inferred from the file.",
      );

    const init: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
      body: params.file,
    };

    if (params.waitForProcessing === false) {
      return await this.client.request<
        operations["uploadPaper"]["responses"]["201"]["content"]["application/json"]
      >({
        path: "/papers",
        init,
      });
    } else {
      const stream = this.client.stream<
        | { event: "started"; data: {} }
        | {
            event: "completed";
            data: components["schemas"]["Paper"];
          }
      >({
        path: "/papers",
        init,
      });
      for await (const { event, data } of stream) {
        if (event === "completed") {
          return data;
        }
      }
    }
  }

  /**
   * Retrieves a paper by its ID.
   */
  async get(id: string) {
    return await this.client.request<
      operations["getPaper"]["responses"]["200"]["content"]["application/json"]
    >({
      path: `/papers/${id}`,
      init: {
        method: "GET",
      },
    });
  }

  /**
   * List papers
   */
  async list() {
    return await this.client.request<
      operations["listPapers"]["responses"]["200"]["content"]["application/json"]
    >({
      path: "/papers",
      init: {
        method: "GET",
      },
    });
  }

  /**
   * Deletes a paper by its ID.
   */
  async delete(id: string) {
    return await this.client.request<
      operations["deletePaper"]["responses"]["200"]["content"]["application/json"]
    >({
      path: `/papers/${id}`,
      init: {
        method: "DELETE",
      },
    });
  }

  /**
   * Downloads a paper
   */
  async download(id: string) {
    throw new NotImplemented();
  }
}
