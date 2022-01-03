import { ROMap } from "./types.ts";

class RoarterRequest extends Request {
  public params: Map<string, string> = new Map<string, string>();
  public vars: Map<string, string> = new Map<string, string>();
  public queries: URLSearchParams;
  public pathname: string;

  constructor(input: RequestInfo, init?: RequestInit) {
    super(input, init);
    const url = new URL(this.url);
    this.pathname = url.pathname;
    this.queries = url.searchParams;
  }
}

export { RoarterRequest as Request };
