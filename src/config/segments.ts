// `description` powers the definition panel in the segment picker; `example` fills
// the optional "For example" box (dummy copy — no real targeting is evaluated).
// A single "where" clause shown in the definition panel, e.g.
// { subject: "Traffic Source", operator: "Is equal to", value: "Direct" }.
export type SegmentDefCondition = { subject: string; operator: string; value: string };

export type SegmentAttribute = {
  id: string;
  label: string;
  description?: string;
  example?: string;
  // Structured definition: "All Visitors" is implicit; `condition` (when set)
  // renders as "where <subject> <operator> <value>". Omitted = no filter.
  condition?: SegmentDefCondition;
};
export type SegmentCategory = { id: string; label: string; attributes: SegmentAttribute[] };

export const STANDARD_SEGMENTS: SegmentCategory[] = [
  {
    id: "traffic",
    label: "Traffic",
    attributes: [
      {
        id: "all-traffic",
        label: "All Traffic",
        description: "Everyone who visits, with no filtering applied.",
        example: "Use as the baseline audience for most experiments.",
      },
      {
        id: "direct",
        label: "Direct",
        description:
          "Visitors who arrived by typing your URL or via a bookmark — no referrer.",
        example: "Someone opening the site from a saved bookmark.",
        condition: { subject: "Traffic Source", operator: "Is equal to", value: "Direct" },
      },
      {
        id: "referral",
        label: "Referral",
        description: "Visitors who came from a link on another website.",
        example: "A visitor clicking a link from a partner blog.",
        condition: { subject: "Traffic Source", operator: "Is equal to", value: "Referral" },
      },
      {
        id: "social",
        label: "Social",
        description:
          "Visitors who arrived from a social network such as Facebook, X, or LinkedIn.",
        example: "A visitor tapping a link in an Instagram bio.",
        condition: { subject: "Traffic Source", operator: "Is equal to", value: "Social" },
      },
      {
        id: "non-paid",
        label: "Non-paid",
        description:
          "Visitors from unpaid sources such as organic search and direct traffic.",
        example: "A visitor from an organic Google result.",
        condition: { subject: "Traffic Source", operator: "Is equal to", value: "Non-paid" },
      },
      {
        id: "paid",
        label: "Paid",
        description: "Visitors from paid campaigns like Google Ads or paid social.",
        example: "A visitor from a Google Ads click.",
        condition: { subject: "Traffic Source", operator: "Is equal to", value: "Paid" },
      },
      {
        id: "search",
        label: "Search",
        description: "Visitors who arrived from a search engine results page.",
        example: "A visitor searching your brand name on Bing.",
        condition: { subject: "Traffic Source", operator: "Is equal to", value: "Search" },
      },
      {
        id: "email",
        label: "Email",
        description: "Visitors who clicked through from an email campaign.",
        example: "A visitor opening a link in your newsletter.",
        condition: { subject: "Traffic Source", operator: "Is equal to", value: "Email" },
      },
    ],
  },
  {
    id: "device",
    label: "Device",
    attributes: [
      {
        id: "desktop",
        label: "Desktop",
        description: "Visitors browsing on a desktop or laptop computer.",
        example: "A visitor on a 15-inch laptop.",
        condition: { subject: "Device Type", operator: "Is equal to", value: "Desktop" },
      },
      {
        id: "mobile",
        label: "Mobile",
        description: "Visitors browsing on a mobile phone.",
        example: "A visitor on an iPhone or Android phone.",
        condition: { subject: "Device Type", operator: "Is equal to", value: "Mobile" },
      },
      {
        id: "tablet",
        label: "Tablet",
        description: "Visitors browsing on a tablet device.",
        example: "A visitor on an iPad.",
        condition: { subject: "Device Type", operator: "Is equal to", value: "Tablet" },
      },
    ],
  },
  {
    id: "visitor",
    label: "Visitor",
    attributes: [
      {
        id: "new",
        label: "New visitors",
        description: "People visiting your site for the first time.",
        example: "A first-time shopper with no prior cookie.",
        condition: { subject: "Visitor Type", operator: "Is equal to", value: "New" },
      },
      {
        id: "returning",
        label: "Returning visitors",
        description: "People who have visited your site before.",
        example: "A shopper coming back a second time.",
        condition: { subject: "Visitor Type", operator: "Is equal to", value: "Returning" },
      },
      {
        id: "logged-in",
        label: "Logged in",
        description: "Visitors authenticated into an account.",
        example: "A signed-in member browsing their dashboard.",
        condition: { subject: "Visitor Type", operator: "Is equal to", value: "Logged in" },
      },
      {
        id: "logged-out",
        label: "Logged out",
        description: "Visitors who are not signed in.",
        example: "An anonymous visitor with no active session.",
        condition: { subject: "Visitor Type", operator: "Is equal to", value: "Logged out" },
      },
    ],
  },
  {
    id: "os",
    label: "Operating System",
    attributes: [
      {
        id: "windows",
        label: "Windows",
        description: "Visitors on the Windows operating system.",
        example: "A visitor on Windows 11.",
        condition: { subject: "Operating System", operator: "Is equal to", value: "Windows" },
      },
      {
        id: "macos",
        label: "Mac OS",
        description: "Visitors on macOS.",
        example: "A visitor on a MacBook running macOS.",
        condition: { subject: "Operating System", operator: "Is equal to", value: "Mac OS" },
      },
      {
        id: "linux",
        label: "Linux",
        description: "Visitors on a Linux distribution.",
        example: "A visitor on Ubuntu.",
        condition: { subject: "Operating System", operator: "Is equal to", value: "Linux" },
      },
      {
        id: "ios",
        label: "iOS",
        description: "Visitors on Apple iOS (iPhone or iPad).",
        example: "A visitor on an iPhone running iOS.",
        condition: { subject: "Operating System", operator: "Is equal to", value: "iOS" },
      },
      {
        id: "android",
        label: "Android",
        description: "Visitors on the Android operating system.",
        example: "A visitor on a Samsung Galaxy phone.",
        condition: { subject: "Operating System", operator: "Is equal to", value: "Android" },
      },
    ],
  },
];

