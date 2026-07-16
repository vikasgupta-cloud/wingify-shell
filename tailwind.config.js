/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        rail: {
          DEFAULT: "hsl(var(--rail))",
          foreground: "hsl(var(--rail-foreground))",
          active: "hsl(var(--rail-active))",
          "active-foreground": "hsl(var(--rail-active-foreground))",
        },
        panel: {
          DEFAULT: "hsl(var(--panel))",
          foreground: "hsl(var(--panel-foreground))",
          border: "hsl(var(--panel-border))",
        },
        // Semantic status tokens — used only by StatusBadge / VitalsIcon.
        status: {
          draft: { bg: "hsl(var(--status-draft-bg))", fg: "hsl(var(--status-draft-fg))" },
          qa: { bg: "hsl(var(--status-qa-bg))", fg: "hsl(var(--status-qa-fg))" },
          ready: { bg: "hsl(var(--status-ready-bg))", fg: "hsl(var(--status-ready-fg))" },
          running: { bg: "hsl(var(--status-running-bg))", fg: "hsl(var(--status-running-fg))" },
          analysis: { bg: "hsl(var(--status-analysis-bg))", fg: "hsl(var(--status-analysis-fg))" },
          paused: { bg: "hsl(var(--status-paused-bg))", fg: "hsl(var(--status-paused-fg))" },
          ended: { bg: "hsl(var(--status-ended-bg))", fg: "hsl(var(--status-ended-fg))" },
        },
        vitals: {
          healthy: "hsl(var(--vitals-healthy))",
          unhealthy: "hsl(var(--vitals-unhealthy))",
        },
        // Decision tokens — used only by DecisionIcon.
        decision: {
          "winner-fg": "hsl(var(--decision-winner-fg))",
          "baseline-fg": "hsl(var(--decision-baseline-fg))",
        },
        // Result tokens — used only for uplift values and the confidence bar.
        "success-fg": "hsl(var(--success-fg))",
        "danger-fg": "hsl(var(--danger-fg))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
