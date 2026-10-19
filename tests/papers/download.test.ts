import { describe, expect, test } from "bun:test";
import { Paperful } from "../../src";
import { NotFound } from "../../src/utils/error";

describe("papers / download", () => {
  const paperful = new Paperful();

  test("valid", async () => {
    const uploaded = await paperful.papers.upload({
      file: Bun.file("./tests/fixtures/text.pdf"),
      waitForProcessing: false,
    });

    const file = await paperful.papers.download(uploaded!.id);

    expect(file).toBeInstanceOf(File);
    expect(file.size).toBe(uploaded!.size);
    expect(file.name.endsWith(".pdf")).toBe(true);
  });

  test("not found", async () => {
    expect(
      paperful.papers.download(crypto.randomUUID()),
    ).rejects.toBeInstanceOf(NotFound);
  });
});
