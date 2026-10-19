import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { resolve, relative, extname, sep, isAbsolute } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { spawn } from "node:child_process";
import process from "node:process";
import console from "node:console";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// Also used by release integration tests. No project dependencies or development tooling.
export async function startDemo({ root, port = 4173 }) {
  const base = await realpath(root);
  await readFile(resolve(base, "index.html"));
  const server = createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    const fail = (code) => {
      response.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(`Project Spark: ${code}`);
    };
    // Reject cross-site requests and DNS rebinding; only our loopback authority is valid.
    const authority = `127.0.0.1:${server.address().port}`;
    if (request.headers.host !== authority) return fail(403);
    if (
      request.headers.origin &&
      request.headers.origin !== `http://${authority}`
    )
      return fail(403);
    if (!["GET", "HEAD"].includes(request.method)) return fail(405);
    try {
      const pathname = decodeURIComponent((request.url ?? "/").split("?")[0]);
      if (
        !pathname.startsWith("/") ||
        pathname.includes("\\") ||
        pathname.includes("\0") ||
        pathname.includes(":")
      )
        return fail(400);
      const target = resolve(
        base,
        `.${pathname === "/" ? "/index.html" : pathname}`,
      );
      const inside = (path) => {
        const rel = relative(base, path);
        return rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
      };
      if (!inside(target)) return fail(403);
      const actual = await realpath(target);
      if (!inside(actual)) return fail(403);
      if (!(await stat(actual)).isFile()) return fail(404);
      const body = await readFile(actual);
      response.writeHead(200, {
        "Content-Type": mime[extname(actual)] ?? "application/octet-stream",
        "Content-Length": body.byteLength,
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch (error) {
      fail(error instanceof URIError ? 400 : 404);
    }
  });
  server.requestTimeout = 5000;
  server.headersTimeout = 5000;
  server.maxConnections = 32;
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  return server;
}

export async function launch(args = process.argv.slice(2)) {
  if (Number(process.versions.node.split(".")[0]) < 24)
    throw new Error(
      "Install Node.js 24 or newer, then start the demo again. / Įdiek Node.js 24 ar naujesnį.",
    );
  let port = 4173;
  let open = false;
  for (const arg of args) {
    if (arg === "--open") open = true;
    else if (/^--port=\d+$/.test(arg)) {
      port = Number(arg.slice(7));
      if (port < 1024 || port > 65535)
        throw new Error("Port must be 1024–65535.");
    } else throw new Error(`Unknown option: ${arg}`);
  }
  const server = await startDemo({
    root: fileURLToPath(new URL("./web/", import.meta.url)),
    port,
  });
  const url = `http://127.0.0.1:${port}`;
  console.log(
    `Project Spark demo: ${url}\nKeep this window open. Ctrl+C stops the demo.\nPalik šį langą atvertą. Ctrl+C sustabdo demonstraciją.`,
  );
  if (
    open &&
    process.platform === "win32" &&
    process.env.SPARK_DEMO_NO_OPEN !== "1"
  ) {
    // URL is constructed only from validated integer port and a constant loopback host.
    const child = spawn("cmd.exe", ["/d", "/c", "start", "", url], {
      windowsHide: true,
      stdio: "ignore",
    });
    child.on("error", () =>
      console.error(`Open your browser manually: ${url}`),
    );
  }
  const stop = () => {
    server.close();
    server.closeAllConnections();
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  server.once("close", () => {
    process.off("SIGINT", stop);
    process.off("SIGTERM", stop);
  });
  return server;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  launch().catch((error) => {
    console.error(
      `Cannot start Project Spark: ${error.code === "EADDRINUSE" ? "Port is busy. Close the other demo or use --port=4174." : error.message}`,
    );
    process.exitCode = 1;
  });
}
