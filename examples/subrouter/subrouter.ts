import { Application, Response } from "../../mod.ts";

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
