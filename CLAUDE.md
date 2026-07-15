# Wingify Shell — invariants

## Stack
Vite + React 18 + TS, Tailwind 3.4, Zustand (persist), Radix, React Router 6, Lucide.

## Rules
- ALL nav derives from src/config/navigation.ts. Never hardcode nav items elsewhere.
- GRAYSCALE ONLY via CSS-var tokens. No hex, no gray-XXX, no semantic colors.
- No page bodies. PlaceholderPage renders H1 only (+ TEMP detail link).
- Only the 9 product items are pinnable (see PINNABLE_PATHS).
- Spacing: modern, generous, low-density.

## Terminology
- main-nav item / section / sub-nav item / direct item (= main-nav item with no sections)
- "Docked" = persistent sub-nav panel. "Pinned" = shown in rail vs. hidden in More overflow.

## Working style
- Only read the files named in the prompt. Do not explore.
- Do not run builds or installs unless asked. Typecheck ONCE at the end.
- Report changed files only. No summaries of the code you wrote.
