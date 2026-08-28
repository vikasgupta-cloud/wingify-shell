/** Brand experiment fonts — assignable to typography roles. */

export const FONT_IDS = ["lyon", "dm-sans"] as const;
export type FontId = (typeof FONT_IDS)[number];

export const FONT_ROLES = [
  "title",
  "body",
  "number",
  "cta",
  "mainMenu",
  "subMenu",
] as const;
export type FontRole = (typeof FONT_ROLES)[number];

export type FontOption = {
  id: FontId;
  label: string;
  /** CSS font-family stack (quoted family first). */
  stack: string;
  sample: string;
};

export type FontRoleOption = {
  id: FontRole;
  label: string;
  description: string;
  preview: string;
};

export const FONTS: FontOption[] = [
  {
    id: "lyon",
    label: "Lyon",
    stack: '"Lyon Display", Georgia, "Times New Roman", serif',
    sample: "Lyon",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    stack: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    sample: "DM Sans",
  },
];

export const FONT_ROLE_OPTIONS: FontRoleOption[] = [
  {
    id: "title",
    label: "Title",
    description: "Page titles and headings",
    preview: "Web Experimentation",
  },
  {
    id: "body",
    label: "Body",
    description: "Default UI copy",
    preview: "Search campaigns and filters",
  },
  {
    id: "number",
    label: "Number",
    description: "Every digit app-wide (metrics, dates, counts)",
    preview: "12,480 · 48.2%",
  },
  {
    id: "cta",
    label: "CTA text",
    description: "Primary button labels",
    preview: "Create campaign",
  },
  {
    id: "mainMenu",
    label: "Main menu",
    description: "Product rail / sidebar labels",
    preview: "Testing · Insights · Pulse",
  },
  {
    id: "subMenu",
    label: "Sub menu",
    description: "Test creation flow steps",
    preview: "Variations · Metrics · Targeting",
  },
];

export const DEFAULT_FONT_ASSIGNMENTS: Record<FontRole, FontId> = {
  title: "dm-sans",
  body: "dm-sans",
  number: "dm-sans",
  cta: "dm-sans",
  mainMenu: "dm-sans",
  subMenu: "dm-sans",
};

const FONT_BY_ID: Record<FontId, FontOption> = Object.fromEntries(
  FONTS.map((f) => [f.id, f])
) as Record<FontId, FontOption>;

const ROLE_CSS_VAR: Record<FontRole, string> = {
  title: "--font-title",
  body: "--font-body",
  number: "--font-number",
  cta: "--font-cta",
  mainMenu: "--font-main-menu",
  subMenu: "--font-sub-menu",
};

export function isFontId(value: unknown): value is FontId {
  return (
    typeof value === "string" &&
    (FONT_IDS as readonly string[]).includes(value)
  );
}

export function isFontRole(value: unknown): value is FontRole {
  return (
    typeof value === "string" &&
    (FONT_ROLES as readonly string[]).includes(value)
  );
}

export function resolveFontId(value: unknown, fallback: FontId): FontId {
  if (value === "ergon") return "dm-sans";
  return isFontId(value) ? value : fallback;
}

export function resolveFontAssignments(
  value: unknown
): Record<FontRole, FontId> {
  const next = { ...DEFAULT_FONT_ASSIGNMENTS };
  if (!value || typeof value !== "object") return next;
  const raw = value as Partial<Record<FontRole, unknown>>;
  for (const role of FONT_ROLES) {
    next[role] = resolveFontId(raw[role], DEFAULT_FONT_ASSIGNMENTS[role]);
  }
  return next;
}

export function fontStack(id: FontId): string {
  return FONT_BY_ID[id].stack;
}

/** Digits-only face names (unicode-range) — first in every role stack. */
const DIGIT_FACE: Record<FontId, string> = {
  lyon: '"Wingify Digits Lyon"',
  "dm-sans": '"Wingify Digits DM Sans"',
};

/** Write role → family CSS vars on <html>. */
export function applyFonts(assignments: Record<FontRole, FontId>) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const role of FONT_ROLES) {
    root.style.setProperty(ROLE_CSS_VAR[role], fontStack(assignments[role]));
  }
  // Digits app-wide use the Number role face; letters keep their role stack.
  root.style.setProperty(
    "--font-number-digits",
    DIGIT_FACE[assignments.number]
  );
  // Drive weight bumps (e.g. DM Sans CTA reads one step heavier).
  root.setAttribute("data-font-cta", assignments.cta);
}

export function readStoredFonts(): Record<FontRole, FontId> {
  if (typeof localStorage === "undefined") {
    return { ...DEFAULT_FONT_ASSIGNMENTS };
  }
  try {
    const raw = localStorage.getItem("wingify-fonts");
    if (!raw) return { ...DEFAULT_FONT_ASSIGNMENTS };
    const parsed = JSON.parse(raw) as {
      state?: { assignments?: unknown };
    };
    return resolveFontAssignments(parsed?.state?.assignments);
  } catch {
    return { ...DEFAULT_FONT_ASSIGNMENTS };
  }
}
