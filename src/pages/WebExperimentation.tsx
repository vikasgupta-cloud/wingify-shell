import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import CampaignTable from "../components/table/CampaignTable";
import ColumnConfig from "../components/table/ColumnConfig";
import FilterBar from "../components/table/FilterBar";
import ViewBar from "../components/table/ViewBar";
import BoardColumnConfig from "../components/kanban/BoardColumnConfig";
import KanbanBoard from "../components/kanban/KanbanBoard";
import GanttChart from "../components/gantt/GanttChart";
import GanttControls from "../components/gantt/GanttControls";
import QuickViewPanel from "../components/quickview/QuickViewPanel";
import WandzPanel from "../components/wandz/WandzPanel";
import PageHeader from "../components/layout/PageHeader";
import { iconForPath, pageLabel } from "../lib/nav";
import { useTableStore } from "../store/table";
import { OVERVIEW_ID, useActiveViewState, useViewsStore } from "../store/views";
import { useQuickViewStore } from "../store/quickView";
import { useWandzStore } from "../store/wandz";

export default function WebExperimentation() {
  const { search, setSearch } = useTableStore();
  const { pathname } = useLocation();
  const { layout, filters, groupBy } = useActiveViewState();
  const isOverview = useViewsStore((s) => s.activeViewId === OVERVIEW_ID);
  const openId = useQuickViewStore((s) => s.openId);
  const closeQuickView = useQuickViewStore((s) => s.close);
  const wandzOpen = useWandzStore((s) => s.open);

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

  // The sticky Quick view must never exceed the viewport, whatever the screen size
  // or scroll position. Its height = distance from its live top to a 24px gap above
  // the viewport bottom, so its footer buttons are always in view. Recomputed on
  // page scroll (its top rises as the header scrolls away) and on resize.
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelMaxH, setPanelMaxH] = useState<number>();
  useLayoutEffect(() => {
    if (!openId) return;
    const node = panelRef.current;
    const scroller = node?.closest("main");
    const update = () => {
      const el = panelRef.current;
      if (!el || !scroller) return;
      const top = el.getBoundingClientRect().top;
      // Bottom of the scroll viewport (main runs to the screen bottom); measuring an
      // element rect avoids the flaky 100vh/clientHeight readings in some contexts.
      const bottom = scroller.getBoundingClientRect().bottom;
      const avail = bottom - top - 24; // 24px gap above the viewport bottom
      // Ignore transient invalid layouts (0-height reads) so a bad value can't lock
      // in; the CSS max-h fallback covers that window.
      if (avail > 120) setPanelMaxH(avail);
    };
    update();
    scroller?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [openId]);

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
        {isOverview ? (
          // Overview is a fixed lead tab, not a view: no toolbar, no data grid.
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-border bg-background text-center">
            <p className="text-sm font-medium text-foreground">Coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              An overview of your Web Experimentation activity will live here.
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
              placeholder="Search campaigns…"
              className="h-auto border-0 bg-transparent px-0 py-0 text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
          <FilterBar />
          {/* Right cluster, aligned to the table's right edge. Layout is fixed per
              view, so there is no layout switcher — just the layout's own config. */}
          <div className="ml-auto flex items-center gap-2">
            {layout === "table" && <ColumnConfig />}
            {layout === "kanban" && <BoardColumnConfig />}
            {layout === "gantt" && <GanttControls />}
          </div>
        </div>

        {/*
          Flowing layout: the page scrolls and each layout's card grows to fit its
          content. The Quick view panel is a sticky card that pins below the TopBar
          while the page scrolls; when its own content is taller than the viewport
          it scrolls internally (its body is the overflow container).
        */}
        <div className="flex items-start gap-6">
          <div className="min-w-0 flex-1">
            {layout === "table" && <CampaignTable />}
            {layout === "kanban" && <KanbanBoard />}
            {layout === "gantt" && <GanttChart />}
          </div>
          {openId && (
            // Height is measured live (see panelMaxH) so the footer stays in view at
            // any screen size or scroll position; the vh-based value is a first-paint
            // fallback until the layout effect runs.
            <div
              ref={panelRef}
              style={panelMaxH ? { maxHeight: panelMaxH } : undefined}
              className="sticky top-6 flex max-h-[calc(100vh-56px-3rem)] w-[480px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-background"
            >
              <QuickViewPanel />
            </div>
          )}
          {/* The stores close each other, so at most one panel ever renders. */}
          {wandzOpen && <WandzPanel />}
        </div>
          </>
        )}
      </div>
    </>
  );
}
