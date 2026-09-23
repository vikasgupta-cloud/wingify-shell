/** Dummy catalogs for remaining Upgrade left-nav products. */

import { buildCatalog, type UpgradeProductCatalog } from "./upgradeProductCatalog";

export const PERSONALIZE_WEB_CATALOG: UpgradeProductCatalog = buildCatalog({
  productName: "Web Personalization",
  priceScale: 0.95,
  defaultOpenCategories: ["experiences"],
  featureCategories: [
    {
      id: "experiences",
      label: "Experiences",
      rows: [
        {
          id: "rules",
          label: "Rule-based Experiences",
          cells: { starter: true, growth: true, pro: true, enterprise: true },
        },
        {
          id: "segments",
          label: "Segment Personalization",
          cells: { starter: false, growth: true, pro: true, enterprise: true },
        },
        {
          id: "1to1",
          label: "1:1 Personalization",
          cells: { starter: false, growth: false, pro: true, enterprise: true },
        },
      ],
    },
    { id: "targeting", label: "Targeting", rows: [] },
    { id: "widgets", label: "Widgets", rows: [] },
    { id: "reports", label: "Reports", rows: [] },
    { id: "platform", label: "Platform & Account Management", rows: [] },
  ],
  productAddons: [
    {
      id: "recs-boost",
      name: "Personalization Recommendations Boost",
      priceLabel: "$899 / month",
      availability: "Available in Pro, Enterprise",
    },
    {
      id: "geo",
      name: "Advanced Geo Targeting",
      priceLabel: "$199 / month",
      availability: "Available in Growth, Pro, Enterprise",
    },
  ],
});

export const FEATURE_MANAGEMENT_CATALOG: UpgradeProductCatalog = buildCatalog({
  productName: "Feature Management",
  priceScale: 1.05,
  defaultOpenCategories: ["flags"],
  featureCategories: [
    {
      id: "flags",
      label: "Flags & Rollouts",
      rows: [
        {
          id: "boolean",
          label: "Boolean Flags",
          cells: { starter: true, growth: true, pro: true, enterprise: true },
        },
        {
          id: "pct",
          label: "Percentage Rollouts",
          cells: { starter: false, growth: true, pro: true, enterprise: true },
        },
        {
          id: "multivar",
          label: "Multivariate Flags",
          cells: { starter: false, growth: false, pro: true, enterprise: true },
        },
      ],
    },
    { id: "targeting", label: "Targeting", rows: [] },
    { id: "sdks", label: "SDKs", rows: [] },
    { id: "governance", label: "Governance", rows: [] },
  ],
  productAddons: [
    {
      id: "env",
      name: "Extra Environments",
      priceLabel: "$120 / month",
      availability: "Available in Growth, Pro, Enterprise",
    },
    {
      id: "approvals",
      name: "Change Approvals",
      priceLabel: "$349 / month",
      availability: "Available in Pro, Enterprise",
    },
  ],
});

export const BEHAVIOR_ANALYTICS_CATALOG: UpgradeProductCatalog = buildCatalog({
  productName: "Behavior Analytics",
  priceScale: 0.9,
  defaultOpenCategories: ["insights"],
  featureCategories: [
    {
      id: "insights",
      label: "Insights",
      rows: [
        {
          id: "recordings",
          label: "Session Recordings",
          cells: { starter: true, growth: true, pro: true, enterprise: true },
        },
        {
          id: "heatmaps",
          label: "Heatmaps",
          cells: { starter: false, growth: true, pro: true, enterprise: true },
        },
        {
          id: "funnels",
          label: "Funnels",
          cells: { starter: false, growth: false, pro: true, enterprise: true },
        },
      ],
    },
    { id: "filters", label: "Filters", rows: [] },
    { id: "export", label: "Export & API", rows: [] },
  ],
  productAddons: [
    {
      id: "retention",
      name: "Extended Recording Retention",
      priceLabel: "$299 / month",
      availability: "Available in Growth, Pro, Enterprise",
    },
    {
      id: "rage",
      name: "Rage Click Detection Pack",
      priceLabel: "$149 / month",
      availability: "Available in Pro, Enterprise",
    },
  ],
});

