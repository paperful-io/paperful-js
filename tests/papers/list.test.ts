import { describe, expect, test } from "bun:test";
import { Paperful } from "../../src";

describe("papers / list", () => {
  const paperful = new Paperful();

  test("valid", async () => {
    const papers = await paperful.papers.list();
    expect(papers.total).toBeDefined();
    expect(papers.items).toBeDefined();
  });
});
