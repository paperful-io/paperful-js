import type { Paperful } from "../client";
import type { operations } from "../generated/schema";
import type { Bbox, Cursor } from "../types/general";
import type {
  NodeTextRef,
  PaperGraphParams,
  PaperNodeSchema,
} from "../types/graph";
import type { PaperNodeRenderParams } from "../types/paper";

type ContextResponse =
  operations["getPaperGraphNodeContext"]["responses"]["200"]["content"]["application/json"];

export class PaperNode<N extends PaperNodeSchema = PaperNodeSchema> {
  readonly id: string;
  readonly type: N["type"];
  readonly bbox: Bbox;
  readonly position: number;
  readonly page: number;
  readonly created: string;

  /**
   * Type specific data, e.g. the cells and insights of a table. `null` for
   * text nodes and for nodes that were not enriched.
   */
  readonly data: N["data"];

  /**
   * The plain text content of the node.
   */
  readonly text: string;

  /**
   * The text entries that make up the node.
   */
  readonly refs: NodeTextRef[];

  readonly graph: PaperGraph;

  constructor({ node, graph }: { node: N; graph: PaperGraph }) {
    this.id = node.id;
    this.type = node.type;
    this.bbox = node.bbox;
    this.position = node.position;
    this.page = node.page;
    this.created = node.created;
    this.data = node.data;
    this.text = node.text;
    this.refs = node.meta.refs;
    this.graph = graph;
  }

  /**
   * Narrows the node to the given type(s).
   *
   * @example
   * if (node.is("table")) node.data?.cells;
   */
  is<T extends PaperNodeSchema["type"]>(
    ...types: T[]
  ): this is AnyPaperNode<Extract<PaperNodeSchema, { type: T }>> {
    return (types as string[]).includes(this.type);
  }

  /**
   * Returns the node that immediately follows this one, fetching the next
   * page of the graph if it hasn't been loaded yet.
   */
  async next(): Promise<AnyPaperNode | undefined> {
    const index = this.graph.nodes.findIndex((node) => node.id === this.id);
    if (index === -1) return undefined;

    if (index + 1 < this.graph.nodes.length) {
      return this.graph.nodes[index + 1];
    }

    if (this.graph.partial) return await this.graph.adjacent(this, "next");

    const fetched = await this.graph.next();
    return fetched[0];
  }

  /**
   * Returns the node that immediately precedes this one, fetching the
   * previous page of the graph if it hasn't been loaded yet.
   */
  async previous(): Promise<AnyPaperNode | undefined> {
    const index = this.graph.nodes.findIndex((node) => node.id === this.id);
    if (index === -1) return undefined;

    if (index - 1 >= 0) {
      return this.graph.nodes[index - 1];
    }

    if (this.graph.partial)
      return await this.graph.adjacent(this, "previous");

    const fetched = await this.graph.previous();
    return fetched[fetched.length - 1];
  }

  /**
   * Retrieves the context surrounding this node.
   */
  async context(
    params: { before?: number; after?: number } = {},
  ): Promise<AnyPaperNode[]> {
    return await getNodeContext({
      client: this.graph.client,
      paperId: this.graph.paperId,
      nodeId: this.id,
      ...params,
    });
  }

  /**
   * Renders the region of this node as an image.
   *
   * @example
   * const image = await node.render();
   * const png = await node.render({ size: 600, format: "png" });
   */
  async render({ size = 900, format }: PaperNodeRenderParams = {}) {
    return await this.graph.client.papers.render(this.graph.paperId, {
      node: this.id,
      size,
      format,
    });
  }
}

/**
 * Fetches the nodes around a node, or around a range of nodes with `untilId`.
 * They belong to a partial graph, which fetches their neighbours on demand.
 */
export const getNodeContext = async ({
  client,
  paperId,
  nodeId,
  untilId,
  before,
  after,
}: {
  client: Paperful;
  paperId: string;
  nodeId: string;
  untilId?: string;
  before?: number;
  after?: number;
}): Promise<AnyPaperNode[]> => {
  const nodes = await client.request<ContextResponse>({
    path: `/papers/${paperId}/nodes/${nodeId}/context`,
    query: { before, after, until: untilId },
    init: {
      method: "GET",
    },
  });

  const graph = new PaperGraph({
    nodes,
    total: nodes.length,
    cursor: {},
    paperId,
    client,
    partial: true,
  });

  return graph.nodes;
};

