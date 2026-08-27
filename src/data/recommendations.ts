// Dummy Commerce → Strategies (Recommendations) list data.

export type RecommendationLocation =
  | "No location"
  | "Home page"
  | "Product page"
  | "Landing page"
  | "Category page"
  | "Cart pop-up"
  | "Checkout";

export type RecommendationStatus =
  | "Draft"
  | "Deployed"
  | "Deployed (Draft Waiting…)";

export type Recommendation = {
  id: string;
  name: string;
  location: RecommendationLocation;
  revenueShare: number | null;
  ctr: number | null;
  rpvUplift: number | null;
  tags: string[];
  creator: string;
  creatorInitials: string;
  createdOn: string;
  lastEdit: string | null;
  status: RecommendationStatus;
};

export const recommendationLandingPath = (r: { id: string }): string =>
  `/commerce/recommendation/c/${r.id}`;

export const recommendationReportsPath = (r: { id: string }): string =>
  `/commerce/recommendation/c/${r.id}/reports`;

const LOCATIONS: RecommendationLocation[] = [
  "No location",
  "Home page",
  "Product page",
  "Landing page",
  "Category page",
  "Cart pop-up",
  "Checkout",
];

const CREATORS: { name: string; initials: string }[] = [
  { name: "Alysen Acton", initials: "A" },
  { name: "Vincent Morel", initials: "V" },
  { name: "Tanguy Bernard", initials: "T" },
  { name: "Julie Martin", initials: "J" },
  { name: "Priya Nair", initials: "P" },
];

const TAG_POOL = [
  "Demo Reporting",
  "PLP",
  "Products Category",
  "Test elias",
  "Test elias 2",
];

const STATUSES: RecommendationStatus[] = [
  "Draft",
  "Deployed",
  "Deployed (Draft Waiting…)",
];

const NAMES = [
  "Alysen Acton - Training - 8/10",
  "New recommendation",
  "Tanguy test",
  "Top 10 produits par revenus sur 30 jours",
  "Home bestsellers carousel",
  "PDP frequently bought together",
  "Cart cross-sell — accessories",
  "Category page trending now",
  "Checkout last-chance offer",
  "PLP similar items rail",
];

function iso(y: number, m: number, d: number, h = 10, min = 0): string {
  return new Date(Date.UTC(y, m - 1, d, h, min, 0)).toISOString();
}

/** Seed rows for Strategies list density + pagination. */
export const RECOMMENDATIONS: Recommendation[] = Array.from(
  { length: 82 },
  (_, i) => {
    const n = i + 1;
    const creator = CREATORS[i % CREATORS.length];
    const status = STATUSES[i % STATUSES.length];
    const deployed = status === "Deployed";
    const tagCount = i % 4 === 0 ? 0 : (i % 3) + 1;
    const tags = Array.from(
      { length: tagCount },
      (_, t) => TAG_POOL[(i + t) % TAG_POOL.length]
    );
    const day = 1 + (i % 28);
    const month = 1 + (i % 8);
    return {
      id: String(9000 + n),
      name: NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${n}` : ""),
      location: LOCATIONS[i % LOCATIONS.length],
      revenueShare: deployed ? Number((0.4 + (i % 17) * 0.15).toFixed(1)) : null,
      ctr: deployed ? Number((12.1 + (i % 21) * 1.1).toFixed(1)) : null,
      rpvUplift: deployed ? Number((0.2 + (i % 9) * 0.15).toFixed(2)) : null,
      tags: [...new Set(tags)],
      creator: creator.name,
      creatorInitials: creator.initials,
      createdOn: iso(2026, month, day, 9 + (i % 12), (i * 7) % 60),
      lastEdit:
        i % 3 === 0
          ? null
          : iso(2026, month, Math.min(28, day + 2), 14, (i * 11) % 60),
      status,
    };
  }
);

let nextId = 9500;

export function makeRecommendation(
  partial?: Partial<Recommendation>
): Recommendation {
  const id = String(nextId++);
  const creator = CREATORS[0];
  return {
    id,
    name: partial?.name ?? "New recommendation",
    location: partial?.location ?? "No location",
    revenueShare: partial?.revenueShare ?? null,
    ctr: partial?.ctr ?? null,
    rpvUplift: partial?.rpvUplift ?? null,
    tags: partial?.tags ?? [],
    creator: partial?.creator ?? creator.name,
    creatorInitials: partial?.creatorInitials ?? creator.initials,
    createdOn: partial?.createdOn ?? new Date().toISOString(),
    lastEdit: partial?.lastEdit ?? null,
    status: partial?.status ?? "Draft",
  };
}
