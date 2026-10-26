import type { Paperful } from "../client";
import type { operations } from "../generated/schema";
import { PaperGraph } from "../models/graph";
import type { PaperGraphParams } from "../types/graph";
import type {
  MetadataFilter,
  PaperMetadata,
  PaperUploadEvent,
} from "../types/paper";
import {
  hydrateError,
  UnsupportedMediaType,
  type DehydratedError,
} from "../utils/error";
import {
  getFileName,
  getFileNameFromContentDisposition,
} from "../utils/papers";
import { Metadata } from "./metadata";

export class Papers {
  readonly metadata: Metadata;

  constructor(private readonly client: Paperful) {
    this.metadata = new Metadata(client);
  }

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
    /**
     * Metadata to attach to the paper, e.g. `{ category: "invoice" }`.
     */
    metadata?: PaperMetadata;
    onEvent?: (event: PaperUploadEvent) => void;
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

    const query = params.metadata
      ? { metadata: JSON.stringify(params.metadata) }
      : undefined;

    if (params.waitForProcessing === false) {
      return await this.client.request<
        operations["uploadPaper"]["responses"]["201"]["content"]["application/json"]
      >({
        path: "/papers",
        query,
        init,
      });
    } else {
      const stream = this.client.stream<
        | PaperUploadEvent
        | { event: "ping"; data: {} }
        | { event: "failed"; data: { error: DehydratedError } }
      >({
        path: "/papers",
        query,
        init,
      });
      for await (const { event, data } of stream) {
        // ignore ping events
        if (event === "ping") continue;

        if (event === "failed") throw hydrateError(data.error);

        params.onEvent?.({ event, data } as PaperUploadEvent);

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
   * Lists papers in the current workspace.
   *
   * @example
   * const { items, cursor } = await paperful.papers.list({
   *   extension: ["pdf", "md"],
   *   sort: "size",
   *   order: "asc",
   *   metadata: { category: "invoice", amount: { gte: 100 } },
   * });
   */
  async list(
    params: Omit<
      NonNullable<operations["listPapers"]["parameters"]["query"]>,
      "extension" | "metadata"
    > & {
      /**
       * Filter by file extension, e.g. `["pdf", "md"]` or `"pdf,md"`.
       */
      extension?: string | string[];
      /**
       * Filter by metadata. Arrays match any of the values and objects with
       * `gt`, `gte`, `lt`, `lte` match numeric ranges.
       */
      metadata?: MetadataFilter;
    } = {},
  ) {
    return await this.client.request<
      operations["listPapers"]["responses"]["200"]["content"]["application/json"]
    >({
      path: "/papers",
      query: params,
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
   * Updates a paper. Metadata keys are merged into the existing metadata,
   * set a key to `null` to remove it.
   *
   * To replace all the metadata, use `papers.metadata.replace`.
   *
   * @example
   * await paperful.papers.update(id, {
   *   metadata: { category: "receipt", draft: null },
   * });
   */
  async update(
    id: string,
    params: operations["updatePaper"]["requestBody"]["content"]["application/json"],
  ) {
    return await this.client.request<
      operations["updatePaper"]["responses"]["200"]["content"]["application/json"]
    >({
      path: `/papers/${id}`,
      init: {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      },
    });
  }

  /**
   * Downloads a paper's original file.
   *
   * @example
   * const file = await paperful.papers.download(id);
   * await Bun.write(file.name, file);
   */
  async download(id: string): Promise<File> {
    const response = await this.client.raw({
      path: `/papers/${id}/download`,
      init: {
        method: "GET",
      },
    });

    return new File(
      [await response.arrayBuffer()],
      getFileNameFromContentDisposition(
        response.headers.get("content-disposition"),
      ) ?? id,
      { type: response.headers.get("content-type") ?? undefined },
    );
  }

  /**
   * Retrieves the paper graph object
   */
  async graph(id: string, params: PaperGraphParams = {}) {
    const { total, items, cursor } = await this.client.request<
      operations["listPaperGraphNodes"]["responses"]["200"]["content"]["application/json"]
    >({
      path: `/papers/${id}/nodes`,
      query: params,
      init: {
        method: "GET",
      },
    });

    return new PaperGraph({
      nodes: items,
      total,
      cursor,
      paperId: id,
      client: this.client,
      params,
    });
  }
}
