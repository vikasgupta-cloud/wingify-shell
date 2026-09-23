/** Dummy catalog for Upgrade → Wingify Testing - Web (/upgrade/testing-web). */

import {
  buildCatalog,
  type UpgradeProductCatalog,
} from "./upgradeProductCatalog";

export type {
  AddonCard,
  FeatureCategory,
  FeatureCell,
  FeatureRow,
  MtuTier,
  PlanColumn,
  UpgradePlanId,
} from "./upgradeProductCatalog";

export {
  formatUsd,
  SHARED_MTU_TIERS as MTU_TIERS,
  SHARED_PLAN_COLUMNS as PLAN_COLUMNS,
} from "./upgradeProductCatalog";

export const DEFAULT_MTU_INDEX = 2;

export const TESTING_WEB_CATALOG: UpgradeProductCatalog = buildCatalog({
  productName: "Web Experimentation & Rollout",
  priceScale: 1,
  defaultOpenCategories: ["campaign-types"],
  featureCategories: [
    {
      id: "campaign-types",
      label: "Campaign Types",
      rows: [
        {
          id: "ab",
          label: "A/B Testing",
          cells: { starter: false, growth: true, pro: true, enterprise: true },
        },
        {
          id: "split",
          label: "Split URL Testing",
          cells: { starter: false, growth: true, pro: true, enterprise: true },
        },
        {
          id: "rollout",
          label: "Rollout Campaigns",
          cells: { starter: false, growth: true, pro: true, enterprise: true },
        },
        {
          id: "mvt",
          label: "Multivariate (MVT) Testing",
          cells: { starter: false, growth: false, pro: true, enterprise: true },
        },
      ],
    },
    { id: "editor", label: "Editor", rows: [] },
    { id: "editor-library", label: "Editor Library", rows: [] },
    { id: "campaign-settings", label: "Campaign Settings", rows: [] },
    { id: "targeting", label: "Targeting", rows: [] },
    { id: "triggers", label: "Triggers", rows: [] },
    { id: "reports", label: "Reports", rows: [] },
    { id: "platform", label: "Platform & Account Management", rows: [] },
    { id: "asset-hub", label: "Asset Hub", rows: [] },
    { id: "wna", label: "Website and Apps", rows: [] },
    { id: "security", label: "Security & Compliance", rows: [] },
    { id: "support", label: "Support", rows: [] },
    { id: "cs", label: "Customer Success", rows: [] },
  ],
  productAddons: [
    {
      id: "social-proof",
      name: "Social Proof & Urgency Messaging",
      priceLabel: "$1,099 / month",
      availability: "Available in Pro, Enterprise",
    },
    {
      id: "mutex",
      name: "Mutually Exclusive Groups",
      priceLabel: "$250 / month",
      availability: "Available in Growth, Pro, Enterprise",
    },
    {
      id: "mtu-quota",
      name: "Additional MTU Quota",
      priceLabel: "$150 one-time",
      availability: "Available in Growth, Pro, Enterprise",
    },
  ],
});

/** @deprecated use TESTING_WEB_CATALOG — kept for any stray named imports */
export const FEATURE_CATEGORIES = TESTING_WEB_CATALOG.featureCategories;
export const PRODUCT_ADDONS = TESTING_WEB_CATALOG.productAddons;
export const ACCOUNT_ADDONS = TESTING_WEB_CATALOG.accountAddons;
export const UPGRADE_FAQS = TESTING_WEB_CATALOG.faqs;
export const AI_CORE = TESTING_WEB_CATALOG.aiCore;
export const AI_ADVANCED = TESTING_WEB_CATALOG.aiAdvanced;
export const ACTIVE_SUBSCRIPTION_PLAN =
  TESTING_WEB_CATALOG.activeSubscriptionPlan;
export const ACTIVE_SUBSCRIPTION_LABEL =
  TESTING_WEB_CATALOG.activeSubscriptionLabel;
