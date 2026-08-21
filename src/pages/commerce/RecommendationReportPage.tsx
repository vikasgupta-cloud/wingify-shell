// Recommendation reporting surface — next-level destination from list hover action.

import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useVisibleRecommendations } from "@/store/recommendationRows";

export default function RecommendationReportPage() {
  const { entityId = "" } = useParams();
  const navigate = useNavigate();
  const row = useVisibleRecommendations().find((r) => r.id === entityId);

  if (!row) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center px-12 text-center">
        <p className="text-sm font-medium text-foreground">
          Recommendation not found
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/commerce/recommendation")}
        >
          Back to list
        </Button>
      </div>
    );
  }

  const metrics = [
    { label: "% of revenue", value: `${row.revenueShare.toFixed(1)}%` },
    { label: "CTR", value: `${row.ctr.toFixed(1)}%` },
    { label: "RPV uplift", value: `x${row.rpvUplift.toFixed(1)}` },
  ];

  return (
    <div className="mx-auto max-w-3xl px-12 py-10">
      <h1 className="text-lg font-medium text-foreground">Reporting</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Performance for {row.name}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-border bg-background px-4 py-5"
          >
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="mt-2 text-2xl font-medium tabular-nums text-foreground">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
        Location: {row.location}. Deeper charts and breakdowns will land here
        next.
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-6"
        onClick={() => navigate("/commerce/recommendation")}
      >
        Back to list
      </Button>
    </div>
  );
}
