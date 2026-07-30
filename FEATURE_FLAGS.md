# Feature flags

Flags live in [`src/config/featureFlags.json`](src/config/featureFlags.json).

Each flag is `"on"` or `"off"`. Flip a value, then refresh the app.

```json
{
  "savedFiltersClassic": "off",
  "savedFiltersQuiet": "off"
}
```

## Flags

| Flag | Default | What it controls |
| --- | --- | --- |
| `savedFiltersClassic` | `off` | Reports → Results **classic** saved filters (chips, dirty Save / Discard, hover ⋯ rename/delete). |
| `savedFiltersQuiet` | `off` | Reports → Results **quiet** saved filters (subtle title + ⋯ for Save / Switch / Rename / Delete; no dirty prompts). |

If both are `"on"`, the quiet experience is shown.

Store/API code for saved filters stays either way — only the UI is gated.

## Examples

Classic chips on:

```json
"savedFiltersClassic": "on",
"savedFiltersQuiet": "off"
```

Quiet title + ⋯ on:

```json
"savedFiltersClassic": "off",
"savedFiltersQuiet": "on"
```

Both off (default):

```json
"savedFiltersClassic": "off",
"savedFiltersQuiet": "off"
```

## Asking the agent later

Say something like: **“turn on the quiet saved filters feature flag”** or **“enable classic saved filters”**. The agent should set the matching key to `"on"` in `src/config/featureFlags.json`.
