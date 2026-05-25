# REASONIX.md — heya.skill

## Stack
- **Runtime:** Bun (`#!/usr/bin/env bun` on all scripts; `bun.lock`)
- **Language:** TypeScript (`noEmit: true`, `strict: true`, `bundler` moduleResolution)
- **Deps:** `uapi-sdk-typescript` (B站数据采集); `p-retry` (指数退避重试); `jieba-wasm` (中文分词)
- **Dev:** `@biomejs/biome` (lint + format, double quotes, auto-organize imports)
- **Website:** Astro (`website/` is a separate Bun project; deploys to GitHub Pages)

## Layout
- `SKILL.md` — generated output (Agent Skills standard); NEVER edit by hand
- `SKILL.example.md` — template with `<!-- AUTO_START/END:section -->` markers; edit THIS
- `scripts/` — pipeline entry points (`fetch-bilibili-titles.ts`, `analyze-titles.ts`, `update-skill.ts`, `pipeline.ts`)
- `scripts/lib/` — shared: types, utils, `uapi.ts` (UAPI client), `analysis/` (engine), `generate/` (SKILL.md sections)
- `references/research/` — `01-titles.json`, `02-style-analysis.{json,md}` (dual-format output)
- `.github/workflows/` — `update-reference.yml` (daily 20:30 UTC+8 CI), `deploy-website.yml` (on push to `website/`)
- `.reasonix/` — auto-generated semantic index (do not edit)
- `website/` — Astro landing page; linguist-vendored in `.gitattributes`

## Commands
```bash
bun pipeline              # fetch → analyze → SKILL.md
bun pipeline --skip-fetch # analyze + generate only
bun pipeline --skip-analyze
bun pipeline --dry-run
bun run scripts/fetch-bilibili-titles.ts
bun run scripts/analyze-titles.ts --top 30
bun run scripts/update-skill.ts
bun run lint                             # biome check scripts/
bun run format                           # biome check --write scripts/ website/src/
bun website:dev                          # Astro dev server
bun website:build
```

## Conventions
- All scripts are `.ts` with `#!/usr/bin/env bun` shebang
- `import.meta.dir` for directory resolution (Bun ESM native, won't work under plain Node)
- Node builtins use `node:` protocol (`node:fs`, `node:path`, `node:child_process`)
- Analysis output: `.json` + `.md` same basename in `references/research/`
- SKILL.md frontmatter follows Agent Skills spec (agentskills.io)
- Chinese word segmentation: `jieba-wasm` with `cut(text, true)` (HMM mode)

## Watch out for
- `.reasonix/` is auto-generated — never edit manually
- Edit `SKILL.example.md`, never `SKILL.md`; auto sections between `AUTO_START`/`AUTO_END` markers
- Pipeline uses UAPI (uapis.cn) free tier via `uapi-sdk-typescript` SDK — zero config, no cookies/keys
- `bun pipeline` runs scripts as child processes via `spawnSync`, expects project root as cwd
- `import.meta.dir` is Bun-only; scripts won't run under Node
- `jieba-wasm` is WASM — requires Bun's WASM support
- `website/` is a separate Bun project with its own `package.json` and `bun.lock`
- Astro `base` is `/heya.skill` (in `website/astro.config.mjs`) — must stay for GitHub Pages deploy
- `.env` is gitignored (`**/.env`); no secrets needed in normal operation
