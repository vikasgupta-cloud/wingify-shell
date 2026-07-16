import type { CampaignStatus } from "../data/campaigns";

export type StatusTransition = { to: CampaignStatus; description: string };

export const STATUS_WORKFLOW: Record<CampaignStatus, StatusTransition[]> = {
  "Draft": [
    { to: "In QA", description: "Test setup internally before launch" },
    { to: "Ready to launch", description: "Finalize setup and prepare to launch" },
    { to: "Running", description: "Start campaign and serve visitors" },
  ],
  "In QA": [
    { to: "Ready to launch", description: "Finalize setup and prepare to launch" },
    { to: "Running", description: "Start campaign and serve visitors" },
  ],
  "Ready to launch": [
    { to: "Running", description: "Start campaign and serve visitors" },
  ],
  "Running": [
    { to: "Paused", description: "Stop serving visitors temporarily" },
    { to: "In Analysis", description: "Review collected data and finalize the decision" },
    { to: "Ended", description: "Close campaign and finalize reports" },
  ],
  "Paused": [
    { to: "Running", description: "Start campaign and serve visitors" },
    { to: "In Analysis", description: "Review collected data and finalize the decision" },
    { to: "Ended", description: "Close campaign and finalize reports" },
  ],
  "In Analysis": [
    { to: "Ended", description: "Close campaign and finalize reports" },
  ],
  "Ended": [],
};

// Draft is the only status whose transitions are gated on configuration being complete.
export const BLOCKED_NOTICE: Partial<Record<CampaignStatus, string>> = {
  "Draft": "To change campaign status you must configure and save Pages, Variations, and Metrics.",
};
