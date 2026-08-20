import {
  buildDesignTokenExport,
  snapshotRoles,
  type DesignTokenExport,
} from "./exportDesignTokens";
import type { ColorMode, ThemeId } from "./themes";
import type { FontId, FontRole } from "./fonts";
import { FONTS } from "./fonts";

export type EmailerComponentId =
  | "canvas"
  | "container"
  | "preheader"
  | "header"
  | "wordmark"
  | "kicker"
  | "heading"
  | "body"
  | "primaryCta"
  | "secondaryCta"
  | "link"
  | "divider"
  | "metricCard"
  | "metricValue"
  | "metricLabel"
  | "statusChip"
  | "alertBanner"
  | "dataTable"
  | "footer"
  | "unsubscribe";

export type EmailerComponentSpec = {
  id: EmailerComponentId;
  name: string;
  role: string;
  tokens: string[];
  rules: string[];
};

export const EMAILER_COMPONENTS: EmailerComponentSpec[] = [
  {
    id: "canvas",
    name: "Canvas",
    role: "Full-bleed page behind the email card",
    tokens: ["--canvas", "--background"],
    rules: [
      "Use canvas for the outer table background, never a raw hex.",
      "450px wide email, centered. Vertical stack: logo → body card → footer. Side padding 32px.",
    ],
  },
  {
    id: "container",
    name: "Container",
    role: "450px content card",
    tokens: ["--card", "--card-foreground", "--border", "--radius"],
    rules: [
      "Body card sits below the logo. Background --card, radius 8px, no header bar.",
      "Inner padding 40px 40px 36px. Title, details table, one CTA, then sign-off.",
    ],
  },
  {
    id: "preheader",
    name: "Preheader",
    role: "Hidden inbox preview line",
    tokens: ["--muted-foreground"],
    rules: [
      "First text in the HTML. Hidden with display:none / max-height:0 / overflow:hidden.",
      "Keep under 90 characters. Do not show in the visible layout.",
    ],
  },
  {
    id: "header",
    name: "Header",
    role: "Top bar of the card",
    tokens: ["--card", "--border", "--muted-foreground"],
    rules: [
      "There is no in-card header. The Wingify logo lives above the card, centered on the canvas.",
    ],
  },
  {
    id: "wordmark",
    name: "Wordmark",
    role: "Product logo lockup",
    tokens: ["logo.light", "logo.dark"],
    rules: [
      "Centered lockup above the body card: mascot + the word ‘Wingify’.",
      "Mark: src/assets/wingify-logo.png (light) / src/assets/mascots/dark/default.png (dark), height 32px.",
      "Word: title font, 22px, weight 700, --foreground. 10px gap. Alt on the lockup is Wingify.",
    ],
  },
  {
    id: "kicker",
    name: "Kicker",
    role: "Small label above the heading",
    tokens: ["--muted-foreground", "fonts.body"],
    rules: [
      "11px, uppercase, tracking 0.08em, muted-foreground.",
      "Examples: Campaign · Digest · Security · Billing.",
    ],
  },
  {
    id: "heading",
    name: "Heading",
    role: "H1 of the email",
    tokens: ["--foreground", "fonts.title"],
    rules: [
      "24px / 32px, weight 700, title font, foreground. Left-aligned. 8px below before the details table.",
      "Example: Campaign status changed.",
    ],
  },
  {
    id: "body",
    name: "Body copy",
    role: "Primary reading text",
    tokens: ["--foreground", "--muted-foreground", "fonts.body"],
    rules: [
      "15px / 24px body font. Primary sentences use foreground; supporting lines use muted-foreground.",
      "Max width of the container. No justified text.",
    ],
  },
  {
    id: "primaryCta",
    name: "Primary CTA",
    role: "Filled action button",
    tokens: [
      "--primary",
      "--primary-foreground",
      "--primary-hover",
      "--radius",
      "fonts.cta",
    ],
    rules: [
      "Bulletproof table button. Background --primary, text --primary-foreground, cta font, 14px, weight 600.",
      "Padding 14px 28px. Border-radius 8px. One primary CTA, left-aligned under the details table.",
      "Href must be a full https URL. 28px above, 32px below before the sign-off.",
    ],
  },
  {
    id: "secondaryCta",
    name: "Secondary CTA",
    role: "Outline or text action",
    tokens: ["--border", "--foreground", "--secondary", "fonts.cta"],
    rules: [
      "Outline: 1px --border, transparent or --secondary fill, foreground text.",
      "Use for ‘View report’ when the primary is ‘Open campaign’. Never two filled buttons.",
    ],
  },
  {
    id: "link",
    name: "Inline link",
    role: "Text hyperlink",
    tokens: ["--link", "--link-hover"],
    rules: [
      "Color --link, underline. Hover --link-hover where clients support it.",
      "Footer and unsubscribe also use this, 12px.",
    ],
  },
  {
    id: "divider",
    name: "Divider",
    role: "Horizontal rule",
    tokens: ["--border"],
    rules: ["1px solid --border, 32px vertical margin, full container width minus padding."],
  },
  {
    id: "metricCard",
    name: "Metric card",
    role: "Stat tile in a 2–3 column row",
    tokens: ["--muted", "--border", "--foreground", "--muted-foreground"],
    rules: [
      "Background --muted, 1px --border, radius --radius, padding 16px.",
      "Stack: label then value. Equal-width cells. No chart images required.",
    ],
  },
  {
    id: "metricValue",
    name: "Metric value",
    role: "Numeric figure",
    tokens: ["--foreground", "fonts.number"],
    rules: [
      "22px, weight 600, number font, tabular figures.",
      "Winner / lift may use --success-fg. Baseline / drop may use --danger-fg. Nothing else is colored.",
    ],
  },
  {
    id: "metricLabel",
    name: "Metric label",
    role: "Caption under or above a value",
    tokens: ["--muted-foreground", "fonts.body"],
    rules: ["11px uppercase tracking 0.06em, muted-foreground."],
  },
  {
    id: "statusChip",
    name: "Status chip",
    role: "Campaign or health pill",
    tokens: [
      "--success-bg",
      "--success-fg",
      "--danger-bg",
      "--danger-fg",
      "--warning-bg",
      "--warning-fg",
      "--info-bg",
      "--info-fg",
    ],
    rules: [
      "Pill, 11px, weight 500, padding 4px 10px, full radius.",
      "Only semantic pairs: success, danger, warning, info. No custom hues.",
    ],
  },
  {
    id: "alertBanner",
    name: "Alert banner",
    role: "Inline notice strip",
    tokens: [
      "--success-bg",
      "--success-fg",
      "--danger-bg",
      "--danger-fg",
      "--warning-bg",
      "--warning-fg",
      "--info-bg",
      "--info-fg",
      "--border",
    ],
    rules: [
      "Full-width inside the container. 12px 16px padding. Matching semantic bg + fg.",
      "Use for quota, security, and winner notices — not for marketing hero.",
    ],
  },
  {
    id: "dataTable",
    name: "Details table",
    role: "Label / value rows inside the body card",
    tokens: ["--border", "--foreground", "--muted-foreground", "fonts.body"],
    rules: [
      "1px --border, 8px radius, padding 20px 24px. Two columns: 148px muted label, bold value.",
      "Row gap 16px. Status values use status chips, not colored text.",
    ],
  },
  {
    id: "footer",
    name: "Footer",
    role: "Social + legal under the card",
    tokens: ["--card", "--muted-foreground", "--border", "--link", "fonts.body"],
    rules: [
      "Centered. Four 40px circular social buttons (LinkedIn, X, Instagram, YouTube) using --card fill and --muted-foreground icons.",
      "Then a 120px --border rule, then underlined Blog | Privacy links, then 12px address: 11th Floor, KJ Tower, Netaji Subhash Place  Delhi 110034, India.",
      "32px gap above socials. Sign-off inside the card is ‘Happy Optimizing’ / ‘VWO Team’, not in the footer.",
    ],
  },
  {
    id: "unsubscribe",
    name: "Unsubscribe",
    role: "Preference + unsubscribe links",
    tokens: ["--link"],
    rules: [
      "Footer uses Blog and Privacy, not unsubscribe, matching the product mail template.",
    ],
  },
];

