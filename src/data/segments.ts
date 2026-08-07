// Dummy segments for Data 360 → Segments (Standard + My Segment).
// Standard rows reuse the shared catalog in src/config/segments.ts.

import {
  MY_SEGMENTS,
  STANDARD_SEGMENTS,
  type SegmentDefCondition,
} from "@/config/segments";

export type SegmentKind = "Standard" | "My Segment";

export type DataSegment = {
  id: string;
  name: string;
  kind: SegmentKind;
  description: string;
  createdBy: string;
  createdOn: string; // ISO
  condition?: SegmentDefCondition;
};

function iso(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m - 1, d)).toISOString();
}

const STANDARD_ROWS: DataSegment[] = STANDARD_SEGMENTS.flatMap((cat) =>
  cat.attributes.map((a) => ({
    id: `std-${a.id}`,
    name: a.label,
    kind: "Standard" as const,
    description: a.description ?? "",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    condition: a.condition,
  }))
);

/** Extra My Segments from product screenshots + catalog entries. */
const MY_ROWS: DataSegment[] = [
  ...MY_SEGMENTS.map((a) => ({
    id: `my-${a.id}`,
    name: a.label,
    kind: "My Segment" as const,
    description: a.description ?? "",
    createdBy: "Sarah Chen",
    createdOn: iso(2025, 6, 12),
    condition: a.condition,
  })),
  {
    id: "my-home-countries",
    name: "Home - India, US, Japan",
    kind: "My Segment",
    description: "",
    createdBy: "Gowtham S",
    createdOn: iso(2026, 4, 24),
    condition: {
      subject: "Country",
      operator: "Is one of",
      value: "India, US, Japan",
    },
  },
  {
    id: "my-personalise-countries",
    name: "personalise countries group",
    kind: "My Segment",
    description: "Audience grouped by personalization country set",
    createdBy: "Priya Sharma",
    createdOn: iso(2026, 3, 8),
    condition: {
      subject: "Country",
      operator: "Is one of",
      value: "IN, US, JP",
    },
  },
  {
    id: "my-campaign-id",
    name: "Segment by campaign ID",
    kind: "My Segment",
    description: "",
    createdBy: "Ankit Jain",
    createdOn: iso(2026, 2, 14),
    condition: {
      subject: "Campaign ID",
      operator: "Is equal to",
      value: "214",
    },
  },
  {
    id: "my-tdd-optimizely",
    name: "TDD - Optimizely Visitors",
    kind: "My Segment",
    description: "",
    createdBy: "Tracking",
    createdOn: iso(2025, 10, 13),
    condition: {
      subject: "Visitor Attribute",
      operator: "Is equal to",
      value: "optimizely",
    },
  },
  {
    id: "my-hour-of-day",
    name: "Hour of Day",
    kind: "My Segment",
    description: "",
    createdBy: "James Okonkwo",
    createdOn: iso(2026, 1, 19),
    condition: {
      subject: "Hour of the Day",
      operator: "Is equal to",
      value: "01",
    },
  },
  {
    id: "my-us",
    name: "US",
    kind: "My Segment",
    description: "Visitors located in the United States",
    createdBy: "Sarah Chen",
    createdOn: iso(2025, 11, 2),
    condition: { subject: "Country", operator: "Is equal to", value: "US" },
  },
  {
    id: "my-desktop",
    name: "Desktop",
    kind: "My Segment",
    description: "",
    createdBy: "Priya Sharma",
    createdOn: iso(2025, 9, 30),
    condition: {
      subject: "Device Type",
      operator: "Is equal to",
      value: "Desktop",
    },
  },
  {
    id: "my-non-paid",
    name: "traffic source = non-paid",
    kind: "My Segment",
    description: "",
    createdBy: "Ankit Jain",
    createdOn: iso(2026, 5, 1),
    condition: {
      subject: "Traffic Source",
      operator: "Is equal to",
      value: "Non-paid search",
    },
  },
  {
    id: "my-us-returning",
    name: "US - Returning Visitor",
    kind: "My Segment",
    description: "",
    createdBy: "Gowtham S",
    createdOn: iso(2026, 4, 2),
    condition: {
      subject: "Visitor Type",
      operator: "Is equal to",
      value: "Returning",
    },
  },
  {
    id: "my-us-new",
    name: "US - New Visitor",
    kind: "My Segment",
    description: "",
    createdBy: "Gowtham S",
    createdOn: iso(2026, 4, 2),
    condition: {
      subject: "Visitor Type",
      operator: "Is equal to",
      value: "New",
    },
  },
];

export const SEGMENTS: DataSegment[] = [...STANDARD_ROWS, ...MY_ROWS];
