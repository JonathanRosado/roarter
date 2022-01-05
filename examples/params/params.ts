import { Application, Response } from "../../mod.ts";

const app = new Application();

/**
 * GET index
 */
app
  .get
  .path("/")
  .handle(async (req) => {
    return Response.text("Visit /user/1");
  });

/**
 * GET user/:userId
 */
app
  .get
  .path("/user/:userId")
  .handle(async (req) => {
    return new Response("Echoing param " + req.params.get("userId"));
  });

await app.serve({ port: 8080 });
