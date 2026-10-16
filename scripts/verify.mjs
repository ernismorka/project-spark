import { spawnSync } from "node:child_process";
import process from "node:process";
import console from "node:console";

const pnpm = process.env.npm_execpath;
if (!pnpm) {
  console.error("Run this entry point with pnpm verify.");
  process.exit(1);
}
for (const stage of ["lint", "typecheck", "test", "build", "test:e2e"]) {
  console.log(`\nProject Spark validation: ${stage}`);
  const result = spawnSync(
    process.execPath,
    [
      pnpm,
      "run",
      stage,
      ...(stage === "test:e2e" && process.env.SPARK_HEADED === "1"
        ? ["--headed"]
        : []),
    ],
    {
      stdio: "inherit",
      env: process.env,
    },
  );
  if (result.error) console.error(result.error.message);
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
