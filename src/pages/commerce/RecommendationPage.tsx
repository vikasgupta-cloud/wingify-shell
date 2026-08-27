/** Commerce → Strategies list — Create recommendation opens location wizard. */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, Search } from "@/components/icons/protoLucide";
import CreateRecommendationWizard from "@/components/recommendations/CreateRecommendationWizard";
import RecommendationDisplaySettings from "@/components/recommendations/RecommendationDisplaySettings";
import RecommendationFilters from "@/components/recommendations/RecommendationFilters";
import RecommendationGroupBy from "@/components/recommendations/RecommendationGroupBy";
import RecommendationTable from "@/components/recommendations/RecommendationTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recommendationLandingPath } from "@/data/recommendations";
import { useRecommendationPipeline } from "@/components/recommendations/useRecommendationPipeline";
import { useRecommendationRowsStore } from "@/store/recommendationRows";
import { useRecommendationTableStore } from "@/store/recommendationTable";

export default function RecommendationPage() {
  const navigate = useNavigate();
  const search = useRecommendationTableStore((s) => s.search);
  const setSearch = useRecommendationTableStore((s) => s.setSearch);
  const create = useRecommendationRowsStore((s) => s.create);
  const rows = useRecommendationPipeline();
  const [wizardOpen, setWizardOpen] = useState(false);

  const countLabel =
    rows.length === 1
      ? "1 recommendation"
      : `${rows.length.toLocaleString()} recommendations`;

  /** Create with AI — quick create for now (wizard later). */
  const createWithAi = () => {
    const id = create({ name: "New recommendation", status: "Draft" });
    navigate(recommendationLandingPath({ id }));
  };

  return (
    <div className="px-12 pb-12 pt-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Your recommendations
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={createWithAi}
          >
            <Sparkles className="size-3.5" aria-hidden />
            Create with AI
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => setWizardOpen(true)}
          >
            Create recommendation
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <p className="mr-auto font-sans text-sm font-medium text-foreground">
            {countLabel}
          </p>
          <RecommendationGroupBy />
          <RecommendationFilters />
          <RecommendationDisplaySettings />
          <div className="flex w-full max-w-xs items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5 sm:w-64">
            <Search
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <RecommendationTable />
      </div>

      <CreateRecommendationWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
      />
    </div>
  );
}
