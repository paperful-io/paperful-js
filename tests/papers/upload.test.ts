import { describe, expect, test } from "bun:test";
import { Paperful } from "../../src";

describe("papers / upload", () => {
  const paperful = new Paperful();

  test("valid", async () => {
    const paper = await paperful.papers.upload({
      file: Bun.file("./tests/fixtures/text.pdf"),
    });

    expect(paper).toBeDefined();
  }, 30000);

  test("no wait", async () => {
    const paper = await paperful.papers.upload({
      file: Bun.file("./tests/fixtures/text.pdf"),
      waitForProcessing: false,
    });

    expect(paper).toBeDefined();
  });
});
