import type { components } from "../generated/schema";
import type { Bbox, Cursor } from "../types/general";
import { NotImplemented } from "../utils/error";

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

  next() {
    throw new NotImplemented();
  }

  previous() {
    throw new NotImplemented();
  }

  context({ before, after }: { before?: number; after?: number }) {
    throw new NotImplemented();
  }
}

export class PaperGraph {
  nodes: PaperNode[] = [];
  cursor: Cursor = {};
  total = 0;

  constructor({
    nodes,
    total,
    cursor,
  }: {
    nodes: components["schemas"]["PaperNode"][];
    total: number;
    cursor: Cursor;
  }) {
    this.nodes = nodes.map((node) => new PaperNode({ node, graph: this }));
    this.total = total;
    this.cursor = cursor;
  }
}
