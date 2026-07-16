import type { LucideIcon } from "lucide-react";
import { Sparkles, Columns2, Files, GitBranch, Grid2x2, Plus } from "lucide-react";

export type CreateOption = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  group?: "ai" | "default";
};

// The four campaign-type icons match CampaignTable's TYPE_ICONS so the same
// campaign type shows the same glyph in the menu and in its row:
// A/B → Columns2, Multipage → Files, Split URL → GitBranch, MVT → Grid2x2.
export const CREATE_MENU: Record<string, CreateOption[]> = {
  "/web-experiment": [
    { id: "copilot", label: "Create with Copilot", description: "Let AI transform your idea into a campaign using VWO Copilot", icon: Sparkles, group: "ai" },
    { id: "ab-single", label: "AB - Single Page", description: "Compare different versions of the same page on your website", icon: Columns2 },
    { id: "ab-multi", label: "AB - Multi Page", description: "Test all the page of a conversion funnel on your site", icon: Files },
    { id: "split-url", label: "Split URL", description: "Compare different URLs against each other", icon: GitBranch },
    { id: "mvt", label: "Multivariate test", description: "Test a combination of modifications on your website", icon: Grid2x2 },
  ],
};

// Sections without a bespoke menu fall back to a single generic option.
export function getCreateOptions(pathname: string, label: string): CreateOption[] {
  return (
    CREATE_MENU[pathname] ?? [
      { id: "new", label: `New ${label}`, description: "", icon: Plus },
    ]
  );
}

// TODO add bespoke Create options for the other sections as they're specced.
