// Upgrade drill-in product catalog — left menu from product screenshot.
// PROFILE_MODES wires routing; UpgradeNav renders the rich list UI.

import type { LucideIcon } from "@/components/icons/protoLucide";
import {
  FlaskConical,
  Target,
  Rocket,
  MousePointerClick,
  HeartPulse,
  Search,
  SquareStack,
  MessageSquare,
  Sparkles,
} from "@/components/icons/protoLucide";

export const UPGRADE_ACCOUNT_ID = "103";
export const UPGRADE_ADDONS_PATH = "/upgrade/add-ons";

export type UpgradeBadgeTone = "new" | "plan";

export type UpgradeProduct = {
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
  badge?: { label: string; tone: UpgradeBadgeTone };
};

export type UpgradeSection = {
  heading: string;
  items: UpgradeProduct[];
};

export const UPGRADE_SECTIONS: UpgradeSection[] = [
  {
    heading: "Experiment",
    items: [
      {
        label: "Wingify Testing - Web",
        description: "Web Experimentation",
        path: "/upgrade/testing-web",
        icon: FlaskConical,
      },
    ],
  },
  {
    heading: "Personalize",
    items: [
      {
        label: "Wingify Personalize - Web",
        description: "Web Personalization",
        path: "/upgrade/personalize-web",
        icon: Target,
      },
    ],
  },
  {
    heading: "Feature Management",
    items: [
      {
        label: "Wingify Feature Experimentation",
        description: "Feature experimentation, rollouts and pe…",
        path: "/upgrade/feature-experimentation",
        icon: Rocket,
      },
    ],
  },
  {
    heading: "Analyze",
    items: [
      {
        label: "Wingify Insights",
        description: "Web Behavior Analytics",
        path: "/upgrade/insights",
        icon: MousePointerClick,
      },
      {
        label: "Wingify Pulse",
        description: "Voice of Customer",
        path: "/upgrade/pulse",
        icon: HeartPulse,
        badge: { label: "New", tone: "new" },
      },
    ],
  },
  {
    heading: "Commerce",
    items: [
      {
        label: "Wingify Search & Ranking",
        description: "Product Discovery",
        path: "/upgrade/search-ranking",
        icon: Search,
      },
      {
        label: "Wingify Recommendations",
        description: "Product Recommendations",
        path: "/upgrade/recommendations",
        icon: SquareStack,
      },
    ],
  },
  {
    heading: "Engage",
    items: [
      {
        label: "Wingify Engage",
        description: "Push Notifications",
        path: "/upgrade/engage",
        icon: MessageSquare,
      },
    ],
  },
  {
    heading: "AI Driven Optimization",
    items: [
      {
        label: "Wandz",
        description: "AI-Driven Optimization",
        path: "/upgrade/wandz",
        icon: Sparkles,
        badge: { label: "Core Plan", tone: "plan" },
      },
    ],
  },
];
