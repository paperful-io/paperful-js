import { describe, expect, test } from "bun:test";
import { Paperful } from "../../src";

describe("papers / delete", () => {
  const paperful = new Paperful();

  test("valid", async () => {
    const uploaded = await paperful.papers.upload({
      file: Bun.file("./tests/fixtures/text.pdf"),
    });

    const deleted = await paperful.papers.delete(uploaded!.id);

    expect(deleted.id).toBeDefined();
    expect(deleted.status).toBe("deleted");
  });
});
