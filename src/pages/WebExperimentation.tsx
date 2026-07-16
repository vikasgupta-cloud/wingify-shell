import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import CampaignTable from "../components/table/CampaignTable";
import ColumnConfig from "../components/table/ColumnConfig";
import FilterBar from "../components/table/FilterBar";
import ViewBar from "../components/table/ViewBar";
import LayoutSwitcher, { getLayouts } from "../components/table/LayoutSwitcher";
import BoardColumnConfig from "../components/kanban/BoardColumnConfig";
import KanbanBoard from "../components/kanban/KanbanBoard";
import GanttChart from "../components/gantt/GanttChart";
import QuickViewPanel from "../components/quickview/QuickViewPanel";
import PageHeader from "../components/layout/PageHeader";
import { iconForPath, pageLabel } from "../lib/nav";
import { useTableStore } from "../store/table";
import { useActiveViewState } from "../store/views";
import { useQuickViewStore } from "../store/quickView";

export default function WebExperimentation() {
  const { search, setSearch } = useTableStore();
  const { pathname } = useLocation();
  const { layout, filters, groupBy } = useActiveViewState();
  const layouts = getLayouts(pathname);
  const openId = useQuickViewStore((s) => s.openId);
  const closeQuickView = useQuickViewStore((s) => s.close);

  // The panel must not linger on stale content: close it when the layout, filters,
  // search, or grouping change. Skip the very first run so opening it doesn't self-close.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    closeQuickView();
  }, [layout, filters, groupBy, search, closeQuickView]);

  return (
    <>
      <PageHeader title={pageLabel(pathname)} icon={iconForPath(pathname)} />
      {/*
        Header → toolbar gap is exactly 32px (pt-8). ViewBar sits first in this
        region: when it renders nothing (no saved views and not dirty) it returns
        null, so the toolbar sits at the 32px gap; when it renders tabs and/or
        Discard/Save view, it occupies the region and the spacing grows naturally.
      */}
      <div className="px-12 pb-12 pt-8">
        <ViewBar />
        <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex w-72 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns…"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <FilterBar />
          {/* Right cluster, aligned to the table's right edge. */}
          <div className="ml-auto flex items-center gap-2">
            {layout === "table" && <ColumnConfig />}
            {layout === "kanban" && <BoardColumnConfig />}
            {layouts.length > 1 && <LayoutSwitcher layouts={layouts} />}
          </div>
        </div>

        {/*
          Push layout: the current view keeps flex-1 (min-w-0 is REQUIRED so the
          table's overflow-x-auto can actually shrink) and the Quick view panel
          sits beside it at a fixed 480px, pushing content narrower — no overlay.
        */}
        <div className="flex items-start gap-0">
          <div className="min-w-0 flex-1">
            {layout === "table" && <CampaignTable />}
            {layout === "kanban" && <KanbanBoard />}
            {layout === "gantt" && <GanttChart />}
          </div>
          {openId && (
            <div className="sticky top-6 h-[calc(100vh-3rem)] w-[480px] shrink-0 self-start overflow-hidden border-l border-border">
              <QuickViewPanel />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
