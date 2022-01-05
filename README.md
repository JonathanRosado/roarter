[![oak ci](https://github.com/JonathanRosado/roarter/workflows/ci/badge.svg)](https://github.com/JonathanRosado/roarter)

# Roarter

A minimalist, intuitive, and unobtrusive middleware framework for Deno.

The goal of Roarter is to only add what is absolutely necessary to the native
HTTP server API, with as few abstractions as we can get away with.

# Handlers

The `Application` class is responsible for coordinating an HTTP request's
interaction with handlers. You may register a new `Handler` via
`Application.handle()` as shown below.

```typescript
let app = new Application();

app
  .handle(async (req) => {
    return Response.text("Hello World");
  });

await app.serve({ port: 8080 });
```

If you run the script

```shell
deno run --allow-net helloWorld.ts
```

all requests made to `localhost:8080` will return `Hello World`. This is because
we have not specified any `Matchers` for our `Handler`, so it will match all/any
incoming requests.

> NOTE: Handlers must be async (return a promise).
>
> This is to allow Roarter to orchestrate the HTTP request among middlewares and
> handlers.

# Matchers

By adding `Matchers` we can make it so the `Handler` is only executed if the
given conditions are met. For example, if we want our above example to only
respond `Hello World` if the request has an HTTP verb of `GET`, we would do the
following:

```typescript
let app = new Application();

app
  .match((req) => req.method === "GET")
  .handle(async (req) => {
    return Response.text("Hello World");
  });

await app.serve({ port: 8080 });
```

`Matchers` are passed the `Request` object and are expected to return boolean.
If all matchers return `true`, then `Application` will run the `Handler`.

In practice, Roarter includes most of the matchers you would ever need, so the
above example may be written with the `.get` matcher that's already included in
the framework.

```typescript
app
  .get
  .handle(async (req) => {
    return Response.text("Hello World");
  });
```

> Matchers may also pass information down to their handler which may be accessed
> via `req.params` or `req.vars`.
>
> This is useful when creating matchers that must "capture" values and pass them
> down. An example of this is the `.path("/user/:userId")` matcher which has to
> capture the value passed into `:userId`.

# Params

The `path()` matcher can be used to match a pathname and, optionally, capture
params. It stores all path params under the `req.params`
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).

```typescript
app
  .get
  .path("/user/:userId")
  .handle(async (req) => {
    return new Response("Echoing param " + req.params.get("userId"));
  });
```

# Sub Applications

As your application gets larger you will want to logically organize your
handlers. Roarter supports sub-routing to meet this need. Simply pass an
instance of `Application` to the `.handle()` method and it will treat it as a
sub-router.

```typescript
let user = new Application();

/**
 * GET tenant/:tenantId/user/:userId
 */
user
  .get
  .path("/user/:userId")
  .handle(async (req) => {
    return new Response(
      `Echoing params ${req.params.get("tenantId")}, ${
        req.params.get("userId")
      }`,
    );
  });

let tenant = new Application();

/**
 * GET tenant/:tenantId
 */
tenant
  .path("/tenant/:tenantId")
  .handle(user);

await tenant.serve({ port: 8080 });
```

# Errors

Roarter `Applications` can handle errors within the handler itself:

```typescript
app
  .post
  .path("/json")
  .handle(async (req) => {
    if (!req.body) {
      return Response.text("no body", { status: 400 });
    }
  });
```

Or via `Application.catch()`:

```typescript
app.catch(async (req, err) => {
  return Response.text(err.message, { status: 500 });
});
```

> `.catch()` gets called if any handlers throw an exception. It is always a good
> idea to add one in production.

# The Request and Response Objects

Roarter's `Request` and `Response` objects extend the native
[Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) and
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) objects.
Our goal is for our users to familiarize themselves with the native api as much
as possible. That said, we are not against adding practical utility methods when
needed. Below is a practical example of receiving and responding JSON.

```typescript
let app = new Application();

/**
 * GET /json
 */
app
  .get
  .path("/json")
  .handle(async (req) => {
    const response = {
      id: "123",
      data: [1, 2, 3],
    };

    return Response.json(response);
  });

/**
 * POST /json
 */
app
  .post
  .path("/json")
  .handle(async (req) => {
    if (!req.body) {
      return Response.text("no body", { status: 400 });
    }

    const body = await req.json();

    return Response.json(body);
  });

app.catch(async (req, err) => {
  return Response.text(err.message, { status: 500 });
});

await app.serve({ port: 8080 });
```

# Middleware

A Handler with no Matchers is essentially a Middleware. Roarter will run all
matching Handlers in order of insertion, so a Middleware that is added before a
Handler will run first, the Handler will run after that, and, finally, the
remaining Middleware if any.

```typescript
let app = new Application();

const jsonParser = async (req: Request) => {
  if (req.body) {
    req.vars.set("body", await req.json());
  }
};

const logger = async (req: Request) => {
  console.log(`Request sent to ${req.pathname}`);
};

app
  .handle(jsonParser);

app
  .post
  .path("/json")
  .handle(async (req) => {
    return Response.json(req.vars.get("body"));
  });

app
  .handle(logger);

await app.serve({ port: 8080 });
```
