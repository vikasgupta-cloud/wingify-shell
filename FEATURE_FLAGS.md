# Feature flags

Flags live in [`src/config/featureFlags.ts`](src/config/featureFlags.ts).

Flip a flag by setting its value to `true` or `false`, then refresh the app.

## Flags

| Flag | Default | What it controls |
| --- | --- | --- |
| `savedFilters` | `off` | Reports → Results **Saved filter** bar (chips, Save / Discard, rearrange). Store/API code stays; only the UI is gated. |

## Turn saved filters on

In `src/config/featureFlags.ts`:

```ts
savedFilters: true,
```

## Turn saved filters off

```ts
savedFilters: false,
```

## Asking the agent later

Say something like: **“turn on the saved filters feature flag”** (or “enable saved filters”). The agent should set `savedFilters: true` in `src/config/featureFlags.ts`.
