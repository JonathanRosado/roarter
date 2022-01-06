import { Response } from "./response.ts";
import { Request } from "./request.ts";

export type Matcher = (
  req: Request,
  matcherIsForASubRouter?: boolean,
) => boolean;
export type HandleFunc = (
  req: Request,
) => Promise<Response | void> | Response | void;
export type CatchFunc = (
  req: Request,
  err: Error,
) => Promise<Response> | Response;
