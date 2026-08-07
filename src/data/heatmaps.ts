// Dummy data for Insights → Heatmaps (layout from product screenshot).

export type HeatmapViewStatus = "Running" | "Paused";

export type HeatmapView = {
  id: string;
  name: string;
  url: string;
  status: HeatmapViewStatus;
};

export const HEATMAP_ALL_DATA = {
  retention: "3710 Days",
  clicks: "1,145,507",
} as const;

export const HEATMAP_VIEWS: HeatmapView[] = [
  {
    id: "ab-pages",
    name: "AB Pages",
    url: "https://app.vwo.com/#/test/ab",
    status: "Running",
  },
  {
    id: "get-started",
    name: "Get Started Screens",
    url: "https://app.vwo.com/#/dashboard/get-started",
    status: "Running",
  },
  {
    id: "explore",
    name: "Explore",
    url: "https://app.vwo.com/#/explore",
    status: "Running",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    url: "http://app.vwo.com/#/dashboard",
    status: "Paused",
  },
  {
    id: "view-1",
    name: "View 1",
    url: "http://datastagingapp.vwo.com*",
    status: "Paused",
  },
];
