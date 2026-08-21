// Dummy Commerce → Recommendation list data (Figma Reco columns, Wingify shell).

import type { CampaignStatus } from "./campaigns";

export type RecommendationLocation =
  | "Home page"
  | "Product page"
  | "Cart pop-up"
  | "Category page"
  | "Checkout";

export type Recommendation = {
  id: string;
  name: string;
  location: RecommendationLocation;
  revenueShare: number; // percent, e.g. 3.7
  ctr: number; // percent
  rpvUplift: number; // multiplier, e.g. 2.3 → "x2.3"
  tags: string[];
  creator: string;
  creatorInitials: string;
  createdOn: string; // ISO
  lastEdit: string; // ISO
  status: CampaignStatus;
};

export const recommendationLandingPath = (r: { id: string }): string =>
  `/commerce/recommendation/c/${r.id}`;

export const recommendationReportsPath = (r: { id: string }): string =>
  `/commerce/recommendation/c/${r.id}/reports`;

const LOCATIONS: RecommendationLocation[] = [
  "Home page",
  "Product page",
  "Cart pop-up",
  "Category page",
  "Checkout",
];

const CREATORS: { name: string; initials: string }[] = [
  { name: "Maya M", initials: "MM" },
  { name: "Alex R", initials: "AR" },
  { name: "Priya N", initials: "PN" },
  { name: "Jordan K", initials: "JK" },
  { name: "Sofia A", initials: "SA" },
];

const TAG_POOL = ["TAG 1", "TAG 2", "SUMMER", "CART", "HOME", "PDP"];

const STATUSES: CampaignStatus[] = [
  "Running",
  "Draft",
  "Paused",
  "In QA",
  "Ready to launch",
];

function iso(y: number, m: number, d: number, h = 10, min = 0): string {
  return new Date(Date.UTC(y, m - 1, d, h, min, 0)).toISOString();
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

/** Seed ~46 rows so pagination matches the Figma density. */
export const RECOMMENDATIONS: Recommendation[] = Array.from(
  { length: 46 },
  (_, i) => {
    const n = i + 1;
    const creator = CREATORS[i % CREATORS.length];
    const tagCount = (i % 3) + 1;
    const tags = Array.from(
      { length: tagCount },
      (_, t) => TAG_POOL[(i + t) % TAG_POOL.length]
    );
    const day = 1 + (i % 28);
    const month = 1 + (i % 8);
    return {
      id: String(9000 + n),
      name:
        i % 5 === 2
          ? `Reco strategy ${n} — long campaign name for truncation`
          : `This is my super very long campaign name`,
      location: LOCATIONS[i % LOCATIONS.length],
      revenueShare: Number((1.2 + (i % 17) * 0.35).toFixed(1)),
      ctr: Number((4.1 + (i % 21) * 0.55).toFixed(1)),
      rpvUplift: Number((1.1 + (i % 9) * 0.2).toFixed(1)),
      tags: [...new Set(tags)],
      creator: creator.name,
      creatorInitials: creator.initials,
      createdOn: iso(2026, month, day, 9, (i * 7) % 60),
      lastEdit: iso(2026, month, Math.min(28, day + 2), 14, (i * 11) % 60),
      status: STATUSES[i % STATUSES.length],
    };
  }
);

export function makeRecommendation(partial?: Partial<Recommendation>): Recommendation {
  const id = partial?.id ?? String(Date.now());
  const creator = partial?.creator ?? "You";
  return {
    id,
    name: partial?.name ?? "Untitled recommendation",
    location: partial?.location ?? "Home page",
    revenueShare: partial?.revenueShare ?? 0,
    ctr: partial?.ctr ?? 0,
    rpvUplift: partial?.rpvUplift ?? 1,
    tags: partial?.tags ?? [],
    creator,
    creatorInitials: partial?.creatorInitials ?? initialsFrom(creator),
    createdOn: partial?.createdOn ?? new Date().toISOString(),
    lastEdit: partial?.lastEdit ?? new Date().toISOString(),
    status: partial?.status ?? "Draft",
  };
}
