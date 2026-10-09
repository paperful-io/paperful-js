import { describe, expect, test } from "bun:test";
import { Paperful } from "../../src";

describe("papers / list", () => {
  const paperful = new Paperful();

  test("valid", async () => {
    const papers = await paperful.papers.list();
    expect(papers.total).toBeDefined();
    expect(papers.items).toBeDefined();
  });

  test("with filters and sorting", async () => {
    const papers = await paperful.papers.list({
      extension: ["pdf"],
      sort: "size",
      order: "asc",
    });

    expect(papers.items).toBeDefined();

    for (const paper of papers.items)
      expect(paper.version.extension).toBe("pdf");

    const sizes = papers.items.map((paper) => paper.size);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
  });
});
