export type SegmentAttribute = { id: string; label: string };
export type SegmentCategory = { id: string; label: string; attributes: SegmentAttribute[] };

export const STANDARD_SEGMENTS: SegmentCategory[] = [
  {
    id: "traffic",
    label: "Traffic",
    attributes: [
      { id: "all-traffic", label: "All Traffic" },
      { id: "direct", label: "Direct" },
      { id: "referral", label: "Referral" },
      { id: "social", label: "Social" },
      { id: "non-paid", label: "Non-paid" },
      { id: "paid", label: "Paid" },
      { id: "search", label: "Search" },
      { id: "email", label: "Email" },
    ],
  },
  {
    id: "device",
    label: "Device",
    attributes: [
      { id: "desktop", label: "Desktop" },
      { id: "mobile", label: "Mobile" },
      { id: "tablet", label: "Tablet" },
    ],
  },
  {
    id: "visitor",
    label: "Visitor",
    attributes: [
      { id: "new", label: "New visitors" },
      { id: "returning", label: "Returning visitors" },
      { id: "logged-in", label: "Logged in" },
      { id: "logged-out", label: "Logged out" },
    ],
  },
  {
    id: "os",
    label: "Operating System",
    attributes: [
      { id: "windows", label: "Windows" },
      { id: "macos", label: "Mac OS" },
      { id: "linux", label: "Linux" },
      { id: "ios", label: "iOS" },
      { id: "android", label: "Android" },
    ],
  },
];

export const MY_SEGMENTS: SegmentAttribute[] = [
  { id: "india-users", label: "India Users" },
  { id: "mumbai-windows-phone", label: "Mumbai Windows Phone" },
  { id: "email-subscribers", label: "Email" },
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
