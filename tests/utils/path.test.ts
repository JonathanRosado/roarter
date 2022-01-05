import {
  assert,
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.119.0/testing/asserts.ts";
import { extract, match } from "../../utils/path.ts";

Deno.test("match correctly matches different paths", () => {
  assert(
    match(
      "/user/:id",
      "/user/294",
    ),
  );

  assert(
    !match(
      "/user/:id/profile",
      "/user/294",
    ),
  );

  assert(
    match(
      "/user/:id",
      "/user/294/",
    ),
  );

  assert(
    match(
      "/:routeParams",
      "/jon-ros-lu",
    ),
  );

  assert(
    match(
      "/api",
      "/api/v1/hello",
      true,
    ),
  );

  assert(
    match(
      "/",
      "/api/v1/hello",
      true,
    ),
  );

  assert(
    match(
      "/api/v1/hello",
      "/api/v1/hello",
      true,
    ),
  );

  assert(
    match(
      "/api/:v1",
      "/api/v1/hello",
      true,
    ),
  );
});

Deno.test("extracts correctly returns the keys and values", () => {
  {
    const m = extract("/user/:id", "/user/2");
    assert(m.size === 1);
    assertEquals(m.get("id"), "2");
    assertEquals(m.get("notexist"), undefined);
  }

  {
    const m = extract("/user", "/user");
    assert(m.size === 0);
    assertEquals(m.get("notexist"), undefined);
  }

  {
    const m = extract("/user/:id", "/user/2/hello/there", true);
    assert(m.size === 1);
    assertEquals(m.get("id"), "2");
    assertEquals(m.get("notexist"), undefined);
  }

  {
    const m = extract("/user/:id/:id2", "/user/2/hello/there", true);
    assert(m.size === 2);
    assertEquals(m.get("id"), "2");
    assertEquals(m.get("id2"), "hello");
    assertEquals(m.get("notexist"), undefined);
  }

  {
    assertThrows(() => extract("/user/:id/wow", "/user/2"));
    assertThrows(() => extract("/user", "/user/2"));
    assertThrows(() => extract("/user/id", "/user/2"));
  }
});
