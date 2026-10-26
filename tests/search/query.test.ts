import { describe, expect, test } from "bun:test";
import { Paperful, type SearchEvent } from "../../src";
import { ValidationError } from "../../src/utils/error";

describe("search / query", () => {
  const paperful = new Paperful();
  const tag = crypto.randomUUID();

  test("prepare", async () => {
    await paperful.papers.upload({
      file: Bun.file("./tests/fixtures/text.pdf"),
      metadata: { tag },
    });
  }, 30000);

  test("valid", async () => {
    const results = await paperful.search.query("text");

    expect(results.total).toBeDefined();
    expect(results.items).toBeDefined();
  }, 30000);

  test("with mode", async () => {
    const results = await paperful.search.query("text", { mode: "fulltext" });

    expect(results.total).toBeDefined();
    expect(results.items).toBeDefined();
  });

  test("item shape", async () => {
    const results = await paperful.search.query("text");
    if (results.items.length === 0) return;

    const item = results.items[0]!;

    expect(typeof item.content).toBe("string");
    expect(item.nodes).toBeDefined();
    expect(item.paper).toBeDefined();
    expect(item.paper.id).toBeDefined();
    expect(item.paper.fileName).toBeDefined();
  }, 30000);

  test("with metadata", async () => {
    const results = await paperful.search.query("text", {
      metadata: { tag },
    });

    expect(results.items.length).toBeGreaterThan(0);

    for (const item of results.items)
      expect(item.paper.metadata?.tag).toBe(tag);
  }, 30000);

  test("without expansion and rerank", async () => {
    const results = await paperful.search.query("text", {
      expand: false,
      rerank: false,
    });

    expect(results.items.length).toBeGreaterThan(0);
    for (const item of results.items) expect(item.relevance).toBeUndefined();
  });

  test("reranked", async () => {
    const results = await paperful.search.query("text", { metadata: { tag } });

    expect(results.items.length).toBeGreaterThan(0);

    const relevance = results.items.map((item) => item.relevance!);
    expect(relevance).toEqual([...relevance].sort((a, b) => b - a));
  }, 30000);

  test("pagination", async () => {
    const results = await paperful.search.query("text");

    if (!results.cursor?.next) return;

    const next = await paperful.search.query("text", {
      next: results.cursor.next,
    });

    expect(next.cursor?.prev).toBeDefined();
  }, 30000);

  test("invalid cursor", async () => {
    await expect(
      paperful.search.query("text", { next: "not-a-cursor" }),
    ).rejects.toThrow(ValidationError);
  });

  test("events", async () => {
    const events: SearchEvent["event"][] = [];

    const results = await paperful.search.query("text", {
      metadata: { tag },
      onEvent: ({ event }) => events.push(event),
    });

    expect(events).toEqual([
      "started",
      "expanded",
      "results",
      "reranking",
      "completed",
    ]);
    expect(results.items.length).toBeGreaterThan(0);
  }, 30000);
});
