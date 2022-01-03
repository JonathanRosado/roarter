import { HandleFunc, Matcher } from "./types.ts";
import {
  buildPathMatcher,
  buildQueryMatcher,
  deleteMatcher,
  getMatcher,
  patchMatcher,
  postMatcher,
  putMatcher,
} from "./matchers.ts";
import { Response } from "./response.ts";
import { Request } from "./request.ts";
import {Application} from "./application.ts";

export class Handler {
  matchers: Matcher[] = [];
  handler: (HandleFunc | Application) | null = null;

  private isHandlerASubRouter(): boolean {
    return this.handler instanceof Application
  }

  runMatchers(req: Request): boolean {
    for (let i = 0; i < this.matchers.length; i++) {
      const matcher: Matcher = this.matchers[i];
      if (!matcher(req, this.isHandlerASubRouter())) return false;
    }
    return true;
  }

  async runHandler(req: Request) {
    if (!this.handler) return;
    if (this.isHandlerASubRouter()) {
      return (this.handler as Application).runHandlers(req)
    } else {
      return (this.handler as HandleFunc)(req);
    }
  }

  match(custom: Matcher): Handler {
    this.matchers.push(custom);
    return this;
  }

  get get(): Handler {
    return this.match(getMatcher);
  }

  get post(): Handler {
    return this.match(postMatcher);
  }

  get put(): Handler {
    return this.match(putMatcher);
  }

  get delete(): Handler {
    return this.match(deleteMatcher);
  }

  get patch(): Handler {
    return this.match(patchMatcher);
  }

  path(urlPath: string): Handler {
    return this.match(buildPathMatcher(urlPath));
  }

  queries(queries: string[]): Handler {
    return this.match(buildQueryMatcher(queries));
  }

  handle(handler: HandleFunc | Application) {
    this.handler = handler;
    return this;
  }

  async run(req: Request) {
    if (this.runMatchers(req)) {
      return this.runHandler(req);
    }
  }
}
