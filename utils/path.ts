/**
 * match returns true if a Roarter path, of the form /user/:id, matches a given real-world path,
 * such as /user/83
 * @param matchPath
 * @param realPath
 * @param prefix
 */
export function match(matchPath: string, realPath: string, prefix: boolean = false): boolean {
  const matchPathSplit = matchPath.split("/").filter(s => s !== '');
  const realPathSplit = realPath.split("/").filter(s => s !== '');

  if (!prefix && matchPathSplit.length !== realPathSplit.length) {
    return false;
  }

  for (let i = 0; i < matchPathSplit.length; i++) {
    const matchStr = matchPathSplit[i];
    const realStr = realPathSplit[i];

    // a ':' matches everything, so continue
    if (matchStr[0] === ":") continue;

    if (matchStr !== realStr) return false;
  }

  return true;
}

/**
 * extract returns a map of the matchPath keys mapped to the realPath values
 * @param matchPath
 * @param realPath
 * @param prefix
 */
export function extract(
  matchPath: string,
  realPath: string,
  prefix: boolean = false
): Map<string, string> {
  const matchPathSplit = matchPath.split("/").filter(s => s !== '');
  const realPathSplit = realPath.split("/").filter(s => s !== '');

  if (!prefix && matchPathSplit.length !== realPathSplit.length) {
    throw new Error(
      "matchPath and realPath do not match. Call match before calling this function.",
    );
  }

  const m = new Map<string, string>();

  for (let i = 0; i < matchPathSplit.length; i++) {
    const matchStr = matchPathSplit[i];
    const realStr = realPathSplit[i];

    // a ':' matches everything, so continue
    if (matchStr[0] === ":") {
      m.set(matchStr.substr(1), realStr);
      continue;
    }

    if (matchStr !== realStr) {
      throw new Error(
        "matchPath and realPath do not match. Call match before calling this function.",
      );
    }
  }

  return m;
}
