export const OLD_EXPERIMENT_BASE = "/web-experiment-old";

export const OLD_STEPS = [
  {
    id: "pages",
    label: "Pages",
    description: "Add the URLs you want to include in your campaign.",
  },
  {
    id: "variations",
    label: "Variations & Traffic",
    description: "Create variations using Visual Editor or Code Editor",
  },
  {
    id: "metrics",
    label: "Metrics",
    description:
      "Define and track KPIs to get a sharper view of your conversion success.",
  },
  {
    id: "targeting",
    label: "Targeting",
    description: "Define targeting conditions for your campaign.",
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Integrate with third-party products.",
  },
] as const;

export type OldStepId = (typeof OLD_STEPS)[number]["id"];

export function isOldStepId(value: string | undefined): value is OldStepId {
  return OLD_STEPS.some((step) => step.id === value);
}

export function oldCampaignPath(id: string, step: OldStepId | "reports" = "pages") {
  return `${OLD_EXPERIMENT_BASE}/c/${id}/${step}`;
}

export function oldLandingPath(status: string, id: string) {
  const reports = ["Running", "Paused", "In Analysis", "Ended"].includes(status);
  return oldCampaignPath(id, reports ? "reports" : "pages");
}
