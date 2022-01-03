import { Response } from "./response.ts";
import { Request } from "./request.ts";

export type Matcher = (req: Request, matcherIsForASubRouter?: boolean) => boolean;
export type HandleFunc = (req: Request) => Promise<Response | void>;
export type CatchFunc = (req: Request, err: Error) => Promise<Response>;
export interface ROMap<Key, Val> {
  get(key: Key): Val | undefined;
  has(key: Key): boolean;
}
