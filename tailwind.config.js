/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
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
        canvas: "hsl(var(--canvas))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          border: "hsl(var(--surface-border))",
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
        // Report tokens — used only by the campaign Reports page.
        report: {
          "green-deep": "hsl(var(--report-green-deep))",
          green: "hsl(var(--report-green))",
          "green-mid": "hsl(var(--report-green-mid))",
          "green-bar": "hsl(var(--report-green-bar))",
          "green-badge": "hsl(var(--report-green-badge))",
          "green-tint": "hsl(var(--report-green-tint))",
          "green-border": "hsl(var(--report-green-border))",
          red: "hsl(var(--report-red))",
          amber: "hsl(var(--report-amber))",
          track: "hsl(var(--report-track))",
          link: "hsl(var(--report-link))",
          "blue-bg": "hsl(var(--report-blue-bg))",
          "blue-border": "hsl(var(--report-blue-border))",
          "blue-fg": "hsl(var(--report-blue-fg))",
          "purple-bg": "hsl(var(--report-purple-bg))",
          "purple-border": "hsl(var(--report-purple-border))",
          "purple-fg": "hsl(var(--report-purple-fg))",
          "conclusion-bg": "hsl(var(--report-conclusion-bg))",
          brand: "hsl(var(--report-brand))",
          "brand-fg": "hsl(var(--report-brand-fg))",
          "brand-tint": "hsl(var(--report-brand-tint))",
          "ctrl-bg": "hsl(var(--report-ctrl-bg))",
          "ctrl-border": "hsl(var(--report-ctrl-border))",
          "ctrl-fg": "hsl(var(--report-ctrl-fg))",
          "v1-bg": "hsl(var(--report-v1-bg))",
          "v1-border": "hsl(var(--report-v1-border))",
          "v1-fg": "hsl(var(--report-v1-fg))",
          "v2-bg": "hsl(var(--report-v2-bg))",
          "v2-border": "hsl(var(--report-v2-border))",
          "v2-fg": "hsl(var(--report-v2-fg))",
          "prob-fill": "hsl(var(--report-prob-fill))",
          "info-bg": "hsl(var(--report-info-bg))",
          threshold: "hsl(var(--report-threshold))",
        },
        // shadcn destructive tokens — used only by shadcn/ui components.
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 150ms ease-out",
        "fade-in-up": "fade-in-up 200ms ease-out",
        "scale-in": "scale-in 150ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
