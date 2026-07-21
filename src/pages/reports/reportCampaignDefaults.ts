import type { Campaign } from "../../data/campaigns";
import type { ReportDateRange } from "../../store/reportViews";

/** Default report filter dates from this campaign's timeline. */
export function campaignReportDateRange(campaign: Campaign): ReportDateRange {
  const from = (campaign.startedOn ?? campaign.createdOn).slice(0, 10);
  const to = campaign.lastUpdated.slice(0, 10);
  return {
    id: "campaign",
    label: "Campaign duration",
    from,
    to,
  };
}
