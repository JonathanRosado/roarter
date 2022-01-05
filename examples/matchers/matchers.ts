import { Application, Response } from "../../mod.ts";

let app = new Application();

app
  .match((req) => req.method === "GET")
  .handle(async (req) => {
    return Response.text("Hello World");
  });

await app.serve({ port: 8080 });
