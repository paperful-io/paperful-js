import { Papers } from "./resources/papers";
import { Search } from "./resources/search";
import { Usage } from "./resources/usage";
import { hydrateError, type DehydratedError } from "./utils/error";
import { getEnvironmentVariable } from "./utils/env";

/**
 * The base object for interacting with Paperful
 *
 * @example
 * const paperful = new Paperful({ apiKey: "pf_xyz" });
 *
 */
export class Paperful {
  private readonly apiKey?: string;
  private readonly baseUrl?: string;

  readonly papers: Papers;
  readonly search: Search;
  readonly usage: Usage;

  constructor({
    apiKey,
  }: {
    /**
     * Your API Key. If not provided, it will be read from the PAPERFUL_API_KEY environment variable.
     */
    apiKey?: string;
  } = {}) {
    this.apiKey = apiKey || getEnvironmentVariable("PAPERFUL_API_KEY");
    this.baseUrl =
      getEnvironmentVariable("PAPERFUL_BASE_URL") ||
      "https://api.paperful.io/v1";

    this.papers = new Papers(this);
    this.search = new Search(this);
    this.usage = new Usage(this);
  }

  private fetch(payload: { path: string; init?: RequestInit }) {
    return fetch(`${this.baseUrl}${payload.path}`, {
      ...payload.init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "User-Agent": "@paperful/sdk",
        ...payload.init?.headers,
      },
    });
  }

  async request<T>({
    path,
    init = {},
  }: {
    path: string;
    init?: RequestInit;
  }): Promise<T> {
    const response = await this.fetch({ path, init });

    if (!response.ok) {
      const error = await response.json();
      throw hydrateError(error as DehydratedError);
    }

    return response.json() as Promise<T>;
  }

  async *stream<T>({
    path,
    init = {},
  }: {
    path: string;
    init?: RequestInit;
  }): AsyncGenerator<T, void, unknown> {
    const response = await this.fetch({
      path,
      init: {
        ...init,
        headers: {
          ...init.headers,
          Accept: "text/event-stream",
        },
      },
    });

    if (!response.ok) {
      throw new Error(
        `Paperful API error: ${response.status} ${response.statusText}`,
      );
    }

    if (!response.body) {
      throw new Error("Paperful API error: response body is empty");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      while (true) {
        const end = buffer.indexOf("\n\n");
        if (end === -1) break;

        const raw = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);

        let event = "message";
        const data: string[] = [];

        for (const line of raw.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();

          if (line.startsWith("data:")) data.push(line.slice(5).trim());
        }

        yield {
          event,
          data: JSON.parse(data.join("\n")),
        } as T;
      }
    }
  }
}
