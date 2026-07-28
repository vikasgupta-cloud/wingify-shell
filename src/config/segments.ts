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
// `label` = pill text (reports naming). `section` = list heading above items.
export type SegmentCategory = {
  id: string;
  label: string;
  section: string;
  attributes: SegmentAttribute[];
};

// Shared catalog for config + reports. Item names/descriptions follow reports;
// definition `condition` follows the config definition-panel shape.
export const STANDARD_SEGMENTS: SegmentCategory[] = [
  {
    id: "traffic",
    label: "Traffic",
    section: "Traffic source",
    attributes: [
      {
        id: "all-visitors",
        label: "All visitors",
        description:
          "Every visitor included in the campaign, with no traffic-source filtering applied.",
        example: "Use as the baseline audience for most experiments.",
      },
      {
        id: "direct-traffic",
        label: "Direct traffic",
        description:
          "Visitors who reached the site by typing the URL directly or via a saved bookmark.",
        example: "Someone opening the site from a saved bookmark.",
        condition: { subject: "Traffic Source", operator: "Is equal to", value: "Direct" },
      },
      {
        id: "referral-traffic",
        label: "Referral traffic",
        description: "Visitors who arrived from a link on another website.",
        example: "A visitor clicking a link from a partner blog.",
        condition: { subject: "Traffic Source", operator: "Is equal to", value: "Referral" },
      },
      {
        id: "social-traffic",
        label: "Social traffic",
        description:
          "Visitors who arrived from a social network such as Facebook, X or LinkedIn.",
        example: "A visitor tapping a link in an Instagram bio.",
        condition: { subject: "Traffic Source", operator: "Is equal to", value: "Social" },
      },
      {
        id: "non-paid-search",
        label: "Non-paid search traffic",
        description:
          "Visitors who arrived through organic, unpaid search-engine results.",
        example: "A visitor from an organic Google result.",
        condition: {
          subject: "Traffic Source",
          operator: "Is equal to",
          value: "Non-paid search",
        },
      },
      {
        id: "paid-search",
        label: "Paid search traffic",
        description: "Visitors who arrived by clicking a paid search advertisement.",
        example: "A visitor from a Google Ads click.",
        condition: {
          subject: "Traffic Source",
          operator: "Is equal to",
          value: "Paid search",
        },
      },
      {
        id: "email-traffic",
        label: "Email traffic",
        description: "Visitors who arrived from a link inside an email campaign.",
        example: "A visitor opening a link in your newsletter.",
        condition: { subject: "Traffic Source", operator: "Is equal to", value: "Email" },
      },
    ],
  },
  {
    id: "device",
    label: "Device type",
    section: "Device type",
    attributes: [
      {
        id: "mobile-tablet",
        label: "Mobile and tablet traffic",
        description: "Visitors browsing on either a mobile phone or a tablet device.",
        example: "A visitor on an iPhone or an iPad.",
        condition: {
          subject: "Device Type",
          operator: "Is one of",
          value: "Mobile, Tablet",
        },
      },
      {
        id: "mobile-traffic",
        label: "Mobile traffic",
        description: "Visitors browsing on a mobile phone.",
        example: "A visitor on an iPhone or Android phone.",
        condition: { subject: "Device Type", operator: "Is equal to", value: "Mobile" },
      },
      {
        id: "desktop-traffic",
        label: "Desktop traffic",
        description: "Visitors browsing on a desktop or laptop computer.",
        example: "A visitor on a 15-inch laptop.",
        condition: { subject: "Device Type", operator: "Is equal to", value: "Desktop" },
      },
      {
        id: "tablet-traffic",
        label: "Tablet traffic",
        description: "Visitors browsing on a tablet device.",
        example: "A visitor on an iPad.",
        condition: { subject: "Device Type", operator: "Is equal to", value: "Tablet" },
      },
      {
        id: "desktop-tablet",
        label: "Desktop and Tablet traffic",
        description: "Visitors browsing on either a desktop or a tablet device.",
        example: "A visitor on a laptop or an iPad.",
        condition: {
          subject: "Device Type",
          operator: "Is one of",
          value: "Desktop, Tablet",
        },
      },
    ],
  },
  {
    id: "visitor",
    label: "Visitor Type",
    section: "Visitor type",
    attributes: [
      {
        id: "new-visitors",
        label: "New visitors",
        description:
          "Visitors viewing the site for the first time within the campaign window.",
        example: "A first-time shopper with no prior cookie.",
        condition: { subject: "Visitor Type", operator: "Is equal to", value: "New" },
      },
      {
        id: "returning-visitors",
        label: "Returning visitors",
        description:
          "Visitors who have viewed the site before during the campaign window.",
        example: "A shopper coming back a second time.",
        condition: { subject: "Visitor Type", operator: "Is equal to", value: "Returning" },
      },
      {
        id: "logged-in-visitors",
        label: "Logged-in visitors",
        description: "Visitors who are authenticated with an account during their session.",
        example: "A signed-in member browsing their dashboard.",
        condition: { subject: "Visitor Type", operator: "Is equal to", value: "Logged in" },
      },
      {
        id: "first-time-buyers",
        label: "First-time buyers",
        description: "Visitors completing their first purchase during the campaign.",
        example: "A shopper checking out for the first time.",
        condition: {
          subject: "Purchase Count",
          operator: "Is equal to",
          value: "1",
        },
      },
    ],
  },
  {
    id: "os",
    label: "Operating System",
    section: "Operating system",
    attributes: [
      {
        id: "windows",
        label: "Windows",
        description: "Visitors browsing from a device running Microsoft Windows.",
        example: "A visitor on Windows 11.",
        condition: { subject: "Operating System", operator: "Is equal to", value: "Windows" },
      },
      {
        id: "macos",
        label: "macOS",
        description: "Visitors browsing from a device running Apple macOS.",
        example: "A visitor on a MacBook running macOS.",
        condition: { subject: "Operating System", operator: "Is equal to", value: "macOS" },
      },
      {
        id: "ios",
        label: "iOS",
        description: "Visitors browsing from an iPhone or iPad running iOS.",
        example: "A visitor on an iPhone running iOS.",
        condition: { subject: "Operating System", operator: "Is equal to", value: "iOS" },
      },
      {
        id: "android",
        label: "Android",
        description: "Visitors browsing from a device running Android.",
        example: "A visitor on a Samsung Galaxy phone.",
        condition: { subject: "Operating System", operator: "Is equal to", value: "Android" },
      },
      {
        id: "linux",
        label: "Linux",
        description: "Visitors browsing from a device running a Linux distribution.",
        example: "A visitor on Ubuntu.",
        condition: { subject: "Operating System", operator: "Is equal to", value: "Linux" },
      },
    ],
  },
];

/** Default selected segment label (config campaigns + resets). */
export const DEFAULT_SEGMENT_LABEL = "All visitors";

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

export function findSegmentByLabel(label: string): SegmentAttribute | undefined {
  for (const category of STANDARD_SEGMENTS) {
    const found = category.attributes.find((a) => a.label === label);
    if (found) return found;
  }
  return MY_SEGMENTS.find((a) => a.label === label);
}
