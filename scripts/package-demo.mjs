import {
  cp,
  mkdir,
  readdir,
  readFile,
  writeFile,
  rm,
  lstat,
  rename,
} from "node:fs/promises";
import { resolve, join, relative } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import process from "node:process";
import console from "node:console";

export const version = "0.8.0-demo.1";
const root = fileURLToPath(new URL("../", import.meta.url));
export const output = resolve(root, "dist", `project-spark-${version}`);
export async function inventory(directory, prefix = "") {
  const files = {};
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort(
    (a, b) => (a.name < b.name ? -1 : 1),
  )) {
    const name = prefix + entry.name;
    if (entry.isDirectory())
      Object.assign(
        files,
        await inventory(join(directory, entry.name), `${name}/`),
      );
    else if (entry.isFile()) {
      const content = await readFile(join(directory, entry.name));
      files[name] = {
        bytes: content.byteLength,
        sha256: createHash("sha256").update(content).digest("hex"),
      };
    } else throw new Error(`Unexpected non-file in demo: ${name}`);
  }
  return files;
}

export async function packageDemo() {
  const pnpm = process.env.npm_execpath;
  if (!pnpm) throw new Error("Use pnpm demo:package.");
  const distributionRoot = resolve(root, "dist");
  await mkdir(distributionRoot, { recursive: true });
  if ((await lstat(distributionRoot)).isSymbolicLink())
    throw new Error("Refusing a linked distribution directory.");
  // Build first; a failed build never replaces a previously usable package.
  execFileSync(process.execPath, [pnpm, "build"], {
    cwd: root,
    stdio: "inherit",
  });
  const stage = `${output}.staging`;
  // Both deletion targets are fixed children of our ignored dist directory, never CLI input.
  for (const target of [stage, output]) {
    if (relative(distributionRoot, target).startsWith(".."))
      throw new Error("Invalid package path");
    const existing = await lstat(target).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
    if (existing?.isSymbolicLink())
      throw new Error(`Refusing symlink: ${target}`);
  }
  await rm(stage, { recursive: true, force: true });
  await mkdir(stage, { recursive: true });
  await cp(resolve(root, "apps/web/dist"), join(stage, "web"), {
    recursive: true,
  });
  for (const name of ["server.mjs", "Start Spark Demo.cmd"])
    await cp(resolve(root, "scripts/demo", name), join(stage, name));
  // Preserve a Windows-native launcher even when packaging on Linux CI.
  const launcher = join(stage, "Start Spark Demo.cmd");
  await writeFile(
    launcher,
    (await readFile(launcher, "utf8")).replace(/\r?\n/g, "\r\n"),
  );
  for (const [from, to] of [
    ["DEMO_START.md", "START-HERE.md"],
    ["DEMO_LIMITATIONS.md", "KNOWN-LIMITATIONS.md"],
    ["PLAYTEST.md", "PLAYTEST.md"],
  ])
    await cp(resolve(root, "docs", from), join(stage, to));
  // Conservative production workspace license inventory, including optional pilot deps.
  const licenses = JSON.parse(
    execFileSync(
      process.execPath,
      [pnpm, "licenses", "list", "--prod", "--json"],
      { cwd: root, encoding: "utf8" },
    ),
  );
  const notices = [];
  for (const pkg of Object.values(licenses)
    .flat()
    .sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const texts = [];
    for (const name of (await readdir(pkg.paths[0])).sort()) {
      if (
        /^(licen[cs]e|copying|notice)(\.|$)/i.test(name) &&
        (await lstat(join(pkg.paths[0], name))).isFile()
      )
        texts.push(
          `${name}\n${await readFile(join(pkg.paths[0], name), "utf8")}`,
        );
    }
    notices.push(
      `${pkg.name} ${pkg.versions.join(", ")} (${pkg.license})\n${pkg.homepage ?? ""}\n${texts.length ? texts.join("\n\n") : "No license text shipped in the installed package; license identifier above comes from package metadata."}`,
    );
  }
  await writeFile(
    join(stage, "THIRD-PARTY-NOTICES.txt"),
    notices.join("\n\n--------------------\n\n"),
  );
  const source = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  const dirty = !!execFileSync(
    "git",
    ["status", "--porcelain", "--untracked-files=normal"],
    { cwd: root, encoding: "utf8" },
  ).trim();
  await writeFile(
    join(stage, "manifest.json"),
    `${JSON.stringify({ version, source, dirty, node: process.versions.node, files: await inventory(stage) }, null, 2)}\n`,
  );
  await rm(output, { recursive: true, force: true });
  await rename(stage, output);
  console.log(
    `Demo packaged: ${output}\nCopy this entire folder; no node_modules or cooperative server required.`,
  );
  return output;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  packageDemo().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