/**
 * A union of `PaperNode`s, one per node type, so checking `node.type` narrows
 * `node.data`.
 */
export type AnyPaperNode<N extends PaperNodeSchema = PaperNodeSchema> =
  N extends PaperNodeSchema ? PaperNode<N> : never;

const toPaperNode = (node: PaperNodeSchema, graph: PaperGraph) =>
  new PaperNode({ node, graph }) as AnyPaperNode;

export class PaperGraph {
  nodes: AnyPaperNode[] = [];
  cursor: Cursor = {};
  total = 0;

  readonly paperId: string;
  readonly client: Paperful;

  /**
   * The filters the graph was retrieved with, kept when paginating.
   */
  readonly params: PaperGraphParams;

  /**
   * Only part of the paper is loaded, e.g. the context of a node, and
   * `total` is the number of loaded nodes. Neighbours are fetched one by one.
   */
  readonly partial: boolean;

  constructor({
    nodes,
    total,
    cursor,
    paperId,
    client,
    params = {},
    partial = false,
  }: {
    nodes: PaperNodeSchema[];
    total: number;
    cursor: Cursor;
    paperId: string;
    client: Paperful;
    params?: PaperGraphParams;
    partial?: boolean;
  }) {
    this.nodes = nodes.map((node) => toPaperNode(node, this));
    this.total = total;
    this.cursor = cursor;
    this.paperId = paperId;
    this.client = client;
    this.params = params;
    this.partial = partial;
  }

  /**
   * Fetches the node next to one at the edge of a partial graph.
   *
   * @internal
   */
  async adjacent(
    node: PaperNode,
    direction: "next" | "previous",
  ): Promise<AnyPaperNode | undefined> {
    const next = direction === "next";

    const nodes = await this.client.request<ContextResponse>({
      path: `/papers/${this.paperId}/nodes/${node.id}/context`,
      query: next ? { before: 0, after: 1 } : { before: 1, after: 0 },
      init: {
        method: "GET",
      },
    });

    const found = nodes.find((item) =>
      next ? item.position > node.position : item.position < node.position,
    );

    // the end of the paper
    if (!found) return undefined;

    const adjacent = toPaperNode(found, this);

    if (next) this.nodes.push(adjacent);
    else this.nodes.unshift(adjacent);

    this.total = this.nodes.length;

    return adjacent;
  }

  /**
   * Retrieves a single node of this paper by its ID.
   */
  async node(nodeId: string): Promise<AnyPaperNode> {
    const node = await this.client.request<
      operations["getPaperGraphNode"]["responses"]["200"]["content"]["application/json"]
    >({
      path: `/papers/${this.paperId}/nodes/${nodeId}`,
      init: {
        method: "GET",
      },
    });

    return toPaperNode(node, this);
  }

  /**
   * Fetches and appends the next page of nodes, if any, updating the cursor.
   */
  async next(): Promise<AnyPaperNode[]> {
    if (!this.cursor?.next) return [];

    const { total, items, cursor } = await this.client.request<
      operations["listPaperGraphNodes"]["responses"]["200"]["content"]["application/json"]
    >({
      path: `/papers/${this.paperId}/nodes`,
      query: { ...this.params, next: this.cursor.next },
      init: {
        method: "GET",
      },
    });

    const fetched = items.map((node) => toPaperNode(node, this));
    this.nodes.push(...fetched);
    this.total = total;
    this.cursor = { ...this.cursor, next: cursor?.next };

    return fetched;
  }

  /**
   * Fetches and prepends the previous page of nodes, if any, updating the cursor.
   */
  async previous(): Promise<AnyPaperNode[]> {
    if (!this.cursor?.prev) return [];

    const { total, items, cursor } = await this.client.request<
      operations["listPaperGraphNodes"]["responses"]["200"]["content"]["application/json"]
    >({
      path: `/papers/${this.paperId}/nodes`,
      query: { ...this.params, prev: this.cursor.prev },
      init: {
        method: "GET",
      },
    });

    const fetched = items.map((node) => toPaperNode(node, this));
    this.nodes.unshift(...fetched);
    this.total = total;
    this.cursor = { ...this.cursor, prev: cursor?.prev };

    return fetched;
  }
}
