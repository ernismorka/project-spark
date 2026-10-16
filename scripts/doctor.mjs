import { URL } from "node:url";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import process from "node:process";
import console from "node:console";
import { chromium, firefox } from "@playwright/test";
const manifest = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
let failed = false;
console.log(
  `Node ${process.versions.node} (required: ${manifest.engines.node})`,
);
if (Number(process.versions.node.split(".")[0]) < 24) failed = true;
const pnpm = process.env.npm_execpath;
if (pnpm) {
  const result = spawnSync(process.execPath, [pnpm, "--version"], {
    encoding: "utf8",
  });
  const actual = result.stdout.trim();
  console.log(`pnpm ${actual} (pinned: ${manifest.packageManager})`);
  if (result.status !== 0 || `pnpm@${actual}` !== manifest.packageManager)
    failed = true;
} else {
  console.error("Run via pnpm doctor:project.");
  failed = true;
}
const git = spawnSync("git", ["--version"], { encoding: "utf8" });
console.log(git.status === 0 ? git.stdout.trim() : "Git unavailable");
if (git.status !== 0) failed = true;
for (const [name, browser] of [
  ["Chromium", chromium],
  ["Firefox", firefox],
]) {
  const present = existsSync(browser.executablePath());
  console.log(
    `${name} binary: ${present ? "installed" : "missing (pnpm exec playwright install chromium firefox)"}`,
  );
  if (!present) failed = true;
}
console.log(
  "Binary presence does not verify browser launch or rendering; pnpm test:e2e does.",
);
process.exitCode = failed ? 1 : 0;
