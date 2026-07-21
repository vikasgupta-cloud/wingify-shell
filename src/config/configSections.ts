import type { CampaignConfig } from "../store/config";

export type SectionId =
  | "main"
  | "pages"
  | "variations"
  | "metrics"
  | "integrations"
  | "additional"
  | "qa";
export type SectionGroup = "define" | "review";
export type SubSection = { id: string; label: string };
export type Section = {
  id: SectionId;
  label: string;
  mandatory: boolean;
  group: SectionGroup;
  // One-line summary shown under the title in the Guided view's step header;
  // harmless/unused elsewhere.
  description: string;
  subs?: SubSection[];
};

export const SECTIONS: Section[] = [
  {
    id: "main",
    label: "Main Information",
    mandatory: true,
    group: "define",
    description: "Name your campaign, add labels, and set your hypothesis.",
  },
  {
    id: "pages",
    label: "Pages",
    mandatory: true,
    group: "define",
    description: "Choose which URLs this campaign runs on.",
  },
  {
    id: "variations",
    label: "Target and Variation",
    mandatory: true,
    group: "define",
    description: "Allocate traffic, target visitors, and build variations.",
  },
  {
    id: "metrics",
    label: "Metrics",
    mandatory: true,
    group: "define",
    description: "Pick your success and observation metrics.",
  },
  // Not-required: mandatory:false suppresses the completion indicator everywhere.
  {
    id: "integrations",
    label: "Integrations",
    mandatory: false,
    group: "define",
    description: "Connect third-party tools.",
  },
  {
    id: "additional",
    label: "Additional Settings",
    mandatory: false,
    group: "define",
    description: "Fine-tune advanced options.",
  },
  {
    id: "qa",
    label: "QA Settings",
    mandatory: false,
    group: "review",
    description: "Preview and QA before launch.",
  },
];

// Ordered group headers for the navigator; derived from SECTIONS so a step
// added later appears under its group automatically.
export const SECTION_GROUPS: { id: SectionGroup; label: string }[] = [
  { id: "define", label: "Define" },
  { id: "review", label: "Review" },
];

export function isSectionComplete(id: SectionId, c: CampaignConfig): boolean {
  switch (id) {
    case "main":
      return c.hypothesis !== null;
    case "pages":
      return c.pageGroups.some(
        (g) => g.kind === "include" && g.rules.some((r) => r.value.trim() !== "")
      );
    case "variations":
      return c.variations.length > 1;
    case "metrics":
      return c.successMetric !== null;
    case "integrations":
    case "additional":
    case "qa":
      return true;
  }
}
