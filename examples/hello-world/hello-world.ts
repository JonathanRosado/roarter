import { Application, Response } from "../../mod.ts";

let app = new Application();

app
  .get
  .path("/")
  .handle(async (req) => {
    return Response.text("Hello World");
  });

await app.serve({ port: 8080 });
