import { Papers } from "./resources/papers";
import { Search } from "./resources/search";

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

  constructor({
    apiKey,
  }: {
    /**
     * Your API Key. If not provided, it will be read from the PAPERFUL_API_KEY environment variable.
     */
    apiKey?: string;
  } = {}) {
    this.apiKey = apiKey || process.env.PAPERFUL_API_KEY;
    this.baseUrl =
      process.env.PAPERFUL_BASE_URL || "https://api.paperful.io/v1";

    this.papers = new Papers(this);
    this.search = new Search(this);
  }

  async request<T>({
    path,
    init = {},
  }: {
    path: string;
    init?: RequestInit;
  }): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...init.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Paperful API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  }
}
