import type { CampaignConfig } from "../store/config";

export type SectionId = "main" | "pages" | "variations" | "metrics" | "additional" | "qa";
export type SubSection = { id: string; label: string; showsCompletion?: boolean };
export type Section = { id: SectionId; label: string; mandatory: boolean; subs?: SubSection[] };

export const SECTIONS: Section[] = [
  { id: "main", label: "Main Information", mandatory: true },
  { id: "pages", label: "Pages", mandatory: true },
  {
    id: "variations",
    label: "Variations & targets",
    mandatory: true,
    subs: [
      { id: "allocate", label: "Allocate traffic" },
      { id: "targeting", label: "Set targeting" },
      { id: "variations", label: "Variations", showsCompletion: true },
    ],
  },
  { id: "metrics", label: "Metrics", mandatory: true },
  { id: "additional", label: "Additional Settings", mandatory: false },
  { id: "qa", label: "QA Settings", mandatory: false },
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
    case "additional":
    case "qa":
      return true;
  }
}
