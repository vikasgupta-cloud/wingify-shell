// Dummy data for Insights → Session Recordings (layout mirror of Figma Recordings).

export type RecordingViewStatus = "Running" | "Draft" | "Paused";

export type RecordingView = {
  id: string;
  name: string;
  url: string;
  status: RecordingViewStatus;
};

export type SessionRow = {
  id: string;
  city: string;
  country: string;
  url: string;
  company: number;
  duration: string;
  events: number;
  timestamp: string;
};

export const RECORDING_STATS = [
  { label: "Total Sessions", value: "1.67M" },
  { label: "Total Pageviews", value: "4.83M" },
  { label: "Data Retention", value: "2,190 days" },
] as const;

export const RECORDING_VIEWS: RecordingView[] = [
  {
    id: "agency",
    name: "Agency Partners",
    url: "https://vwo.com/partners/agencies",
    status: "Running",
  },
  {
    id: "signup",
    name: "New sign up-Create Acco...",
    url: "https://vwo.com*",
    status: "Running",
  },
  { id: "view-73", name: "View 73", url: "https://vwo.com", status: "Draft" },
  { id: "view-72", name: "View 72", url: "https://vwo.com", status: "Draft" },
  { id: "view-71", name: "View 71", url: "https://vwo.com", status: "Draft" },
  {
    id: "high",
    name: "High value accounts",
    url: "https://vwo.com",
    status: "Draft",
  },
  {
    id: "medium",
    name: "Medium value accounts",
    url: "https://example.com",
    status: "Draft",
  },
  {
    id: "low",
    name: "Low value accounts",
    url: "https://sampleurl.com",
    status: "Draft",
  },
  {
    id: "alfred-1",
    name: "test_Alfred_user_msg_sent",
    url: "https://vwo.com",
    status: "Paused",
  },
  {
    id: "alfred-2",
    name: "test_Alfred_user_msg_sent",
    url: "https://vwo.com",
    status: "Paused",
  },
];

const CITIES = [
  "Sunnyvale",
  "Mountain View",
  "Santa Clara",
  "San Jose",
  "Palo Alto",
  "Cupertino",
  "Milpitas",
  "Fremont",
  "Redwood City",
  "Menlo Park",
] as const;

export const SESSION_ROWS: SessionRow[] = CITIES.map((city, i) => ({
  id: `sess-${i + 1}`,
  city,
  country: "United States",
  url: "https://palash-multicurre...",
  company: 1,
  duration: `00:00:${String(12 + i * 3).padStart(2, "0")}`,
  events: 0,
  timestamp: `01 Jul, 2025 ${String(10 + (i % 5)).padStart(2, "0")}:${String(3 + i).padStart(2, "0")} AM`,
}));

export const ACTIVE_REPORT = {
  name: "Agency Partners",
  status: "Running" as const,
  createdBy: "Randeep",
  createdAt: "20 Feb, 2026 at 11:43 AM",
};

export function parseDurationMs(duration: string): number {
  const parts = duration.split(":").map((n) => Number(n) || 0);
  if (parts.length === 3) {
    return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  }
  if (parts.length === 2) {
    return (parts[0] * 60 + parts[1]) * 1000;
  }
  return 12_000;
}

export type RecordingKeyframe = {
  t: number;
  x: number;
  y: number;
  scroll: number;
  click?: boolean;
  label: string;
};

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Dummy cursor path over the editor preview site. Deterministic per session id. */
export function buildRecordingTrack(
  id: string,
  _durationMs: number
): RecordingKeyframe[] {
  const seed = hashId(id);
  const wobble = (n: number) => ((seed % 17) - 8) * 0.004 * n;
  return [
    { t: 0, x: 0.18, y: 0.1, scroll: 0, label: "Landed" },
    {
      t: 0.12,
      x: 0.42 + wobble(1),
      y: 0.08,
      scroll: 0,
      label: "Browsed nav",
    },
    {
      t: 0.22,
      x: 0.28,
      y: 0.38,
      scroll: 0.05,
      click: true,
      label: "Clicked hero",
    },
    {
      t: 0.4,
      x: 0.52,
      y: 0.55,
      scroll: 0.28,
      label: "Scrolled collection",
    },
    {
      t: 0.55,
      x: 0.22 + wobble(2),
      y: 0.48,
      scroll: 0.42,
      click: true,
      label: "Opened product",
    },
    {
      t: 0.72,
      x: 0.68,
      y: 0.62,
      scroll: 0.58,
      click: true,
      label: "Added to bag",
    },
    {
      t: 0.88,
      x: 0.5,
      y: 0.78,
      scroll: 0.82,
      label: "Read footer",
    },
    { t: 1, x: 0.48, y: 0.22, scroll: 0.08, label: "Returned to hero" },
  ];
}

