import type { Paperful } from "../client";
import type { PaperGraphParams } from "../types/graph";
import type { SearchResultItem } from "../types/search";
import { getNodeContext, type AnyPaperNode } from "./graph";

/**
 * A search result, a piece of a paper's content spanning one or more nodes.
 */
export class SearchItem implements SearchResultItem {
  readonly content: string;
  readonly score?: number;
  readonly distance?: number;
  readonly relevance?: number;
  readonly matches: SearchResultItem["matches"];

  /**
   * The nodes the content spans.
   */
  readonly nodes: SearchResultItem["nodes"];
  readonly paper: SearchResultItem["paper"];

  constructor(
    item: SearchResultItem,
    private readonly client: Paperful,
  ) {
    this.content = item.content;
    this.score = item.score;
    this.distance = item.distance;
    this.relevance = item.relevance;
    this.matches = item.matches;
    this.nodes = item.nodes;
    this.paper = item.paper;
  }

  /**
   * Retrieves the nodes of the result together with the ones around it, in a
   * single request.
   *
   * @example
   * const context = await item.context({ before: 3, after: 3 });
   * const text = context.map((node) => node.text).join("\n");
   */
  async context(
    params: { before?: number; after?: number } = {},
  ): Promise<AnyPaperNode[]> {
    const first = this.nodes[0];
    const last = this.nodes[this.nodes.length - 1];

    if (!first || !last) return [];

    return await getNodeContext({
      client: this.client,
      paperId: this.paper.id,
      nodeId: first.id,
      untilId: last.id === first.id ? undefined : last.id,
      ...params,
    });
  }

  /**
   * Retrieves the graph of the paper the result belongs to.
   */
  async graph(params: PaperGraphParams = {}) {
    return await this.client.papers.graph(this.paper.id, params);
  }
}
