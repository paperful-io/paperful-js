import { describe, expect, test } from "bun:test";
import { Paperful } from "../../src";

describe("papers / get", () => {
  const paperful = new Paperful();

  test("valid", async () => {
    const uploaded = await paperful.papers.upload({
      file: Bun.file("./tests/fixtures/text.pdf"),
      waitForProcessing: false,
    });

    const fetchedPaper = await paperful.papers.get(uploaded!.id);

    expect(fetchedPaper).toBeDefined();
  });
});
