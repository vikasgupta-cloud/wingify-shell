import { pageLabel } from "../lib/nav";

export type Entity = {
  id: string;
  name: string;
  status: "Recent" | "Running" | "Drafts" | "Paused";
};

const STATUSES: Entity["status"][] = ["Recent", "Running", "Drafts", "Paused"];

// Richer dummy sets for the two reference sections.
const CURATED: Record<string, Entity[]> = {
  "/web-experiment": [
    { id: "3637", name: "Homepage Hero CTA Test", status: "Running" },
    { id: "3641", name: "Pricing Page Layout", status: "Recent" },
    { id: "3652", name: "Checkout Copy Experiment", status: "Drafts" },
    { id: "3660", name: "Nav Simplification Test", status: "Paused" },
  ],
  "/feature-management/holdouts": [
    { id: "H-1024", name: "Q3 Pricing Holdout", status: "Running" },
    { id: "H-1031", name: "Search Revamp Holdout", status: "Recent" },
    { id: "H-1042", name: "Mobile Onboarding Holdout", status: "Drafts" },
  ],
};

// Which detail sections read from the REAL campaign store (rows.visibleCampaigns)
// rather than the dummy getEntities() lists. Only Web Experiment is migrated;
// TODO: other sections switch to real data as they're built.
export function isRealDataPath(basePath: string) {
  return basePath === "/web-experiment";
}

/** Filter chips for the entity popover of a given page path. */
export function getFilters(basePath: string): string[] {
  const richSections = ["/web-experiment", "/personalize", "/feature-management"];
  return richSections.some((p) => basePath.startsWith(p))
    ? ["All", "Recent", "Running", "Drafts", "Paused"]
    : ["All", "Recent"];
}

/**
 * Dummy entities for a page path. Curated lists for the reference sections;
 * a generic 8-item fallback for every other leaf so all detail routes have
 * data without hand-writing per-page lists.
 */
export function getEntities(basePath: string): Entity[] {
  const curated = CURATED[basePath];
  if (curated) return curated;

  const label = pageLabel(basePath);
  const prefix = basePath
    .split("/")
    .filter(Boolean)
    .map((segment) => segment[0])
    .join("")
    .toUpperCase();

  return Array.from({ length: 8 }, (_, i) => ({
    id: `${prefix}-${101 + i}`,
    name: `${label} item ${i + 1}`,
    status: STATUSES[i % STATUSES.length],
  }));
}