export const USER_FEEDBACK_CATALOG: UpgradeProductCatalog = buildCatalog({
  productName: "User Feedback",
  priceScale: 0.85,
  defaultOpenCategories: ["surveys"],
  featureCategories: [
    {
      id: "surveys",
      label: "Surveys",
      rows: [
        {
          id: "nps",
          label: "NPS Surveys",
          cells: { starter: true, growth: true, pro: true, enterprise: true },
        },
        {
          id: "onpage",
          label: "On-page Feedback",
          cells: { starter: false, growth: true, pro: true, enterprise: true },
        },
        {
          id: "concept",
          label: "Concept Testing",
          cells: { starter: false, growth: false, pro: true, enterprise: true },
        },
      ],
    },
    { id: "widgets", label: "Widgets", rows: [] },
    { id: "analysis", label: "Analysis", rows: [] },
  ],
  productAddons: [
    {
      id: "responses",
      name: "Extra Response Quota",
      priceLabel: "$99 / month",
      availability: "Available in Growth, Pro, Enterprise",
    },
    {
      id: "branding",
      name: "Remove Wingify Branding",
      priceLabel: "$79 / month",
      availability: "Available in Pro, Enterprise",
    },
  ],
});

export const SEARCH_CATALOG: UpgradeProductCatalog = buildCatalog({
  productName: "Search",
  priceScale: 1.1,
  defaultOpenCategories: ["discovery"],
  featureCategories: [
    {
      id: "discovery",
      label: "Discovery",
      rows: [
        {
          id: "site-search",
          label: "Site Search",
          cells: { starter: true, growth: true, pro: true, enterprise: true },
        },
        {
          id: "ranking",
          label: "Custom Ranking Rules",
          cells: { starter: false, growth: true, pro: true, enterprise: true },
        },
        {
          id: "merch",
          label: "Visual Merchandising",
          cells: { starter: false, growth: false, pro: true, enterprise: true },
        },
      ],
    },
    { id: "synonyms", label: "Synonyms", rows: [] },
    { id: "analytics", label: "Search Analytics", rows: [] },
  ],
  productAddons: [
    {
      id: "facets",
      name: "Advanced Faceting",
      priceLabel: "$449 / month",
      availability: "Available in Pro, Enterprise",
    },
    {
      id: "query",
      name: "Query Suggestions Pack",
      priceLabel: "$199 / month",
      availability: "Available in Growth, Pro, Enterprise",
    },
  ],
});

export const RECOMMENDATIONS_CATALOG: UpgradeProductCatalog = buildCatalog({
  productName: "Recommendations",
  priceScale: 1.08,
  defaultOpenCategories: ["widgets"],
  featureCategories: [
    {
      id: "widgets",
      label: "Widgets",
      rows: [
        {
          id: "similar",
          label: "Similar Products",
          cells: { starter: true, growth: true, pro: true, enterprise: true },
        },
        {
          id: "fbt",
          label: "Frequently Bought Together",
          cells: { starter: false, growth: true, pro: true, enterprise: true },
        },
        {
          id: "personalized",
          label: "Personalized Shelves",
          cells: { starter: false, growth: false, pro: true, enterprise: true },
        },
      ],
    },
    { id: "strategies", label: "Strategies", rows: [] },
    { id: "catalog", label: "Catalog Sync", rows: [] },
  ],
  productAddons: [
    {
      id: "ai-rank",
      name: "AI Ranking Models",
      priceLabel: "$699 / month",
      availability: "Available in Pro, Enterprise",
    },
    {
      id: "slots",
      name: "Extra Widget Slots",
      priceLabel: "$120 / month",
      availability: "Available in Growth, Pro, Enterprise",
    },
  ],
});

export const PUSH_NOTIFICATIONS_CATALOG: UpgradeProductCatalog = buildCatalog({
  productName: "Push Notifications",
  priceScale: 0.8,
  defaultOpenCategories: ["channels"],
  featureCategories: [
    {
      id: "channels",
      label: "Channels",
      rows: [
        {
          id: "web-push",
          label: "Web Push",
          cells: { starter: true, growth: true, pro: true, enterprise: true },
        },
        {
          id: "mobile",
          label: "Mobile Push",
          cells: { starter: false, growth: true, pro: true, enterprise: true },
        },
        {
          id: "journeys",
          label: "Triggered Journeys",
          cells: { starter: false, growth: false, pro: true, enterprise: true },
        },
      ],
    },
    { id: "templates", label: "Templates", rows: [] },
    { id: "compliance", label: "Compliance", rows: [] },
  ],
  productAddons: [
    {
      id: "volume",
      name: "Extra Send Volume",
      priceLabel: "$179 / month",
      availability: "Available in Growth, Pro, Enterprise",
    },
    {
      id: "inbox",
      name: "In-App Inbox",
      priceLabel: "$249 / month",
      availability: "Available in Pro, Enterprise",
    },
  ],
});
