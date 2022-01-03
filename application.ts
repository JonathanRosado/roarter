import { serve, ServeInit } from "https://deno.land/std@0.119.0/http/server.ts";
import { Handler } from "./handler.ts";
import {CatchFunc, HandleFunc, Matcher} from "./types.ts";
import { Request as RoarterRequest } from "./request.ts";

export class Application {
  handlers: Handler[] = [];
  catchFunc: CatchFunc = () => {
    throw new Error("Not Implemented");
  };

  match(custom: Matcher): Handler {
    const handler = new Handler().match(custom);
    this.handlers.push(handler);
    return handler;
  }

  get get(): Handler {
    const handler = new Handler().get;
    this.handlers.push(handler);
    return handler;
  }

  get post(): Handler {
    const handler = new Handler().post;
    this.handlers.push(handler);
    return handler;
  }

  get put(): Handler {
    const handler = new Handler().put;
    this.handlers.push(handler);
    return handler;
  }

  get delete(): Handler {
    const handler = new Handler().delete;
    this.handlers.push(handler);
    return handler;
  }

  get patch(): Handler {
    const handler = new Handler().patch;
    this.handlers.push(handler);
    return handler;
  }

  path(path: string): Handler {
    const handler = new Handler().path(path);
    this.handlers.push(handler);
    return handler;
  }

  queries(queries: string[]): Handler {
    const handler = new Handler().queries(queries);
    this.handlers.push(handler);
    return handler;
  }

  handle(handler: HandleFunc | Application): Handler {
    const h = new Handler().handle(handler);
    this.handlers.push(h);
    return h;
  }

  catch(fn: CatchFunc) {
    this.catchFunc = fn;
  }

  // Handler runs all the registered handlers and returns the first
  // response it finds. After returning the first response, it runs
  // the remaining handlers. The purpose of this is to support middleware
  // after a response has been sent.
  async runHandlers(req: RoarterRequest): Promise<Response> {
    let runRemaining = true
    let i = 0;
    try {
      try {
        for (i; i < this.handlers.length; i++) {
          const handler = this.handlers[i];
          const response = await handler.run(req);
          if (response) {
            i++;
            return response;
          }
        }
      } catch (e) {
        // If an error occurs, we wan't to skip all handlers and run the catchFunc
        runRemaining = false
        return await this.catchFunc(req, e);
      }
      // If after running all the handlers there is no response, throw the error
      throw new Error(
        `No Response was sent for ${req.method} ${req.url}`,
      );
    } finally {
      if (runRemaining) {
        // Since at this point we have already returned a response,
        // we run the remaining handlers ignoring their response and errors
        for (i; i < this.handlers.length; i++) {
          const handler = this.handlers[i];
          handler.run(req).catch(e => {
            this.catchFunc(req, e)
          })
        }
      }
    }
  }

  async handler(domReq: Request): Promise<Response> {
    const req = new RoarterRequest(domReq);
    return this.runHandlers(req)
  }

  async serve(options?: ServeInit) {
    this.handler = this.handler.bind(this);
    await serve(this.handler, options);
  }
}
