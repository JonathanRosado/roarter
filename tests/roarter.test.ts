import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.119.0/testing/asserts.ts";
import { Application } from "../application.ts";
import { Response } from "../response.ts";
import { Request } from "../request.ts";

Deno.test("matchers can go before or after handler", async () => {
  let count = 0;

  const t = new Application();
  t.get.path("/hello1").handle(async (req) => {
    count++;
  });
  t.handle(async (req) => {
    count++;
  }).get.path("/hello2");
  t.get.handle(async (req) => {
    count++;
  }).path("/hello3");
  t.handle(async (req) => new Response("last"));
  // @ts-ignore
  await t.runHandlers(
    new Request(
      "https://example.com/hello1",
      {
        method: "GET",
      },
    ),
  );
  // @ts-ignore
  await t.runHandlers(
    new Request(
      "https://example.com/hello2",
      {
        method: "GET",
      },
    ),
  );
  // @ts-ignore
  await t.runHandlers(
    new Request(
      "https://example.com/hello3",
      {
        method: "GET",
      },
    ),
  );

  assertEquals(count, 3);
});

Deno.test("verb matchers", async () => {
  {
    const t = new Application();
    let count = 0;
    t.get.handle(async (req) => {
      count++;
      return new Response();
    });
    // @ts-ignore
    await t.runHandlers(
      new Request(
        "https://example.com/",
        {
          method: "GET",
        },
      ),
    );
    assertEquals(count, 1);
  }

  {
    const t = new Application();
    let count = 0;
    t.post.handle(async (req) => {
      count++;
      return new Response();
    });
    // @ts-ignore
    await t.runHandlers(
      new Request(
        "https://example.com/",
        {
          method: "POST",
        },
      ),
    );
    assertEquals(count, 1);
  }

  {
    const t = new Application();
    let count = 0;
    t.put.handle(async (req) => {
      count++;
      return new Response();
    });
    // @ts-ignore
    await t.runHandlers(
      new Request(
        "https://example.com/",
        {
          method: "PUT",
        },
      ),
    );
    assertEquals(count, 1);
  }

  {
    const t = new Application();
    let count = 0;
    t.delete.handle(async (req) => {
      count++;
      return new Response();
    });
    // @ts-ignore
    await t.runHandlers(
      new Request(
        "https://example.com/",
        {
          method: "DELETE",
        },
      ),
    );
    assertEquals(count, 1);
  }

  {
    const t = new Application();
    let count = 0;
    t.patch.handle(async (req) => {
      count++;
      return new Response();
    });
    // @ts-ignore
    await t.runHandlers(
      new Request(
        "https://example.com/",
        {
          method: "PATCH",
        },
      ),
    );
    assertEquals(count, 1);
  }

  {
    const t = new Application();
    let count = 0;
    t.delete.handle(async (req) => {
      count++;
    });
    t.handle(async (req) => new Response(""));
    // @ts-ignore
    await t.runHandlers(
      new Request(
        "https://example.com/",
        {
          method: "GET",
        },
      ),
    );
    assertEquals(count, 0);
  }
});

Deno.test("path matcher", async () => {
  {
    const t = new Application();
    let id;
    t.handle(async (req) => {
      id = req.params.get("id");
      return new Response();
    }).path("/users/:id");
    // @ts-ignore
    await t.runHandlers(new Request("http://example.com/users/2"));
    assertEquals(id, "2");
  }

  {
    const t = new Application();
    let id1;
    let id2;
    let id3;
    t.handle(async (req) => {
      id1 = req.params.get("id1");
      id2 = req.params.get("id2");
      id3 = req.params.get("id3");
      return new Response();
    }).path("/users/:id1/:id2/:id3");
    // @ts-ignore
    await t.runHandlers(new Request("http://example.com/users/1/2/3"));
    assertEquals(id1, "1");
    assertEquals(id2, "2");
    assertEquals(id3, "3");
  }

  {
    const t = new Application();
    let id;
    t.handle(async (req) => {
      id = req.params.get("id");
      return new Response();
    }).path("/users/:id");
    // @ts-ignore
    await t.runHandlers(
      new Request(
        "http://example.com/users/some-weird.key[with](funny);chars;",
      ),
    );
    assertEquals(id, "some-weird.key[with](funny);chars;");
  }

  {
    const t = new Application();
    let id;
    t.handle(async (req) => {
      id = req.params.get("some-weird.key[with](funny);chars;");
      return new Response();
    }).path("/users/:some-weird.key[with](funny);chars;");
    // @ts-ignore
    await t.runHandlers(new Request("http://example.com/users/1"));
    assertEquals(id, "1");
  }
});

