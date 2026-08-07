// Pulse → Surveys — WE-style views/filters/columns with survey data; table + card layouts.
// Create comes from the shell TopBar (no page-level Create button).

import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/layout/PageHeader";
import SurveyViewBar from "@/components/surveys/SurveyViewBar";
import SurveyFilterBar from "@/components/surveys/SurveyFilterBar";
import SurveyColumnConfig from "@/components/surveys/SurveyColumnConfig";
import SurveyTable from "@/components/surveys/SurveyTable";
import SurveyCardList from "@/components/surveys/SurveyCardList";
import { iconForPath, pageLabel } from "@/lib/nav";
import { useSurveyTableStore } from "@/store/surveyTable";
import {
  SURVEY_OVERVIEW_ID,
  useActiveSurveyViewState,
  useSurveyViewsStore,
} from "@/store/surveyViews";

export default function SurveysPage() {
  const { pathname } = useLocation();
  const { search, setSearch } = useSurveyTableStore();
  const { layout } = useActiveSurveyViewState();
  const isOverview = useSurveyViewsStore(
    (s) => s.activeViewId === SURVEY_OVERVIEW_ID
  );

  return (
    <>
      <PageHeader title={pageLabel(pathname)} icon={iconForPath(pathname)} />
      <p className="px-12 text-sm text-muted-foreground">
        Get feedback from visitors with surveys using custom triggers.
      </p>

      <div className="px-12 pb-12 pt-8">
        <SurveyViewBar />
        {isOverview ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-border bg-background text-center">
            <p className="text-sm font-medium text-foreground">Coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              An overview of your Pulse surveys will live here.
            </p>
          </div>
        ) : (
          <>
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
              <SurveyFilterBar />
              <div className="ml-auto flex items-center gap-2">
                {layout === "table" && <SurveyColumnConfig />}
              </div>
            </div>

            {layout === "table" ? <SurveyTable /> : <SurveyCardList />}
          </>
        )}
      </div>
    </>
  );
}