export function sampleTrack(
  track: RecordingKeyframe[],
  t: number
): RecordingKeyframe {
  if (track.length === 0) {
    return { t: 0, x: 0.5, y: 0.5, scroll: 0, label: "Idle" };
  }
  const p = Math.min(1, Math.max(0, t));
  const nextI = track.findIndex((k) => k.t >= p);
  if (nextI <= 0) return track[0];
  const b = track[nextI] ?? track[track.length - 1];
  const a = track[nextI - 1] ?? track[0];
  const span = b.t - a.t || 1;
  const u = (p - a.t) / span;
  return {
    t: p,
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u,
    scroll: a.scroll + (b.scroll - a.scroll) * u,
    click: false,
    label: u > 0.5 ? b.label : a.label,
  };
}

export function openSessionPlayer(id: string) {
  const qs = new URLSearchParams({ id });
  window.open(
    `/insights/session-recordings/player?${qs.toString()}`,
    "_blank",
    "noopener,noreferrer"
  );
}

/* ------------------------------------------------------------------ *
 * Player: visitor, pages and the event stream shown beside the video. *
 * ------------------------------------------------------------------ */

export type RecordingEventKind =
  | "experience"
  | "metric"
  | "funnel"
  | "custom"
  | "engagement"
  | "friction"
  | "click"
  | "tab";

export type RecordingEvent = {
  id: string;
  /** Position within the session, 0–1. */
  t: number;
  kind: RecordingEventKind;
  /** Bold headline, e.g. "Variation-1" or "Step 1". */
  title: string;
  /** Parenthesised kind label, e.g. "Experience Served". */
  type: string;
  /** Muted second line — the campaign / metric / funnel it belongs to. */
  detail?: string;
  /** Rows like Tab In / Tab Out carry an explainer instead of a detail line. */
  hint?: string;
};

/** Ordered template of a paid-landing-page session, mirrored per session id. */
const EVENT_TEMPLATE: Omit<RecordingEvent, "id" | "t">[] = [
  {
    kind: "experience",
    title: "Variation-1",
    type: "Experience Served",
    detail: "Campaign: CTA change in get-started - Variation 1",
  },
  {
    kind: "experience",
    title: "Experience-1",
    type: "Experience Served",
    detail: "Campaign: Remove Logo Link to Homepage",
  },
  {
    kind: "experience",
    title: "Experience-1",
    type: "Experience Served",
    detail: "Campaign: Get started LP - Remove eBook section",
  },
  {
    kind: "metric",
    title: "Page Visits Website",
    type: "Metric",
    detail: "Converted For: Page Visits Website",
  },
  {
    kind: "metric",
    title: "Track Visits on Campaign/Paid Page",
    type: "Metric",
    detail: "Converted For: Track Visits on Campaign/Paid Page",
  },
  {
    kind: "funnel",
    title: "Visitor",
    type: "Funnel Step Converted",
    detail: "Funnel: Visitor to FT Leads - Model",
  },
  {
    kind: "funnel",
    title: "Step 1",
    type: "Funnel Step Converted",
    detail: "Funnel: Track ChatGPT Summarise Button in Blog",
  },
  {
    kind: "funnel",
    title: "Step 1",
    type: "Funnel Step Converted",
    detail: "Funnel: Track Perplexity Summarise Button in Blog",
  },
  {
    kind: "funnel",
    title: "Step 1",
    type: "Funnel Step Converted",
    detail: "Funnel: Track Grok Summarise Button in Blog",
  },
  {
    kind: "funnel",
    title: "Step 1",
    type: "Funnel Step Converted",
    detail: "Funnel: Track Claude Summarise Button in Blog",
  },
  {
    kind: "funnel",
    title: "Step 1",
    type: "Funnel Step Converted",
    detail: "Funnel: Track Gemini Summarise Button in Blog",
  },
  {
    kind: "custom",
    title: "abtUaLocMatch",
    type: "Custom Event",
    detail: "Fired on: Landing page load",
  },
  {
    kind: "custom",
    title: "abTastyUaParserMatch",
    type: "Custom Event",
    detail: "Fired on: Landing page load",
  },
  {
    kind: "metric",
    title: "Subscriptions",
    type: "Metric",
    detail: "Converted For: Subscriptions",
  },
  {
    kind: "click",
    title: "Click",
    type: "Interaction",
  },
  {
    kind: "tab",
    title: "Tab Out",
    type: "Engagement",
    hint: "Visitor switched away from this tab",
  },
  {
    kind: "tab",
    title: "Tab In",
    type: "Engagement",
    hint: "Visitor returned to this tab",
  },
  {
    kind: "click",
    title: "Click",
    type: "Interaction",
  },
  {
    kind: "friction",
    title: "Leave Intent",
    type: "Friction",
    detail: "Cursor moved towards the browser chrome",
  },
  {
    kind: "metric",
    title: "AB Testing | Clicks on Request Demo",
    type: "Metric",
    detail: "Converted For: Marketing | Clicks on Request Demo",
  },
  {
    kind: "metric",
    title: "Marketing | Free Trial Banner",
    type: "Metric",
    detail: "Converted For: Free Trial Banner Report",
  },
  {
    kind: "metric",
    title: "Marketing | Request Demo Banner",
    type: "Metric",
    detail: "Converted For: Request Demo Banner Report",
  },
  {
    kind: "friction",
    title: "Dead Click",
    type: "Friction",
    detail: "Clicked an element with no handler",
  },
];

