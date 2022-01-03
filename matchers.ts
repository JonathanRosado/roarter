import { Matcher, ROMap } from "./types.ts";
import { extract, match } from "./utils/path.ts";

export const getMatcher: Matcher = (req) => {
  return req.method === "GET";
};

export const postMatcher: Matcher = (req) => {
  return req.method === "POST";
};

export const putMatcher: Matcher = (req) => {
  return req.method === "PUT";
};

export const deleteMatcher: Matcher = (req) => {
  return req.method === "DELETE";
};

export const patchMatcher: Matcher = (req) => {
  return req.method === "PATCH";
};

export const buildPathMatcher: (path: string) => Matcher = (path) => {
  const prefixKey = "PathMatcher#PathPrefix"
  return (req, matcherIsForASubRouter) => {
    const url = new URL(req.url);

    // If the matcher is for a subrouter (as opposed to a handlerFunc), then we want to match the prefix
    // of the path name and store it for later use
    if (matcherIsForASubRouter) {
      let pathCopy = path
      if (req.vars.has(prefixKey)) {
        pathCopy = req.vars.get(prefixKey) + pathCopy
      }
      if (!match(pathCopy, url.pathname, true)) return false;
      req.vars.set(prefixKey, pathCopy)
      const m = extract(pathCopy, url.pathname, true);
      for (const [key, val] of m) {
        req.params.set(key, val)
      }
      return true
    } else {
      let pathCopy = path
      if (req.vars.has(prefixKey)) {
        pathCopy = req.vars.get(prefixKey) + pathCopy
      }
      if (!match(pathCopy, url.pathname)) return false;
      const m = extract(pathCopy, url.pathname);
      for (const [key, val] of m) {
        req.params.set(key, val)
      }
      return true;
    }
  };
};

export const buildQueryMatcher: (queries: string[]) => Matcher = (queries) => {
  return (req) => {
    for (const query of queries) {
      if (!req.queries.has(query)) return false;
    }
    return true;
  };
};
