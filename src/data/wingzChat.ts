// @summary Dummy chats + reply helpers for the Wingz full-page chat experience.
export type WingzChatRole = "user" | "assistant";

export type WingzChatTable = {
  caption?: string;
  columns: string[];
  rows: string[][];
};

export type WingzCampaignArtifact = {
  kind: "campaign";
  campaignId: string;
  name: string;
  status: string;
  url: string;
  createdOn: string;
  lastSurface: "editor" | "form";
};

/** File attached in main Wingz chat (client-side / session-only). */
export type WingzChatUpload = {
  id: string;
  name: string;
  size: number;
  type: string;
  addedAt: string;
  objectUrl?: string;
};

export type WingzChatMessage = {
  id: string;
  role: WingzChatRole;
  text: string;
  at: string;
  reasoning?: string;
  bullets?: { title: string; items: string[] };
  tables?: WingzChatTable[];
  takeaway?: string;
  suggestions?: string[];
  /** Card in main chat to reopen a campaign canvas session. */
  artifact?: WingzCampaignArtifact;
};

export type WingzSavedChat = {
  id: string;
  title: string;
  preview: string;
};

export type WingzTask = {
  id: string;
  title: string;
};

export const WINGZ_USER_FIRST_NAME = "Vikas";

export const WINGZ_EMPTY_SUBTITLE =
  "Ask about campaigns, recordings, heatmaps, and test ideas. All in one conversation.";

export const WINGZ_COMPOSER_PLACEHOLDER =
  "Ask anything, draft a campaign, or analyze your data…";

export const WINGZ_TIP =
  "Tip: Type @ to add an Agent — choose one to pull insights, run analyses, or ask follow-ups.";

export const WINGZ_CHAT_CTAS = [
  {
    id: "create",
    label: "Create a campaign",
    prompt: "Create a campaign",
  },
  {
    id: "analyze",
    label: "Analyze data",
    prompt:
      "Analyze my campaign and metric performance and highlight key insights.",
  },
  {
    id: "friction",
    label: "Identify friction",
    prompt: "Identify friction points in my funnels and conversion paths.",
  },
  {
    id: "ideas",
    label: "Get ideas",
    prompt: "Suggest A/B testing and usability ideas for my top pages.",
  },
  {
    id: "explore",
    label: "Explore",
    prompt: "Help me explore heatmaps and session recordings worth reviewing.",
  },
] as const;

export const WINGZ_TASKS: WingzTask[] = [
  { id: "t1", title: "test" },
];

export const WINGZ_RECENT_ACTIVITY = [
  { id: "ra1", title: "Campaign Summary" },
  { id: "ra2", title: "Campaign Summary" },
];

export const WINGZ_SAVED_CHATS: WingzSavedChat[] = [
  {
    id: "c1",
    title: "New A/B Test Setup",
    preview: "Help me set up a homepage CTA test…",
  },
  {
    id: "c2",
    title: "Heatmap Engagement Analysis",
    preview: "Where are users focusing on pricing?",
  },
  {
    id: "c3",
    title: "Help Center A/B Test Module",
    preview: "Draft variations for help-center search…",
  },
  {
    id: "c4",
    title: "Free Trial Funnel Drop-off",
    preview: "Summarise drop-off between step 1 and 2…",
  },
  {
    id: "c5",
    title: "Geo Segment Comparison",
    preview: "Compare US vs UK conversion…",
  },
];

