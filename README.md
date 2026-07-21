# Wingify Shell

Client-side prototype of the Wingify product shell — navigation, campaign workspace, config flows, and experiment reports — built for UI exploration over dummy data. There is no backend and no API layer.

## Stack

| Layer | Choice |
| --- | --- |
| App | Vite, React 19, TypeScript |
| Routing | React Router 6 |
| Styling | Tailwind 3.4, CSS-variable design tokens |
| UI | shadcn/ui (Radix), Lucide icons |
| State | Zustand (with persist where needed) |

## Quick start

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | Oxlint |

## What’s in scope

- **Shell** — primary rail, pinned items / More overflow, docked sub-nav, workspace switcher
- **Web Experimentation** — campaign list (table / kanban / gantt), filters, views, quick view
- **Campaign config** — guided sections (pages, variations, metrics, segments, integrations, …)
- **Reports** — overview, results (metrics, graphs, segments, custom views), experiment vitals

Other nav destinations that aren’t built yet render a simple placeholder page.

## Project layout

```
src/
  components/     # layout, table/kanban/gantt, shadcn ui, shared chrome
  config/         # navigation, columns, filters, entities (single source of truth)
  data/           # dummy campaigns, metrics, hypotheses, …
  pages/          # real screens (config, reports, web experimentation, …)
  routes/         # page registry
  store/          # Zustand stores
  assets/         # static assets (icons, …)
```

Navigation always comes from `src/config/navigation.ts`. Do not hardcode nav items elsewhere.

New routes: add a page under `src/pages/` and register it in `src/routes/index.tsx`.

## Design conventions

- **Tokens first** — use CSS variables (`bg-background`, `text-muted-foreground`, …). Avoid raw hex and Tailwind `gray-*` in components.
- **Neutral chrome** — buttons, panels, and surfaces stay grayscale. Status badges and vitals may use the semantic tokens in `src/index.css`.
- **shadcn/ui** — reuse `@/components/ui` for anything those primitives cover. Add missing pieces with:

  ```bash
  npx shadcn@latest add <name> -y
  ```

  Do not run `npx shadcn init` — `components.json` already exists. Custom tokens in `index.css` must not be overwritten by tooling.

- **Spacing** — generous, low-density layouts.

## Terminology

| Term | Meaning |
| --- | --- |
| Main-nav item | Top-level rail entry |
| Section / sub-nav item | Items inside a docked or flyout sub-nav |
| Direct item | Main-nav item with no sections |
| Docked | Persistent sub-nav panel |
| Pinned | Shown in the rail (vs. hidden under More) |

## Notes

- All data is local/dummy; refreshes reset anything that isn’t persisted in Zustand.
- Agent/contributor invariants for this repo also live in `CLAUDE.md`.
