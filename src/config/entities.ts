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
  "/plan/observations": [
    { id: "o1", name: "Checkout hesitation on mobile", status: "Recent" },
    { id: "o2", name: "Hero CTA overlooked above fold", status: "Recent" },
    { id: "o3", name: "Filter chips unused on PLP", status: "Drafts" },
    { id: "o4", name: "Search suggestions rarely selected", status: "Recent" },
    { id: "o5", name: "Form error copy ignored", status: "Running" },
    { id: "o6", name: "Nav mega-menu causes backtracks", status: "Paused" },
    { id: "o7", name: "Price comparison tab abandoned", status: "Recent" },
    { id: "o8", name: "Trust badges below fold", status: "Drafts" },
    { id: "o9", name: "Coupon field distracts checkout", status: "Recent" },
    { id: "o10", name: "Empty-state CTA unclear", status: "Paused" },
  ],
  "/plan/hypotheses": [
    { id: "h1", name: "Top Guides Swipeable Carousel", status: "Recent" },
    { id: "h2", name: "Sticky filter rail on PLP", status: "Drafts" },
    { id: "h3", name: "Inline validation on signup", status: "Running" },
    { id: "h4", name: "Simplify pricing comparison", status: "Recent" },
    { id: "h5", name: "Defer coupon field", status: "Paused" },
    { id: "h6", name: "Larger PDP trust badges", status: "Drafts" },
    { id: "h7", name: "Search autocomplete relevance", status: "Running" },
    { id: "h8", name: "Homepage hero contrast", status: "Recent" },
    { id: "h9", name: "Empty cart recommendations", status: "Drafts" },
    { id: "h10", name: "Progressive nav disclosure", status: "Paused" },
  ],
};

// Which detail sections read from a REAL product store rather than dummy getEntities().
export function isRealDataPath(basePath: string) {
  return (
    basePath === "/web-experiment" ||
    basePath === "/personalize" ||
    basePath === "/commerce/recommendation"
  );
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
