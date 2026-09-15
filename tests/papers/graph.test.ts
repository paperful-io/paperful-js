import { describe, expect, test } from "bun:test";
import { Paperful } from "../../src";
import { PaperGraph, PaperNode } from "../../src/models/graph";

describe("papers / graph", () => {
  const paperful = new Paperful();

  let uploaded: Awaited<ReturnType<typeof paperful.papers.upload>>;

  test("prepare", async () => {
    uploaded = await paperful.papers.upload({
      file: Bun.file("./tests/fixtures/text.pdf"),
    });
  }, 30000);

  test("valid", async () => {
    const graph = await paperful.papers.graph(uploaded!.id);

    expect(graph).toBeInstanceOf(PaperGraph);
    expect(graph.total).toBeGreaterThan(0);
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.nodes.length).toBeLessThanOrEqual(graph.total);
  });

  test("nodes are hydrated with graph and fields", async () => {
    const graph = await paperful.papers.graph(uploaded!.id);
    const node = graph.nodes[0]!;

    expect(node).toBeInstanceOf(PaperNode);
    expect(node.id).toBeDefined();
    expect(node.type).toBeDefined();
    expect(node.bbox).toBeDefined();
    expect(typeof node.position).toBe("number");
    expect(typeof node.page).toBe("number");
    expect(node.graph).toBe(graph);
  });

  test("next returns the following node within the loaded page", async () => {
    const graph = await paperful.papers.graph(uploaded!.id);
    if (graph.nodes.length < 2) return;

    const [first, second] = graph.nodes;
    const next = await first!.next();

    expect(next?.id).toBe(second!.id);
  });

  test("previous returns the preceding node within the loaded page", async () => {
    const graph = await paperful.papers.graph(uploaded!.id);
    if (graph.nodes.length < 2) return;

    const [first, second] = graph.nodes;
    const previous = await second!.previous();

    expect(previous?.id).toBe(first!.id);
  });

  test("next on the last loaded node fetches the next page", async () => {
    const graph = await paperful.papers.graph(uploaded!.id);
    if (!graph.cursor?.next) return;

    const countBefore = graph.nodes.length;
    const last = graph.nodes[graph.nodes.length - 1]!;
    const next = await last.next();

    expect(graph.nodes.length).toBeGreaterThan(countBefore);
    expect(next?.id).toBe(graph.nodes[countBefore]?.id);
  });

  test("next on a node not in the graph returns undefined", async () => {
    const graph = await paperful.papers.graph(uploaded!.id);
    const detached = new PaperNode({
      node: {
        id: "not-a-real-id",
        position: -1,
        page: 0,
        type: "unknown",
        bbox: { x: 0, y: 0, w: 0, h: 0 },
        created: new Date().toISOString(),
      },
      graph,
    });

    expect(await detached.next()).toBeUndefined();
    expect(await detached.previous()).toBeUndefined();
  });

  test("next appends nodes and updates the cursor", async () => {
    const graph = await paperful.papers.graph(uploaded!.id);
    if (!graph.cursor?.next) return;

    const countBefore = graph.nodes.length;
    const fetched = await graph.next();

    expect(fetched.length).toBeGreaterThan(0);
    expect(graph.nodes.length).toBe(countBefore + fetched.length);
    expect(graph.nodes.slice(countBefore).map((node) => node.id)).toEqual(
      fetched.map((node) => node.id),
    );
  });

  test("next resolves to an empty array when there is no next cursor", async () => {
    const graph = await paperful.papers.graph(uploaded!.id);
    graph.cursor = { ...graph.cursor, next: undefined };

    const fetched = await graph.next();

    expect(fetched).toEqual([]);
  });

  test("previous resolves to an empty array when there is no previous cursor", async () => {
    const graph = await paperful.papers.graph(uploaded!.id);
    graph.cursor = { ...graph.cursor, prev: undefined };

    const fetched = await graph.previous();

    expect(fetched).toEqual([]);
  });

  test("context returns a node around the requested position", async () => {
    const graph = await paperful.papers.graph(uploaded!.id);
    const node = graph.nodes[0]!;

    const context = await node.context({ before: 1, after: 1 });

    expect(context).toBeInstanceOf(PaperNode);
    expect(context.graph).toBe(graph);
  });
});
