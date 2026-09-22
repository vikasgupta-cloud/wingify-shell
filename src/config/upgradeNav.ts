// Upgrade drill-in product catalog — left menu from product screenshot.
// PROFILE_MODES wires routing; UpgradeNav renders the rich list UI.

import type { LucideIcon } from "@/components/icons/protoLucide";
import {
  FlaskConical,
  Target,
  Rocket,
  MousePointerClick,
  UserRound,
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
  /** When true, render a non-clickable group label above the items (e.g. Analytics). */
  showHeading?: boolean;
  items: UpgradeProduct[];
};

export const UPGRADE_SECTIONS: UpgradeSection[] = [
  {
    heading: "Experiment",
    items: [
      {
        label: "Web Experimentation & Rollout",
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
        label: "Web Personalization",
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
        label: "Feature Management",
        description: "Feature experimentation, rollouts and pe…",
        path: "/upgrade/feature-experimentation",
        icon: Rocket,
      },
    ],
  },
  {
    heading: "Analytics",
    showHeading: true,
    items: [
      {
        label: "Behavior Analytics",
        description: "Web Behavior Analytics",
        path: "/upgrade/insights",
        icon: MousePointerClick,
      },
      {
        label: "User Feedback",
        description: "Voice of Customer",
        path: "/upgrade/pulse",
        icon: UserRound,
        badge: { label: "New", tone: "new" },
      },
    ],
  },
  {
    heading: "Commerce",
    showHeading: true,
    items: [
      {
        label: "Search",
        description: "Product Discovery",
        path: "/upgrade/search-ranking",
        icon: Search,
      },
      {
        label: "Recommendations",
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
        label: "Push Notifications",
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
        label: "Wingz",
        description: "AI-Driven Optimization",
        path: "/upgrade/wingz",
        icon: Sparkles,
        badge: { label: "Core Plan", tone: "plan" },
      },
    ],
  },
];
