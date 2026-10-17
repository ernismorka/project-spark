import { createPilotServer } from "./server";
const server = createPilotServer();
await server.listen(2567, "127.0.0.1");
console.log(
  "Project Spark cooperative pilot: http://127.0.0.1:2567 (local only)",
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    void server.gracefullyShutdown(false).then(() => process.exit(0));
  });
