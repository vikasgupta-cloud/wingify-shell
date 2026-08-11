// Personalize listing — Web Exp–parity views (table / kanban / gantt) with own stores & data.
// Quick view hover is present but disabled; Wandz opens. Campaign click → Coming soon detail.

import { useEffect, useRef } from "react";
import { Search } from "@/components/icons/protoLucide";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/layout/PageHeader";
import WandzPanel from "@/components/wandz/WandzPanel";
import PersonalizeViewBar from "@/components/personalize/PersonalizeViewBar";
import PersonalizeFilterBar from "@/components/personalize/PersonalizeFilterBar";
import PersonalizeColumnConfig from "@/components/personalize/PersonalizeColumnConfig";
import PersonalizeBoardColumnConfig from "@/components/personalize/PersonalizeBoardColumnConfig";
import PersonalizeGanttControls from "@/components/personalize/PersonalizeGanttControls";
import PersonalizeTable from "@/components/personalize/PersonalizeTable";
import PersonalizeKanbanBoard from "@/components/personalize/PersonalizeKanbanBoard";
import PersonalizeGanttChart from "@/components/personalize/PersonalizeGanttChart";
import { iconForPath, pageLabel } from "@/lib/nav";
import { usePersonalizeTableStore } from "@/store/personalizeTable";
import {
  PERSONALIZE_OVERVIEW_ID,
  useActivePersonalizeViewState,
  usePersonalizeViewsStore,
} from "@/store/personalizeViews";
import { useWandzStore } from "@/store/wandz";

export default function PersonalizePage() {
  const { search, setSearch } = usePersonalizeTableStore();
  const { pathname } = useLocation();
  const { layout, filters, groupBy } = useActivePersonalizeViewState();
  const isOverview = usePersonalizeViewsStore(
    (s) => s.activeViewId === PERSONALIZE_OVERVIEW_ID
  );
  const wandzOpen = useWandzStore((s) => s.open);

  // Close nothing for quick view (disabled); keep Wandz mount for hover AI.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
    }
  }, [layout, filters, groupBy, search]);

  return (
    <>
      <PageHeader title={pageLabel(pathname)} icon={iconForPath(pathname)} />
      <div className="px-12 pb-12 pt-8">
        <PersonalizeViewBar />
        {isOverview ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-border bg-background text-center">
            <p className="text-sm font-medium text-foreground">Coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              An overview of your Personalize activity will live here.
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
              <PersonalizeFilterBar />
              <div className="ml-auto flex items-center gap-2">
                {layout === "table" && <PersonalizeColumnConfig />}
                {layout === "kanban" && <PersonalizeBoardColumnConfig />}
                {layout === "gantt" && <PersonalizeGanttControls />}
              </div>
            </div>

            <div className="flex items-stretch gap-6">
              <div className="min-w-0 flex-1">
                {layout === "table" && <PersonalizeTable />}
                {layout === "kanban" && <PersonalizeKanbanBoard />}
                {layout === "gantt" && <PersonalizeGanttChart />}
              </div>
            </div>
          </>
        )}
      </div>
      {wandzOpen && <WandzPanel />}
    </>
  );
}
