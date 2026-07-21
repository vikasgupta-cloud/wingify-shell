import { useEffect } from "react";
import { Check } from "lucide-react";
import {
  reportPresetLabel,
  useReportViewsStore,
} from "../../store/reportViews";
import { cn } from "../../lib/utils";

export default function ReportViewSavedHint() {
  const hint = useReportViewsStore((s) => s.lastSaveHint);
  const clearSaveHint = useReportViewsStore((s) => s.clearSaveHint);

  useEffect(() => {
    if (!hint) return;
    const t = window.setTimeout(() => clearSaveHint(), 2000);
    return () => window.clearTimeout(t);
  }, [hint, clearSaveHint]);

  if (!hint) return null;

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 pb-2 text-xs text-muted-foreground",
        "animate-in fade-in-0 duration-200"
      )}
      role="status"
    >
      <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
      Saved to {reportPresetLabel(hint.presetId)}
    </p>
  );
}
