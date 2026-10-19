import { describe, expect, test } from "bun:test";
import { Paperful } from "../../src";

describe("papers / metadata", () => {
  const paperful = new Paperful();
  const tag = crypto.randomUUID();

  let paperId: string;

  test("upload with metadata", async () => {
    const paper = await paperful.papers.upload({
      file: Bun.file("./tests/fixtures/text.pdf"),
      waitForProcessing: false,
      metadata: { tag, category: "invoice", amount: 150 },
    });

    paperId = paper!.id;
    expect(paper!.metadata).toMatchObject({
      tag,
      category: "invoice",
      amount: 150,
    });
  });

  test("list filtered by metadata", async () => {
    const matching = await paperful.papers.list({
      metadata: { tag, category: ["invoice", "receipt"], amount: { gte: 100 } },
    });

    expect(matching.items.map((paper) => paper.id)).toContain(paperId);

    const excluded = await paperful.papers.list({
      metadata: { tag, amount: { gt: 1000 } },
    });

    expect(excluded.items.map((paper) => paper.id)).not.toContain(paperId);
  });

  test("update merges metadata", async () => {
    const paper = await paperful.papers.update(paperId, {
      metadata: { category: "receipt", amount: null },
    });

    expect(paper.metadata).toEqual({ tag, category: "receipt" });
  });

  test("replace metadata", async () => {
    const paper = await paperful.papers.update(paperId, {
      metadata: { tag },
      replace: true,
    });

    expect(paper.metadata).toEqual({ tag });
  });
});
