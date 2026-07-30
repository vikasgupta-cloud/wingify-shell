import type { LucideIcon } from "lucide-react";
import { Sparkles, Plus } from "lucide-react";
import type { CampaignType } from "../data/campaigns";
import { TYPE_ICONS } from "../components/icons/campaignTypeIcons";

export type CreateGroup = "ai" | "default";

/** Section headings in the Create menu, in render order. */
export const CREATE_GROUP_LABELS: Record<CreateGroup, string> = {
  ai: "AI",
  default: "Other",
};

export type CreateOption = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  group?: CreateGroup;
  /** When set, selecting the option mints a campaign of this type; otherwise it's a stub. */
  campaignType?: CampaignType;
};

// Campaign-type icons come from TYPE_ICONS (Figma test-type glyphs for A/B, Split, MVT).
export const CREATE_MENU: Record<string, CreateOption[]> = {
  "/web-experiment": [
    { id: "copilot", label: "Create with Copilot", description: "Let AI transform your idea into a campaign using VWO Copilot", icon: Sparkles, group: "ai" },
    { id: "ab-single", label: "AB - Single Page", description: "Compare different versions of the same page on your website", icon: TYPE_ICONS["A/B"], campaignType: "A/B" },
    { id: "ab-multi", label: "AB - Multi Page", description: "Test all the page of a conversion funnel on your site", icon: TYPE_ICONS.Multipage, campaignType: "Multipage" },
    { id: "split-url", label: "Split URL", description: "Compare different URLs against each other", icon: TYPE_ICONS["Split URL"], campaignType: "Split URL" },
    { id: "mvt", label: "Multivariate test", description: "Test a combination of modifications on your website", icon: TYPE_ICONS.MVT, campaignType: "MVT" },
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
