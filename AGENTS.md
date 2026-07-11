# AGENTS.md

## What This Is

Tauri v2 desktop app — "Lumina Velocity" bulk email management tool. React + TypeScript frontend, Rust backend. Currently greenfield: only `UI/` design assets exist.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS, React Router, Zustand, TanStack Query, React Hook Form, Zod
- **Backend:** Rust, Tauri v2, SQLx (SQLite), lettre (SMTP), Handlebars, csv, calamine
- **Design:** Dark glassmorphism. Sora (headlines) + Inter (body). Material Symbols Outlined icons.

## Design Source of Truth

`UI/lumina_velocity/DESIGN.md` — full color palette, typography, spacing, component specs.

`UI/*/code.html` — pixel-perfect HTML mockups to convert to React:
- `g_sender_dashboard` → Dashboard
- `advanced_email_composer` → Compose
- `recipient_management` → Recipients
- `campaign_overview` → Campaigns

Match these exactly. Do not redesign.

## Reference Repo

`pamod-madubashana/nuexa-dashboard` — structural patterns (component layout, CSS variable approach, sidebar/topbar architecture). Use as guide, not copy.

## Git Rules (CRITICAL)

- **Never push to main.** All work on feature branches.
- **Branch naming:** `feat/phase-{N}-{description}`
- **After all phases:** merge branches into `feat/tauri-v2-setup` → PR to main → merge → delete all feature branches → `git pull origin main`

## Key Commands

```bash
# Frontend dev
npm run dev          # Vite dev server
npm run build        # Production build
npm run lint         # ESLint

# Tauri
npx tauri dev        # Run desktop app in dev mode
npx tauri build      # Build desktop installer

# Rust (from src-tauri/)
cargo check          # Type check
cargo build          # Build binary
cargo clippy         # Lint
```

## Project Structure (Target)

```
src/                  # React frontend
  components/ui/      # Reusable UI (glass-card, button, badge, etc.)
  layout/             # sidebar, topbar, app-layout
  pages/              # dashboard, compose, recipients, campaigns, templates, reports, settings, smtp
  stores/             # Zustand stores (smtp, campaign, recipient, template, settings, queue, sending)
  routes/             # React Router config
  types/              # TypeScript types
src-tauri/            # Rust backend
  src/commands/       # Tauri command handlers
  src/database/       # SQLx migrations + connection
  src/models/         # Data models
```

## Implementation Phases

See `.mimocode/plans/1783755958480-silent-nebula.md` for full breakdown. Seven branches total, merged at the end.

## Tools

### graphify

Use `/graphify` to analyze codebase architecture. Creates a knowledge graph from code files with community detection.

```bash
/graphify .                    # Analyze current directory
/graphify query "question"     # Query the graph
/graphify path "A" "B"         # Find path between concepts
/graphify explain "Concept"    # Explain a node
```

After initial run, use `graphify-out/graph.json` for queries. Re-run with `--update` for incremental changes.

### RTK (Rust Token Killer)

CLI proxy that filters command output to save tokens (60-90% savings). Use transparently via hooks — all commands are automatically rewritten.

```bash
rtk gain              # Show token savings
rtk gain --history    # Show usage history
rtk discover          # Analyze for missed opportunities
```

## Gotchas

- Tailwind config must include the full Lumina Velocity color palette (50+ colors) from DESIGN.md
- Glass effects need `backdrop-filter: blur()` + custom `.glass-card` class — not built into Tailwind
- Material Symbols require Google Fonts link in `index.html`, not an npm package
- Tauri v2 uses `@tauri-apps/api` v2 — commands are invoked via `import { invoke } from '@tauri-apps/api/core'`
- Rust side: register commands in `main.rs` with `tauri::Builder::default().invoke_handler(tauri::generate_handler![...])`