Deno.test("edge cases with paths", async () => {
  {
    const t = new Application();
    let hit;
    t.handle(async (req) => {
      hit = true;
      return new Response();
    }).path("/");
    // @ts-ignore
    await t.runHandlers(new Request("http://example.com/"));
    assert(hit);
  }

  {
    const t = new Application();
    let hit;
    t.handle(async (req) => {
      hit = true;
      return new Response();
    }).path("/");
    // @ts-ignore
    t.runHandlers(new Request("http://example.com"));
    assert(hit);
  }

  {
    const t = new Application();
    let hit;
    t.handle(async (req) => {
      hit = true;
      return new Response();
    }).path("/");
    // @ts-ignore
    await t.runHandlers(new Request("http://example.com?key=val"));
    assert(hit);
  }

  {
    const t = new Application();
    let hit;
    t.handle(async (req) => {
      hit = true;
      return new Response();
    }).path("/");
    // @ts-ignore
    await t.runHandlers(new Request("http://example.com/?key=val"));
    assert(hit);
  }

  {
    const t = new Application();
    let hit;
    t.handle(async (req) => {
      hit = true;
      return new Response();
    }).path("/");
    t.handle(async (req) => new Response());
    // @ts-ignore
    await t.runHandlers(new Request("http://example.com/hello?key=val"));
    assert(!hit);
  }
});

Deno.test("query params matching", async () => {
  {
    const t = new Application();
    let hit;
    t.handle(async (req) => {
      hit = req.queries.get("key");
      return new Response();
    }).path("/").queries(["key"]);
    // @ts-ignore
    await t.runHandlers(new Request("http://example.com/?key=val"));
    assertEquals(hit, "val");
  }

  {
    const t = new Application();
    let hit;
    t.handle(async (req) => {
      hit = req.queries.get("key1") as string + req.queries.get("key2");
      return new Response();
    }).path("/hello/there").queries(["key1", "key2"]);
    // @ts-ignore
    await t.runHandlers(
      new Request("http://example.com/hello/there?key1=val1&key2=val2"),
    );
    assertEquals(hit, "val1val2");
  }

  {
    const t = new Application();
    let hit;
    t.handle(async (req) => {
      hit = req.queries.get("key1") as string + req.queries.get("key2");
    }).path("/hello/there").queries(["key"]);
    t.handle(async (req) => new Response());
    // @ts-ignore
    await t.runHandlers(new Request("http://example.com/hello/there?nope=val"));
    assertEquals(hit, undefined);
  }
});

Deno.test("Roarter runs all handlers sequentially UNTIL it receives the first Response. Then runs the remaining asynchronously so as to not keep the client hanging.", async () => {
  const t = new Application();
  let res = "";

  t.handle(async (req) => {
    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(null), 100);
    });
    res += "first";
  });
  t.path("/hello").handle(async (req) => {
    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(null), 100);
    });
    res += "second";
    return new Response("second");
  });
  t.path("/hello").handle(async (req) => {
    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(null), 100);
    });
    res += "third";
    return new Response("third");
  });
  t.path("/hello2").handle(async (req) => {
    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(null), 100);
    });
    res += "no";
    return new Response("no");
  });
  t.handle(async (req) => {
    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(null), 100);
    });
    res += "fourth";
  });
  t.handle(async (req) => {
    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(null), 100);
    });
    res += "fifth";
  });

  // @ts-ignore
  const response = await t.runHandlers(
    new Request("https://example.com/hello", { method: "GET" }),
  );
  console.log("received response");
  const text = await response.text();
  // Handler returns the first Response it finds
  assertEquals(text, "second");
  // Since 'first' and 'second' were executed synchronously and the rest were not,
  // we only expect 'first' and 'second' to have been waited on
  assertEquals(res, "firstsecond");

  // The rest will appear after some time
  await new Promise((resolve, reject) => {
    setTimeout(() => resolve(null), 1000);
  });
  assertEquals(res, "firstsecondthirdfourthfifth");
});

Deno.test("Roarter successfully catches the error and hands it off to .catch", async () => {
  const t = new Application();
  t.handle(async (req) => {
    throw new Error("error");
  });
  t.catch(async (req, err) => {
    return new Response(err.message);
  });
  // @ts-ignore
  const response = await t.runHandlers(
    new Request("https://example.com/hello", { method: "GET" }),
  );
  const text = await response.text();
  assertEquals(text, "error");
});

Deno.test("Roarter catches the error from postfix middleware", async () => {
  const t = new Application();
  let caught = false;
  t.get.handle(async (req) => {
    return new Response("done");
  });
  t.handle(async (req) => {
    throw new Error("error");
  });
  t.catch(async (req, err) => {
    caught = true;
    return new Response(err.message);
  });
  // @ts-ignore
  const response = await t.runHandlers(
    new Request("https://example.com/hello", { method: "GET" }),
  );
  await new Promise((resolve) => {
    setTimeout(() => resolve(null), 200);
  });
  assert(caught);
});

Deno.test("subrouters work", async () => {
  const app1 = new Application();

  app1.path("/hello").handle(async (req) => {
    return new Response("hello");
  });

  const app2 = new Application();

  app2.path("/api").handle(app1);

  // @ts-ignore
  const response = await app2.runHandlers(
    new Request("https://example.com/api/hello", { method: "GET" }),
  );

  assertEquals(await response.text(), "hello");
});

Deno.test("subrouters work with params", async () => {
  const app1 = new Application();

  app1.path("/hello/:p2").handle(async (req) => {
    assertEquals(req.params.get("p1"), "v1");
    assertEquals(req.params.get("p2"), "v2");
    return new Response("hello");
  });

  const app2 = new Application();

  app2.path("/api/:p1").handle(app1);

  // @ts-ignore
  const response = await app2.runHandlers(
    new Request("https://example.com/api/v1/hello/v2", { method: "GET" }),
  );

  assertEquals(await response.text(), "hello");
});
