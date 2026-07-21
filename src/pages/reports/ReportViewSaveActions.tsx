import { Button } from "@/components/ui/button";
import {
  useIsReportViewDirty,
  useReportViewsStore,
} from "../../store/reportViews";

export default function ReportViewSaveActions({
  campaignId,
}: {
  campaignId: string;
}) {
  const isDirty = useIsReportViewDirty(campaignId);
  const saveDraft = useReportViewsStore((s) => s.saveResultsTableColumnsDraft);
  const discardDraft = useReportViewsStore(
    (s) => s.discardResultsTableColumnsDraft
  );

  if (!isDirty) return null;

  return (
    <div className="flex items-center gap-2 pb-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => discardDraft(campaignId)}
      >
        Discard
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={() => saveDraft(campaignId)}
      >
        Save view
      </Button>
    </div>
  );
}
