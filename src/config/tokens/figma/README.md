# Wingify design tokens (Figma → CSS)

Source of truth: DTCG JSON in this folder.

| File | Role |
| --- | --- |
| `primitives.json` | Color ramps, radius/space/size primitives |
| `overlays.json` | Overlay / thermal stroke tokens |
| `component.json` | Component radius, space, size, stroke |
| `semantic.light.json` / `semantic.dark.json` | Mode semantic roles (`--semantic-*`) |
| `on-canvas.light.json` / `on-surface.light.json` | Context interaction levels |

## Generate

```bash
npm run tokens:generate
```

Writes `src/styles/tokens.generated.css` (imported from `src/index.css`).

## Rules

1. Emit every Figma token (primitives + semantic light/dark).
2. Color CSS values are **hex** (`#RRGGBB` / `#RRGGBBAA`), matching Figma — not HSL channels.
3. App/shadcn roles (`--background`, `--border`, `--muted`, …) resolve **only** to `var(--semantic-*)` (or a primitive when the pack names one).
4. Do **not** invent hairline values — use `--semantic-border-subtle` / `--semantic-border-strong` / `--semantic-border-focus`.
5. Light/dark is a swap of `--semantic-*` under `[data-mode]`, not a second inventing of app roles.
