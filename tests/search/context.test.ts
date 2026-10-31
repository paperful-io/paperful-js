import { describe, expect, test } from "bun:test";
import { Paperful, PaperNode, SearchItem } from "../../src";

describe("search / context", () => {
  const paperful = new Paperful();
  const tag = crypto.randomUUID();

  let item: SearchItem;

  test("prepare", async () => {
    await paperful.papers.upload({
      file: Bun.file("./tests/fixtures/text.pdf"),
      metadata: { tag },
    });

    // wait for the content to be indexed
    const start = Date.now();

    do {
      const { items } = await paperful.search.query("text", {
        mode: "fulltext",
        metadata: { tag },
      });

      if (items[0]) {
        item = items[0];
        return;
      }

      await Bun.sleep(500);
    } while (Date.now() - start < 30000);

    throw new Error("Paper content was not indexed");
  }, 60000);

  test("items are search items", () => {
    expect(item).toBeInstanceOf(SearchItem);
    expect(item.nodes.length).toBeGreaterThan(0);
  });

  test("context includes the result nodes", async () => {
    const context = await item.context({ before: 1, after: 1 });

    expect(context.length).toBeGreaterThanOrEqual(item.nodes.length);
    expect(context.every((node) => node instanceof PaperNode)).toBe(true);

    const ids = context.map((node) => node.id);
    for (const { id } of item.nodes) expect(ids).toContain(id);

    const positions = context.map((node) => node.position);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  }, 30000);

  test("neighbours are fetched past the context", async () => {
    const context = await item.context({ before: 0, after: 0 });
    const last = context[context.length - 1]!;
    const first = context[0]!;

    const next = await last.next();
    if (next) expect(next.position).toBe(last.position + 1);

    const previous = await first.previous();
    if (previous) expect(previous.position).toBe(first.position - 1);
    else expect(first.position).toBe(0);

    // the fetched neighbours join the graph
    if (next) expect(last.graph.nodes).toContain(next);
  }, 30000);

  test("graph", async () => {
    const graph = await item.graph();

    expect(graph.paperId).toBe(item.paper.id);
    expect(graph.partial).toBe(false);
  }, 30000);
});
