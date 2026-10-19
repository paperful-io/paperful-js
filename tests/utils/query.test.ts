import { describe, expect, test } from "bun:test";
import { serializeQuery } from "../../src/utils/query";

describe("utils / serializeQuery", () => {
  test("scalars", () => {
    expect(serializeQuery({ query: "a b", page: 2, draft: false })).toBe(
      "query=a+b&page=2&draft=false",
    );
  });

  test("skips undefined and null", () => {
    expect(serializeQuery({ a: undefined, b: null, c: "x" })).toBe("c=x");
  });

  test("arrays are comma separated", () => {
    expect(serializeQuery({ extension: ["pdf", "md"], empty: [] })).toBe(
      "extension=pdf%2Cmd",
    );
  });

  test("nested objects use bracket notation", () => {
    const query = serializeQuery({
      metadata: {
        category: ["invoice", "receipt"],
        amount: { gte: 100, lt: undefined },
      },
    });

    expect(decodeURIComponent(query)).toBe(
      "metadata[category]=invoice,receipt&metadata[amount][gte]=100",
    );
  });
});
