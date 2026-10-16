# Project Spark

Browser-first educational 3D engineering adventure. M0 is a static technical scene, not playable gameplay. No accounts, telemetry, backend or external assets.

## Run

Use Node.js 24 LTS and pnpm 11.25.0 on Windows, macOS or Linux.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:5173. WebGL 2 and hardware acceleration are required for rendering. The UI displays a clear error if unavailable. Choose English or Lithuanian in the header; selection is session-only.

## Validate

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium firefox
pnpm test:e2e
```

Linux CI uses `pnpm exec playwright install --with-deps chromium firefox`. Browser tests use the production preview at port 4173. `pnpm format` applies formatting. See docs/ARCHITECTURE.md, docs/GDD.md and docs/ROADMAP.md.