/** Deterministic per session id — same recording always replays the same log. */
export function buildSessionEvents(id: string): RecordingEvent[] {
  const seed = hashId(id);
  return EVENT_TEMPLATE.map((event, i) => {
    const base = (i + 1) / (EVENT_TEMPLATE.length + 1);
    const jitter = (((seed >> i) % 7) - 3) * 0.004;
    return {
      ...event,
      id: `${id}-ev-${i + 1}`,
      t: Math.min(0.98, Math.max(0.02, base + jitter)),
    };
  });
}

export type RecordedPage = {
  id: string;
  url: string;
  /** Where in the session this page was entered, 0–1. */
  startsAt: number;
  /** Load time in seconds, shown on the divider in the event log. */
  loadSeconds: number;
};

const PAGE_URLS = [
  "https://vwo.com/campaign/get-started/?utm_source=google&utm_medium=paid",
  "https://vwo.com/personalization/",
  "https://vwo.com/insights/",
  "https://vwo.com/free-trial/",
] as const;

/** Two to four pages per session, deterministic from the session id. */
export function buildRecordedPages(session: SessionRow): RecordedPage[] {
  const seed = hashId(session.id);
  const count = 2 + (seed % 3);
  return PAGE_URLS.slice(0, count).map((url, i) => ({
    id: `${session.id}-p${i + 1}`,
    url,
    startsAt: i / count,
    loadSeconds: Number((0.6 + ((seed >> i) % 90) / 100).toFixed(2)),
  }));
}

/**
 * The event log as the panel renders it: page-load dividers interleaved with
 * events, in time order. Event numbering restarts on every page load, which is
 * what makes the log readable across a multi-page session.
 */
export type SessionLogEntry =
  | { type: "page"; id: string; t: number; page: RecordedPage }
  | {
      type: "event";
      id: string;
      t: number;
      /** Position within the current page, 1-based. */
      index: number;
      event: RecordingEvent;
    };

export function buildSessionLog(
  pages: RecordedPage[],
  events: RecordingEvent[]
): SessionLogEntry[] {
  const marks = pages.map((page) => ({ t: page.startsAt, page }));
  const merged = [
    ...marks.map((m) => ({ t: m.t, page: m.page, event: null })),
    ...events.map((e) => ({ t: e.t, page: null, event: e })),
  ].sort((a, b) => a.t - b.t || (a.page ? -1 : 1));

  let index = 0;
  return merged.map((row) => {
    if (row.page) {
      index = 0;
      return { type: "page", id: row.page.id, t: row.t, page: row.page };
    }
    index += 1;
    return { type: "event", id: row.event!.id, t: row.t, index, event: row.event! };
  });
}

export type VisitorAttribute = { label: string; value: string };

export type SessionVisitor = {
  /** Short hash shown in the panel header. */
  code: string;
  sessions: number;
  recordings: number;
  device: string;
  browser: string;
  os: string;
  country: string;
  countryCode: string;
  attributes: VisitorAttribute[];
};

const COUNTRY_CODES: Record<string, string> = {
  "United States": "US",
  India: "IN",
  Germany: "DE",
  Switzerland: "CH",
};

/** ISO alpha-2 → regional-indicator flag emoji. */
export function countryFlagEmoji(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export function buildVisitor(session: SessionRow): SessionVisitor {
  const seed = hashId(session.id);
  const code = seed.toString(16).toUpperCase().padStart(7, "0").slice(0, 7);
  return {
    code: `#${code}`,
    sessions: 1,
    recordings: session.company,
    device: "Desktop",
    browser: "Chrome 128",
    os: "macOS 15",
    country: session.country,
    countryCode: COUNTRY_CODES[session.country] ?? "US",
    attributes: [
      { label: "PaidPageCustomScroll", value: String(1000 + (seed % 900)) },
      { label: "Plan", value: seed % 3 === 0 ? "Enterprise" : "Growth" },
    ],
  };
}