export type EmailerTokenPack = {
  exportedAt: string;
  product: "Wingify";
  usage: "emailer";
  themeId: ThemeId;
  colorMode: ColorMode;
  ctaTokenId: string | null;
  backgroundTokenId: string | null;
  headerTokenId: string | null;
  fonts: Record<string, { id: FontId; stack: string; cssVar: string }>;
  radius: string;
  roles: Record<string, string>;
  cta: {
    background: string;
    text: string;
    hoverBackground: string;
  };
  semantic: {
    success: { bg: string; fg: string };
    danger: { bg: string; fg: string };
    warning: { bg: string; fg: string };
    info: { bg: string; fg: string };
  };
  layout: {
    containerWidthPx: number;
    containerPadding: string;
    canvasPadding: string;
    buttonPadding: string;
    headingSize: string;
    bodySize: string;
    kickerSize: string;
    footerSize: string;
  };
  components: EmailerComponentSpec[];
  templates: string[];
  design: DesignTokenExport;
};

type PackOptions = {
  themeId: ThemeId;
  colorMode: ColorMode;
  ctaTokenId: string | null;
  backgroundTokenId?: string | null;
  headerTokenId?: string | null;
  fontAssignments: Record<FontRole, FontId>;
};

function fontMeta(
  assignments: Record<FontRole, FontId>
): EmailerTokenPack["fonts"] {
  const cssVar: Record<FontRole, string> = {
    title: "--font-title",
    body: "--font-body",
    number: "--font-number",
    cta: "--font-cta",
    mainMenu: "--font-main-menu",
    subMenu: "--font-sub-menu",
  };
  const out = {} as EmailerTokenPack["fonts"];
  for (const role of Object.keys(cssVar) as FontRole[]) {
    const id = assignments[role];
    const font = FONTS.find((f) => f.id === id);
    out[role] = { id, stack: font?.stack ?? id, cssVar: cssVar[role] };
  }
  return out;
}

