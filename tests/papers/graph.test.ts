import { describe, expect, test } from "bun:test";
import { Paperful } from "../../src";

describe("papers / graph", () => {
  const paperful = new Paperful();

  let uploaded: Awaited<ReturnType<typeof paperful.papers.upload>>;

  test("prepare", async () => {
    uploaded = await paperful.papers.upload({
      file: Bun.file("./tests/fixtures/text.pdf"),
    });
  });

  test("valid", async () => {
    const graph = await paperful.papers.graph(uploaded!.id);
  });
});
