// @summary Dummy account-usage + activity-timeline rows for the Activity overview popover.
export type AccountUsagePlan = "ENTERPRISE" | "FREE";

export type AccountUsageProduct = {
  id: string;
  name: string;
  icon: "monitor" | "pointer" | "smartphone";
  plan: AccountUsagePlan;
  remaining: string;
  metricLabel: string;
  metricValue: string;
};

export type ActivityOverviewEvent = {
  id: string;
  at: string;
  actor: string;
  title: string;
  detail?: string;
  icon: "globe" | "user" | "ab";
};

export const ACCOUNT_USAGE_PRODUCTS: AccountUsageProduct[] = [
  {
    id: "testing-web",
    name: "Wingify Testing - Web",
    icon: "monitor",
    plan: "ENTERPRISE",
    remaining: "1 year 6 months 27 days remaining",
    metricLabel: "MTU Consumed",
    metricValue: "79",
  },
  {
    id: "insights",
    name: "Wingify Insights",
    icon: "pointer",
    plan: "ENTERPRISE",
    remaining: "1 year 6 months 27 days remaining",
    metricLabel: "Sampled MTU Consumed",
    metricValue: "0",
  },
  {
    id: "insights-mobile",
    name: "Wingify Insights - Mobile App",
    icon: "smartphone",
    plan: "FREE",
    remaining: "1 year 6 months 27 days remaining",
    metricLabel: "Sampled MTU Consumed",
    metricValue: "0",
  },
];

export const ACTIVITY_OVERVIEW_EVENTS: ActivityOverviewEvent[] = [
  {
    id: "1",
    at: "07 Sep 2026, 19:35",
    actor: "Nitish Mittal",
    title: "Created Flipkart website",
    icon: "globe",
  },
  {
    id: "2",
    at: "27 Aug 2026, 09:21",
    actor: "Vikas Gupta",
    title: "Created Global Settings Survey (ID: 761765)",
    icon: "user",
  },
  {
    id: "3",
    at: "29 May 2026, 17:56",
    actor: "Nitish Mittal",
    title: "Campaign 117",
    detail:
      "Multi page mode disabled, Global CSS and JS emptied, Segment set to All Visitors, and 4 other changes applied to the campaign.",
    icon: "ab",
  },
];

export const ACCOUNT_USAGE_DETAILS_PATH = "/settings/accounts/usage";
export const ACTIVITY_TIMELINE_DETAILS_PATH =
  "/settings/accounts/activity-timeline";