/** Current-mode snapshot for live previews — does not flip light/dark. */
export function snapshotEmailerAppearance(
  assignments: Record<FontRole, FontId>
): Pick<EmailerTokenPack, "fonts" | "radius" | "roles" | "cta" | "semantic"> {
  const roles = snapshotRoles();
  return {
    fonts: fontMeta(assignments),
    radius: roles["--radius"] ?? "0.625rem",
    roles,
    cta: {
      background: roles["--primary"],
      text: roles["--primary-foreground"],
      hoverBackground: roles["--primary-hover"],
    },
    semantic: {
      success: { bg: roles["--success-bg"], fg: roles["--success-fg"] },
      danger: { bg: roles["--danger-bg"], fg: roles["--danger-fg"] },
      warning: { bg: roles["--warning-bg"], fg: roles["--warning-fg"] },
      info: { bg: roles["--info-bg"], fg: roles["--info-fg"] },
    },
  };
}

export function buildEmailerTokenPack(options: PackOptions): EmailerTokenPack {
  const design = buildDesignTokenExport(options);
  const live = snapshotEmailerAppearance(options.fontAssignments);
  return {
    exportedAt: new Date().toISOString(),
    product: "Wingify",
    usage: "emailer",
    themeId: options.themeId,
    colorMode: options.colorMode,
    ctaTokenId: options.ctaTokenId,
    backgroundTokenId: options.backgroundTokenId ?? null,
    headerTokenId: options.headerTokenId ?? null,
    ...live,
    layout: {
      containerWidthPx: 450,
      containerPadding: "40px 40px 36px",
      canvasPadding: "40px 32px 48px",
      buttonPadding: "14px 28px",
      headingSize: "24px / 32px",
      bodySize: "15px / 24px",
      kickerSize: "11px / 16px",
      footerSize: "12px / 18px",
    },
    components: EMAILER_COMPONENTS,
    templates: [
      "campaign-status-changed",
      "campaign-status-changed-alt",
      "new-user-added",
      "user-deleted",
      "user-role-changed",
      "welcome-smartcode",
      "smartcode-active",
      "trial-ending",
      "variation-not-better",
      "winner-lift",
      "winner-best-choice",
      "stick-to-baseline",
      "low-traffic",
      "short-duration",
      "no-data",
      "weekly-digest",
      "teammate-invite",
      "quota-warning",
      "password-reset",
    ],
    design,
  };
}

