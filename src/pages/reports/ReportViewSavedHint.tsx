import { useEffect, useMemo } from "react";
import { Check } from "lucide-react";
import {
  reportPresetLabel,
  useReportViewsStore,
} from "../../store/reportViews";

export default function ReportViewSavedHint({
  campaignId,
}: {
  campaignId: string;
}) {
  const hint = useReportViewsStore((s) => s.lastSaveHint);
  const rawSlice = useReportViewsStore((s) => s.byCampaign[campaignId]);
  const clearSaveHint = useReportViewsStore((s) => s.clearSaveHint);

  const savedLabel = useMemo(() => {
    if (!hint) return null;
    if (hint.customViewId && rawSlice && typeof rawSlice === "object") {
      const views = (rawSlice as { customViews?: { id: string; name: string }[] })
        .customViews;
      const name = views?.find((v) => v.id === hint.customViewId)?.name;
      if (name) return name;
    }
    return reportPresetLabel(hint.presetId);
  }, [hint, rawSlice]);

  useEffect(() => {
    if (!hint) return;
    const t = window.setTimeout(() => clearSaveHint(), 2000);
    return () => window.clearTimeout(t);
  }, [hint, clearSaveHint]);

  if (!hint || !savedLabel) return null;

  return (
    <p
      className="flex items-center gap-1.5 text-xs text-muted-foreground"
      role="status"
    >
      <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
      Saved to {savedLabel}
    </p>
  );
}
