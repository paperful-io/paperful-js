import type { Paperful } from "../client";
import type { components, operations } from "../generated/schema";
import type { Bbox, Cursor } from "../types/general";

export class PaperNode<T = unknown> {
  readonly id: string;
  readonly type: components["schemas"]["PaperNode"]["type"];
  readonly bbox: Bbox;
  readonly position: number;
  readonly page: number;

  readonly data: T;

  readonly graph: PaperGraph;

  constructor({
    node,
    graph,
  }: {
    node: components["schemas"]["PaperNode"];
    graph: PaperGraph;
  }) {
    this.id = node.id;
    this.type = node.type;
    this.bbox = node.bbox;
    this.position = node.position;
    this.page = node.page;
    this.data = node.data as T;
    this.graph = graph;
  }

  /**
   * Returns the node that immediately follows this one, fetching the next
   * page of the graph if it hasn't been loaded yet.
   */
  async next(): Promise<PaperNode | undefined> {
    const index = this.graph.nodes.findIndex((node) => node.id === this.id);
    if (index === -1) return undefined;

    if (index + 1 < this.graph.nodes.length) {
      return this.graph.nodes[index + 1];
    }

    const fetched = await this.graph.next();
    return fetched[0];
  }

  /**
   * Returns the node that immediately precedes this one, fetching the
   * previous page of the graph if it hasn't been loaded yet.
   */
  async previous(): Promise<PaperNode | undefined> {
    const index = this.graph.nodes.findIndex((node) => node.id === this.id);
    if (index === -1) return undefined;

    if (index - 1 >= 0) {
      return this.graph.nodes[index - 1];
    }

    const fetched = await this.graph.previous();
    return fetched[fetched.length - 1];
  }

  /**
   * Retrieves the context surrounding this node.
   */
  async context({
    before,
    after,
  }: { before?: number; after?: number } = {}): Promise<PaperNode> {
    const node = await this.graph.client.request<
      operations["getPaperGraphNodeContext"]["responses"]["200"]["content"]["application/json"]
    >({
      path: `/papers/${this.graph.paperId}/nodes/${this.id}/context`,
      query: { before, after },
      init: {
        method: "GET",
      },
    });

    return new PaperNode({ node, graph: this.graph });
  }
}

export class PaperGraph {
  nodes: PaperNode[] = [];
  cursor: Cursor = {};
  total = 0;

  readonly paperId: string;
  readonly client: Paperful;

  constructor({
    nodes,
    total,
    cursor,
    paperId,
    client,
  }: {
    nodes: components["schemas"]["PaperNode"][];
    total: number;
    cursor: Cursor;
    paperId: string;
    client: Paperful;
  }) {
    this.nodes = nodes.map((node) => new PaperNode({ node, graph: this }));
    this.total = total;
    this.cursor = cursor;
    this.paperId = paperId;
    this.client = client;
  }

  /**
   * Fetches and appends the next page of nodes, if any, updating the cursor.
   */
  async next(): Promise<PaperNode[]> {
    if (!this.cursor?.next) return [];

    const { total, items, cursor } = await this.client.request<
      operations["listPaperGraphNodes"]["responses"]["200"]["content"]["application/json"]
    >({
      path: `/papers/${this.paperId}/nodes`,
      query: { next: this.cursor.next },
      init: {
        method: "GET",
      },
    });

    const fetched = items.map((node) => new PaperNode({ node, graph: this }));
    this.nodes.push(...fetched);
    this.total = total;
    this.cursor = { ...this.cursor, next: cursor?.next };

    return fetched;
  }

  /**
   * Fetches and prepends the previous page of nodes, if any, updating the cursor.
   */
  async previous(): Promise<PaperNode[]> {
    if (!this.cursor?.prev) return [];

    const { total, items, cursor } = await this.client.request<
      operations["listPaperGraphNodes"]["responses"]["200"]["content"]["application/json"]
    >({
      path: `/papers/${this.paperId}/nodes`,
      query: { prev: this.cursor.prev },
      init: {
        method: "GET",
      },
    });

    const fetched = items.map((node) => new PaperNode({ node, graph: this }));
    this.nodes.unshift(...fetched);
    this.total = total;
    this.cursor = { ...this.cursor, prev: cursor?.prev };

    return fetched;
  }
}
