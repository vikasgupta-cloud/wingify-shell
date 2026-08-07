// Feature Management → Feature Flags — Surveys-style views/filters/columns; no status.
// Create comes from the shell TopBar.

import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/layout/PageHeader";
import FlagViewBar from "@/components/feature-flags/FlagViewBar";
import FlagFilterBar from "@/components/feature-flags/FlagFilterBar";
import FlagColumnConfig from "@/components/feature-flags/FlagColumnConfig";
import FlagTable from "@/components/feature-flags/FlagTable";
import FlagCardList from "@/components/feature-flags/FlagCardList";
import { iconForPath, pageLabel } from "@/lib/nav";
import { useFlagTableStore } from "@/store/flagTable";
import {
  FLAG_OVERVIEW_ID,
  useActiveFlagViewState,
  useFlagViewsStore,
} from "@/store/flagViews";

export default function FeatureFlagsPage() {
  const { pathname } = useLocation();
  const { search, setSearch } = useFlagTableStore();
  const { layout } = useActiveFlagViewState();
  const isOverview = useFlagViewsStore(
    (s) => s.activeViewId === FLAG_OVERVIEW_ID
  );

  return (
    <>
      <PageHeader title={pageLabel(pathname)} icon={iconForPath(pathname)} />
      <p className="px-12 text-sm text-muted-foreground">
        Create a Feature Flag.
      </p>

      <div className="px-12 pb-12 pt-8">
        <FlagViewBar />
        {isOverview ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-border bg-background text-center">
            <p className="text-sm font-medium text-foreground">Coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              An overview of your feature flags will live here.
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
              <FlagFilterBar />
              <div className="ml-auto flex items-center gap-2">
                {layout === "table" && <FlagColumnConfig />}
              </div>
            </div>

            {layout === "table" ? <FlagTable /> : <FlagCardList />}
          </>
        )}
      </div>
    </>
  );
}
