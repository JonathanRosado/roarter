import { Application, Request, Response } from "../../mod.ts";

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

/**
 * POST /json
 */
app
  .post
  .path("/json")
  .handle(async (req) => {
    return Response.json(req.vars.get("body"));
  });

app
  .handle(logger);

await app.serve({ port: 8080 });
