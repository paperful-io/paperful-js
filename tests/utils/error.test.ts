import { describe, expect, test } from "bun:test";
import {
  InsufficientCredits,
  InternalError,
  NotFound,
  PaperfulError,
  ValidationError,
} from "../../src";
import { errorFromResponse } from "../../src/utils/error";

describe("utils / errorFromResponse", () => {
  test("from the error body", async () => {
    const error = await errorFromResponse(
      Response.json(
        {
          error: {
            type: "validation",
            props: { next: { message: "Invalid cursor" } },
          },
        },
        { status: 400 },
      ),
    );

    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toBeInstanceOf(PaperfulError);
    expect(error.many?.next?.message).toBe("Invalid cursor");
  });

  test("insufficient credits", async () => {
    const error = await errorFromResponse(
      Response.json(
        { error: { type: "insufficient-credits" } },
        { status: 402 },
      ),
    );

    expect(error).toBeInstanceOf(InsufficientCredits);
    expect(error.status).toBe(402);

    // from the status alone as well
    expect(
      await errorFromResponse(new Response(null, { status: 402 })),
    ).toBeInstanceOf(InsufficientCredits);
  });

    test("from the status", async () => {
    const error = await errorFromResponse(new Response(null, { status: 404 }));

    expect(error).toBeInstanceOf(NotFound);
    expect(error.status).toBe(404);
  });

  test("unknown status is an internal error", async () => {
    const error = await errorFromResponse(new Response(null, { status: 500 }));

    expect(error).toBeInstanceOf(InternalError);
    expect(error.status).toBe(500);
  });
});
