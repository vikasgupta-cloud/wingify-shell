# Wingify Shell — invariants

## Stack
Vite + React 18 + TS, Tailwind 3.4, Zustand (persist), Radix, React Router 6, Lucide.

## Rules
- ALL nav derives from src/config/navigation.ts. Never hardcode nav items elsewhere.
- Grayscale via CSS-var tokens everywhere. No hex, no gray-XXX in components.
  EXCEPTION: status badges and vitals use the semantic status tokens in index.css.
  Buttons, CTAs, chrome, and all other surfaces stay neutral — no color.
- Pages not yet built render via PlaceholderPage (H1 only). Real pages live in src/pages/
  and are wired through the page registry in src/routes/index.tsx.
- Only the 9 product items are pinnable (see PINNABLE_PATHS).
- Spacing: modern, generous, low-density.
- Everything is client-side over dummy data. No server, no API calls.
- Use shadcn/ui components from @/components/ui for ALL new UI (Button, Input, Select, Card, etc). Do not hand-write Tailwind for anything a shadcn component covers.
- Never run `npx shadcn init` — components.json exists. Add components with `npx shadcn@latest add <name> -y`.
- shadcn's Button variants map to our design language: default = primary filled black, secondary = grey filled, outline / ghost / destructive as named.
- Custom tokens (rail, panel, status-*, vitals-*, decision-*, success-fg, danger-fg) live in index.css and must never be overwritten by tooling.

## Terminology
- main-nav item / section / sub-nav item / direct item (= main-nav item with no sections)
- "Docked" = persistent sub-nav panel. "Pinned" = shown in rail vs. hidden in More overflow.

## Working style
- Only read the files named in the prompt. Do not explore.
- Do not run builds or installs unless asked. Typecheck ONCE at the end.
- Report changed files only. No summaries of the code you wrote.
