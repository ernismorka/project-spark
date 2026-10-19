import { test } from "node:test";
import assert from "node:assert/strict";
import { request } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import process from "node:process";
import { URL } from "node:url";
import { setTimeout, clearTimeout } from "node:timers";
import { startDemo } from "./demo/server.mjs";
import { inventory, output, packageDemo } from "./package-demo.mjs";

test("package inventory is complete and repeated packaging reproduces contents", async () => {
  const before = JSON.parse(
    await readFile(join(output, "manifest.json"), "utf8"),
  );
  const files = await inventory(output);
  delete files["manifest.json"];
  assert.deepEqual(files, before.files);
  assert.ok(files["Start Spark Demo.cmd"]);
  assert.ok(files["THIRD-PARTY-NOTICES.txt"]);
  assert.ok(
    !Object.keys(files).some(
      (name) => name.includes("node_modules") || name.includes(".map"),
    ),
  );
  await packageDemo();
  assert.deepEqual(
    JSON.parse(await readFile(join(output, "manifest.json"), "utf8")),
    before,
  );
});

test("packaged HTTP server confines reads, validates authority and stops cleanly", async () => {
  const { startDemo: packagedStart } = await import(
    new URL(`../dist/project-spark-0.8.0-demo.1/server.mjs`, import.meta.url)
  );
  const server = await packagedStart({ root: join(output, "web"), port: 0 });
  const port = server.address().port;
  const get = (path, options = {}) =>
    new Promise((resolve, reject) => {
      const req = request(
        { host: "127.0.0.1", port, path, agent: false, ...options },
        (res) => {
          let body = "";
          res.setEncoding("utf8");
          res.on("data", (data) => (body += data));
          res.on("end", () =>
            resolve({ status: res.statusCode, headers: res.headers, body }),
          );
        },
      );
      req.on("error", reject);
      req.end();
    });
  try {
    const index = await get("/");
    assert.equal(index.status, 200);
    assert.match(index.body, /<html/);
    assert.equal(index.headers["cache-control"], "no-store");
    assert.equal(index.headers["x-content-type-options"], "nosniff");
    assert.equal((await get("/", { method: "HEAD" })).body, "");
    const asset = index.body.match(/src="([^"]+\.js)"/)[1];
    assert.match((await get(asset)).headers["content-type"], /javascript/);
    for (const path of [
      "/../manifest.json",
      "/%2e%2e/manifest.json",
      "/assets/%2e%2e/%2e%2e/server.mjs",
    ])
      assert.equal((await get(path)).status, 403);
    assert.equal((await get("/%zz")).status, 400);
    assert.equal((await get("/%5c..%5cmanifest.json")).status, 400);
    assert.equal((await get("/missing.js")).status, 404);
    assert.equal((await get("/assets")).status, 404);
    assert.equal((await get("/", { method: "POST" })).status, 405);
    assert.equal(
      (await get("/", { headers: { Host: "attacker.invalid" } })).status,
      403,
    );
    assert.equal(
      (await get("/", { headers: { Origin: "https://attacker.invalid" } }))
        .status,
      403,
    );
    await assert.rejects(startDemo({ root: join(output, "web"), port }), {
      code: "EADDRINUSE",
    });
    await assert.rejects(
      startDemo({ root: join(output, "missing"), port: 0 }),
      { code: "ENOENT" },
    );
  } finally {
    await new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });
  }
  await assert.rejects(get("/"), { code: "ECONNREFUSED" });
});

test("standalone packaged CLI starts from another cwd without project dependencies", async () => {
  const reservation = await startDemo({ root: join(output, "web"), port: 0 });
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const child = spawn(
    process.execPath,
    [join(output, "server.mjs"), `--port=${port}`],
    {
      cwd: process.env.TEMP ?? "/tmp",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    },
  );
  let log = "";
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error(`CLI startup timed out: ${log}`)),
        10000,
      );
      const done = (error) => {
        clearTimeout(timeout);
        if (error) reject(error);
        else resolve();
      };
      child.once("error", done);
      child.once("exit", (code) =>
        done(new Error(`Unexpected exit ${code}: ${log}`)),
      );
      child.stdout.on("data", (data) => {
        log += data;
        if (log.includes(`http://127.0.0.1:${port}`)) done();
      });
      child.stderr.on("data", (data) => (log += data));
    });
    assert.equal(
      (await globalThis.fetch(`http://127.0.0.1:${port}`)).status,
      200,
    );
  } finally {
    if (child.pid && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill("SIGTERM");
      await exited;
    }
  }
  for (const arg of [
    "--port=0",
    "--port=99999",
    "--port=invalid",
    "--unexpected",
  ]) {
    const invalid = spawn(process.execPath, [join(output, "server.mjs"), arg], {
      stdio: "pipe",
      windowsHide: true,
    });
    let error = "";
    invalid.stderr.on("data", (data) => (error += data));
    const [code] = await once(invalid, "exit");
    assert.equal(code, 1);
    assert.match(error, /Cannot start Project Spark/);
  }
});
