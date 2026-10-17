import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { PilotRoom } from "./PilotRoom";
const allowed = (origin: string | null | undefined) =>
  !origin || /^http:\/\/(127\.0\.0\.1|localhost):(4173|5173)$/.test(origin);
export function createPilotServer(reconnectSeconds = 20) {
  class LocalPilotRoom extends PilotRoom {
    override reconnectSeconds = reconnectSeconds;
  }
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
      let windowStart = Date.now(),
        requests = 0;
      app.use((req, res, next) => {
        if (!allowed(req.headers.origin)) {
          res.status(403).end();
          return;
        }
        if (Date.now() - windowStart > 60000) {
          windowStart = Date.now();
          requests = 0;
        }
        if (req.method === "POST" && ++requests > 120) {
          res.status(429).end();
          return;
        }
        next();
      });
      app.get("/health", (_req, res) => res.json({ ok: true }));
    },
  });
  server.define("pilot", LocalPilotRoom);
  return server;
}
