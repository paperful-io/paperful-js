import { describe, expect, test } from "bun:test";
import { Paperful } from "../../src";
import { NotFound } from "../../src/utils/error";

const PngSignature = [0x89, 0x50, 0x4e, 0x47];

describe("papers / render", () => {
  const paperful = new Paperful();

  let uploaded: Awaited<ReturnType<typeof paperful.papers.upload>>;

  test("prepare", async () => {
    uploaded = await paperful.papers.upload({
      file: Bun.file("./tests/fixtures/text.pdf"),
    });
  }, 30000);

  test("valid", async () => {
    const image = await paperful.papers.render(uploaded!.id, { size: 200 });

    expect(image).toBeInstanceOf(Blob);
    expect(image.type).toBe("image/webp");
    expect(image.size).toBeGreaterThan(0);
  });

  test("format", async () => {
    const image = await paperful.papers.render(uploaded!.id, {
      size: 200,
      format: "png",
    });

    expect(image.type).toBe("image/png");
    expect([...new Uint8Array(await image.arrayBuffer()).slice(0, 4)]).toEqual(
      PngSignature,
    );
  });

  test("size and extract", async () => {
    const image = await paperful.papers.render(uploaded!.id, {
      size: [200, 300],
      page: 1,
      extract: { x: 0, y: 0, w: 0.5, h: 0.5 },
    });

    expect(image.size).toBeGreaterThan(0);
  });

  test("node", async () => {
    const graph = await paperful.papers.graph(uploaded!.id);

    const image = await paperful.papers.render(uploaded!.id, {
      size: 200,
      node: graph.nodes[0]!.id,
    });

    expect(image.size).toBeGreaterThan(0);
  });

  test("not found", async () => {
    expect(
      paperful.papers.render(crypto.randomUUID(), { size: 200 }),
    ).rejects.toBeInstanceOf(NotFound);
  });
});
