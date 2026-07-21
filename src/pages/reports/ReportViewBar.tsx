import {
  REPORT_PRESET_TABS,
  type ReportPresetId,
  useActiveReportPresetId,
  useReportViewsStore,
} from "../../store/reportViews";
import { cn } from "../../lib/utils";
import ReportViewSavedHint from "./ReportViewSavedHint";

const activeTabClass =
  "-mb-px border-b-2 border-foreground font-medium text-foreground";

export default function ReportViewBar({ campaignId }: { campaignId: string }) {
  const activePresetId = useActiveReportPresetId(campaignId);
  const setActivePreset = useReportViewsStore((s) => s.setActivePreset);

  return (
    <div className="mb-3 flex min-h-[36px] items-end justify-between gap-4 border-b border-border">
      <div className="flex items-end gap-5">
        {REPORT_PRESET_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActivePreset(campaignId, tab.id as ReportPresetId)}
            className={cn(
              "relative px-1 pb-2 text-sm transition-colors",
              activePresetId === tab.id
                ? activeTabClass
                : "text-foreground/70 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <ReportViewSavedHint />
    </div>
  );
}