export const MY_SEGMENTS: SegmentAttribute[] = [
  {
    id: "india-users",
    label: "India Users",
    description: "Visitors located in India.",
    example: "A visitor browsing from Bengaluru.",
    condition: { subject: "Country", operator: "Is equal to", value: "India" },
  },
  {
    id: "mumbai-windows-phone",
    label: "Mumbai Windows Phone",
    description: "Visitors in Mumbai using a Windows Phone device.",
    example: "A visitor in Mumbai on a Windows Phone.",
    condition: { subject: "City", operator: "Is equal to", value: "Mumbai" },
  },
  {
    id: "email-subscribers",
    label: "Email",
    description: "Visitors who arrived from one of your email campaigns.",
    example: "A subscriber clicking a promo email link.",
    condition: { subject: "Traffic Source", operator: "Is equal to", value: "Email" },
  },
];

export const STANDARD_COUNT = STANDARD_SEGMENTS.reduce(
  (n, c) => n + c.attributes.length,
  0
);

// Flat, de-duplicated list of every segment label (standard + my segments).
// Used by the Workflow Mode Target node's plain <Select>. Names may collide
// across the two groups (e.g. "Email"); we dedupe so Select keys stay unique.
export const ALL_SEGMENT_LABELS: string[] = Array.from(
  new Set([
    ...STANDARD_SEGMENTS.flatMap((c) => c.attributes.map((a) => a.label)),
    ...MY_SEGMENTS.map((a) => a.label),
  ])
);

// ── Custom segment builder ──────────────────────────────────────────────────
// The attribute + operator catalog lives in ./segmentAttributes. Conditions
// store the attribute id and operator id (not display labels). Client-side
// only, no real evaluation happens.
import {
  ATTRIBUTE_CATEGORIES,
  findAttribute,
  findOperator,
  operatorsFor,
} from "./segmentAttributes";

export type SegmentConnector = "And" | "Or";

// One row in the builder. `connector` joins this condition to the one before it
// (ignored for the first condition). `attribute` is an AttributeDef id and
// `operator` an OperatorDef id within that attribute's operator set.
export type SegmentCondition = {
  id: string;
  connector: SegmentConnector;
  attribute: string;
  operator: string;
  value: string;
};

export type CustomSegmentDef = {
  id: string;
  label: string;
  conditions: SegmentCondition[];
};

// Session-unique id generator for builder rows / defs (no persistence).
let segSeq = 0;
const segUid = (prefix: string) => `${prefix}-${(segSeq += 1)}`;

export function makeCondition(): SegmentCondition {
  const attr = ATTRIBUTE_CATEGORIES[0].attributes[0];
  return {
    id: segUid("cond"),
    connector: "And",
    attribute: attr.id,
    operator: operatorsFor(attr)[0].id,
    value: "",
  };
}

// Builds a saved/applied segment. `name` becomes the display label; when blank
// it falls back to "Custom segment".
export function makeCustomSegment(
  conditions: SegmentCondition[],
  name: string
): CustomSegmentDef {
  return {
    id: segUid("seg"),
    label: name.trim() || "Custom segment",
    conditions,
  };
}

// Human-readable summary derived from the conditions, e.g.
// "All users where Device Type is Mobile And Country is India".
export function describeCustomSegment(conditions: SegmentCondition[]): string {
  const parts = conditions
    .map((c, i) => {
      const attr = findAttribute(c.attribute);
      const op = attr ? findOperator(attr, c.operator) : undefined;
      const clause = [attr?.label, op?.label, c.value.trim()]
        .filter(Boolean)
        .join(" ");
      return clause ? (i === 0 ? clause : `${c.connector} ${clause}`) : "";
    })
    .filter(Boolean);
  if (parts.length === 0) return "Custom segment";
  return `All users where ${parts.join(" ")}`;
}

export function findSegmentLabel(id: string): string | undefined {
  for (const category of STANDARD_SEGMENTS) {
    const found = category.attributes.find((a) => a.id === id);
    if (found) return found.label;
  }
  return MY_SEGMENTS.find((a) => a.id === id)?.label;
}
