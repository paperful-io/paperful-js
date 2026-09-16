import { describe, expect, test } from "bun:test";
import { Paperful } from "../../src";

describe("search / query", () => {
  const paperful = new Paperful();

  test("prepare", async () => {
    await paperful.papers.upload({
      file: Bun.file("./tests/fixtures/text.pdf"),
    });
  }, 30000);

  test("valid", async () => {
    const results = await paperful.search.query("text");

    expect(results.total).toBeDefined();
    expect(results.items).toBeDefined();
  });

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
  });
});