export function buildEmailerClaudePrompt(pack: EmailerTokenPack): string {
  const componentBlock = EMAILER_COMPONENTS.map(
    (c) =>
      `### ${c.name} (\`${c.id}\`)\n${c.role}\nTokens: ${c.tokens.join(", ")}\n${c.rules.map((r) => `- ${r}`).join("\n")}`
  ).join("\n\n");

  return `# Wingify emailer restyle — Claude prompt

You are restyling transactional SaaS emails for Wingify (experimentation / personalization platform). Apply this token pack exactly. Do not invent colors, radii, or typefaces.

## How to use
1. Paste this file into Claude with the current HTML (or ask Claude to rebuild from the component list).
2. Keep structure: canvas → centered Wingify logo → body card (title, details table, CTA, Happy Optimizing / VWO Team) → footer (socials, Blog | Privacy, address).
3. Output table-based HTML with **inline CSS** (email clients). Webfonts from the stacks below; fall back to sans-serif.
4. Chrome, buttons, and surfaces stay on role tokens. Semantic color is only for status chips. Use the Wingify mascot PNG for the logo (light/dark pair).

## Active appearance
- Theme: ${pack.themeId}
- Color mode: ${pack.colorMode}
- CTA token: ${pack.ctaTokenId ?? "theme default"}
- Background token: ${pack.backgroundTokenId ?? "theme default"}
- Header token: ${pack.headerTokenId ?? "theme default"}
- Exported: ${pack.exportedAt}

## Fonts
${Object.entries(pack.fonts)
    .map(([role, f]) => `- ${role}: ${f.id} → ${f.stack} (${f.cssVar})`)
    .join("\n")}

## Layout
- Container width: ${pack.layout.containerWidthPx}px
- Container padding: ${pack.layout.containerPadding}
- Canvas padding: ${pack.layout.canvasPadding}
- Button padding: ${pack.layout.buttonPadding}
- Heading: ${pack.layout.headingSize} (${pack.fonts.title.id})
- Body: ${pack.layout.bodySize} (${pack.fonts.body.id})
- Kicker: ${pack.layout.kickerSize}
- Footer: ${pack.layout.footerSize}
- Radius: ${pack.radius}

## CTA
- Background: ${pack.cta.background}
- Text: ${pack.cta.text}
- Hover background: ${pack.cta.hoverBackground}

## Semantic pairs (status / alerts / winner only)
- Success: bg ${pack.semantic.success.bg} / fg ${pack.semantic.success.fg}
- Danger: bg ${pack.semantic.danger.bg} / fg ${pack.semantic.danger.fg}
- Warning: bg ${pack.semantic.warning.bg} / fg ${pack.semantic.warning.fg}
- Info: bg ${pack.semantic.info.bg} / fg ${pack.semantic.info.fg}

## Resolved role colors (current mode)
${Object.entries(pack.roles)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")}

## Emailer components
${componentBlock}

## Templates to cover
${pack.templates.map((id) => `- ${id}`).join("\n")}

Each template must include: preheader, centered Wingify logo, body card with heading + details table + one primary CTA + sign-off, then the social/legal footer.

## Do not
- Invent a different layout. Logo, body card, footer — in that order.
- Introduce hex colors for chrome or CTAs that are not in this pack.
- Use more than one filled primary CTA.
- Ship images for buttons (use bulletproof tables).
`;
}

function triggerDownload(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadEmailerHtml(options: {
  slug: string;
  title: string;
  markup: string;
}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;">
${options.markup}
</body>
</html>
`;
  triggerDownload(`wingify-emailer-${options.slug}.html`, html, "text/html;charset=utf-8");
}

export function downloadEmailerTokensJson(options: PackOptions) {
  const pack = buildEmailerTokenPack(options);
  triggerDownload(
    `wingify-emailer-tokens-${pack.themeId}-${pack.exportedAt.slice(0, 10)}.json`,
    `${JSON.stringify(pack, null, 2)}\n`,
    "application/json"
  );
}

export function downloadEmailerPrompt(options: PackOptions) {
  const pack = buildEmailerTokenPack(options);
  triggerDownload(
    `wingify-emailer-claude-prompt-${pack.themeId}-${pack.exportedAt.slice(0, 10)}.md`,
    buildEmailerClaudePrompt(pack),
    "text/markdown"
  );
}

export function copyEmailerPrompt(options: PackOptions): Promise<void> {
  const pack = buildEmailerTokenPack(options);
  return navigator.clipboard.writeText(buildEmailerClaudePrompt(pack));
}
