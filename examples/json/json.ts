import { Application, Response } from "../../mod.ts";

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
