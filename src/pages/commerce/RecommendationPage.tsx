// Commerce → Recommendation list — table-only, WE-style filters/columns/pagination.

import { Search } from "@/components/icons/protoLucide";
import { Input } from "@/components/ui/input";
import RecommendationColumnConfig from "@/components/recommendations/RecommendationColumnConfig";
import RecommendationFilterBar from "@/components/recommendations/RecommendationFilterBar";
import RecommendationTable from "@/components/recommendations/RecommendationTable";
import { useRecommendationTableStore } from "@/store/recommendationTable";

export default function RecommendationPage() {
  const { search, setSearch } = useRecommendationTableStore();

  return (
    <>
      <div className="px-12 pb-12 pt-10">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex w-72 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-auto border-0 bg-transparent px-0 py-0 text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
          <RecommendationFilterBar />
          <div className="ml-auto flex items-center gap-2">
            <RecommendationColumnConfig />
          </div>
        </div>

        <RecommendationTable />
      </div>
    </>
  );
}