function stamp(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** True when the user wants to create/edit a campaign or page content. */
export function isCampaignEditIntent(text: string): boolean {
  const t = text.toLowerCase();
  if (
    /\bcreate\s+(a\s+)?campaign\b/.test(t) ||
    /\bnew\s+campaign\b/.test(t) ||
    /\bstart\s+(an?\s+)?(a\/?b|ab|test|campaign)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(update|change|edit|modify|replace)\b/.test(t) &&
    /\b(page|headline|cta|button|text|component|copy|hero|banner|website|site)\b/.test(
      t
    )
  ) {
    return true;
  }
  return false;
}

/** Pull the first http(s) or www URL from free text. */
export function extractUrlFromText(text: string): string | null {
  const m =
    text.match(/https?:\/\/[^\s<>"']+/i) ||
    text.match(/\bwww\.[^\s<>"']+/i);
  if (!m) return null;
  let url = m[0].replace(/[.,;:!?)]+$/g, "");
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
}

/** Draft list name from the chat prompt + page URL. */
export function draftCampaignNameFromChat(prompt: string, url: string): string {
  const withoutUrl = prompt
    .replace(/https?:\/\/[^\s<>"']+/gi, "")
    .replace(/\bwww\.[^\s<>"']+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const stripped = withoutUrl
    .replace(/^(create\s+(a\s+)?campaign|new\s+campaign)\s*[:\-–]?\s*/i, "")
    .trim();
  if (stripped.length >= 6) {
    return stripped.length > 72 ? `${stripped.slice(0, 69)}…` : stripped;
  }
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return `Wingz draft – ${host}`;
  } catch {
    return "Wingz draft – new campaign";
  }
}

export function wingzAskForUrlMessage(): WingzChatMessage {
  return {
    id: `a-${Date.now()}`,
    role: "assistant",
    at: stamp(),
    text: "Happy to set that up. Which page URL should I open in the editor? Paste a full URL (for example https://www.example.com/pricing).",
    suggestions: [
      "https://www.example.com",
      "https://www.example.com/pricing",
    ],
  };
}

export function wingzCanvasOpenedMessage(name: string, url: string): WingzChatMessage {
  return {
    id: `a-${Date.now()}`,
    role: "assistant",
    at: stamp(),
    text: `Draft campaign “${name}” is ready in Web Experimentation (AB – Single Page). I’ve opened the visual editor with our campaign preview. Your page URL (${url}) is saved on the campaign — switch to Form anytime to edit config fields.`,
  };
}

export function wingzNeedUrlAgainMessage(): WingzChatMessage {
  return {
    id: `a-${Date.now()}`,
    role: "assistant",
    at: stamp(),
    text: "I still need a page URL to open the editor. Reply with something like https://www.example.com/home.",
  };
}

/** Scripted assistant reply — structured when the prompt looks like a campaign summary. */
export function wingzReplyFor(prompt: string): WingzChatMessage {
  const lower = prompt.toLowerCase();
  if (isCampaignEditIntent(prompt)) {
    return wingzAskForUrlMessage();
  }
  const wantsSummary =
    lower.includes("summar") ||
    (lower.includes("campaign") && !lower.includes("create")) ||
    lower.includes("compar") ||
    lower.includes("visitor");

  if (wantsSummary) {
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      at: stamp(),
      text: "Campaign 'Request Demo Modal Step 1 CTA Change' is currently paused. Here's a concise read of primary-goal performance and how new vs returning visitors compare.",
      reasoning:
        "Pulled latest primary-goal stats, variation split, and new vs returning segment totals from the campaign report.",
      bullets: {
        title: "Overall metrics",
        items: [
          "Total visitors: 12,480",
          "Total conversions: 642",
          "Overall conversion rate: 5.14%",
        ],
      },
      tables: [
        {
          caption: "Variation breakdown",
          columns: ["Variation", "Visitors", "Conversions", "Conversion Rate"],
          rows: [
            ["Control", "4,210", "198", "4.70%"],
            ["Schedule Demo", "4,150", "231", "5.57%"],
            ["Schedule Meeting", "4,120", "213", "5.17%"],
          ],
        },
        {
          caption: "Segment totals — New vs Returning",
          columns: ["Segment", "Visitors", "Conversions", "Conversion Rate"],
          rows: [
            ["New visitors", "7,920", "348", "4.39%"],
            ["Returning visitors", "4,560", "294", "6.45%"],
          ],
        },
      ],
      takeaway:
        "Returning visitors convert more strongly than new visitors. Schedule Demo leads on primary goal; consider validating on secondary goals before rolling out.",
      suggestions: [
        "Summarize secondary goals (M2, M3, M4)",
        "Analyze specific geo variations",
        "Explore other segments for this campaign",
      ],
    };
  }

  return {
    id: `a-${Date.now()}`,
    role: "assistant",
    at: stamp(),
    text: "Happy to help. I can analyse campaigns, spot friction in funnels, draft test ideas, or walk through heatmaps and recordings — what would you like to dig into first?",
    suggestions: [
      "Summarise my top running campaign",
      "Identify friction on the free-trial funnel",
      "Suggest three A/B test ideas for pricing",
    ],
  };
}

export function wingzUserMessage(text: string): WingzChatMessage {
  return {
    id: `u-${Date.now()}`,
    role: "user",
    text,
    at: stamp(),
  };
}

export function wingzCampaignArtifactMessage(
  artifact: WingzCampaignArtifact
): WingzChatMessage {
  return {
    id: `art-${Date.now()}`,
    role: "assistant",
    at: stamp(),
    text: `I’ve saved an artifact for “${artifact.name}”. Open it anytime to return to the editor or form — campaign chat stays with the campaign.`,
    artifact,
  };
}

/** Map main Wingz chat bubbles into the floating / Copilot message shape. */
export function wingzChatToStoreMessages(
  messages: WingzChatMessage[]
): { id: string; role: "user" | "assistant"; body: string; at: string }[] {
  return messages
    .filter((m) => !m.artifact && m.text.trim())
    .map((m) => ({
      id: m.id,
      role: m.role,
      body: m.text,
      at: new Date().toISOString(),
    }));
}
