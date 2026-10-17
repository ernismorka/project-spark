import { Server, createRouter } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { PilotRoom } from "./PilotRoom";
const allowed = (origin: string | null | undefined) =>
  !origin || /^http:\/\/(127\.0\.0\.1|localhost):(4173|5173)$/.test(origin);
export function createPilotServer(reconnectSeconds = 20) {
  class LocalPilotRoom extends PilotRoom {
    override reconnectSeconds = reconnectSeconds;
  }
  let windowStart = Date.now(),
    requests = 0;
  const guard = (
    origin: string | null | undefined,
    method: string,
    length: number,
  ) => {
    if (!allowed(origin)) return new Response(null, { status: 403 });
    if (length > 2048) return new Response(null, { status: 413 });
    if (Date.now() - windowStart > 60000) {
      windowStart = Date.now();
      requests = 0;
    }
    if (method === "POST" && ++requests > 120)
      return new Response(null, { status: 429 });
  };
  const server = new Server({
    greet: false,
    gracefullyShutdown: false,
    transport: new WebSocketTransport({
      maxPayload: 2048,
      pingInterval: 1000,
      pingMaxRetries: 2,
      beforeUpgrade: (request) =>
        allowed(request.headers.get("origin"))
          ? undefined
          : new Response(null, { status: 403 }),
    }),
    express: (app) => {
      app.use((req, res, next) => {
        const denied = guard(
          req.headers.origin,
          req.method,
          Number(req.headers["content-length"] ?? 0),
        );
        if (denied) {
          res.status(denied.status).end();
          return;
        }
        next();
      });
      app.get("/health", (_req, res) => res.json({ ok: true }));
    },
  });
  // Colyseus routes run before Express middleware, so guard the native router too.
  server.router = createRouter(
    {},
    {
      onRequest: (request) =>
        guard(
          request.headers.get("origin"),
          request.method,
          Number(request.headers.get("content-length") ?? 0),
        ),
    },
  );
  server.define("pilot", LocalPilotRoom);
  return server;
}
