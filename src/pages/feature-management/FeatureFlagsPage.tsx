// Feature Management → Feature Flags — Surveys-style views/filters/columns; no status.
// Create comes from the shell TopBar.

import { Search } from "@/components/icons/protoLucide";
import { Input } from "@/components/ui/input";
import FlagViewBar from "@/components/feature-flags/FlagViewBar";
import FlagFilterBar from "@/components/feature-flags/FlagFilterBar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useFlagPipeline } from "@/components/feature-flags/useFlagPipeline";
import FlagEnvironmentTable from "@/components/feature-flags/FlagEnvironmentTable";
import { useFlagTableStore } from "@/store/flagTable";
import {
  FLAG_OVERVIEW_ID,
  useFlagViewsStore,
} from "@/store/flagViews";

export default function FeatureFlagsPage() {
  const { search, setSearch, createdFrom, createdTo, setCreatedRange } = useFlagTableStore();
  const rows = useFlagPipeline();
  const isOverview = useFlagViewsStore(
    (s) => s.activeViewId === FLAG_OVERVIEW_ID
  );

  return (
    <>
      <div className="px-12 pb-12 pt-10">
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
                  aria-label="Search feature flags"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="h-auto border-0 bg-transparent px-0 py-0 text-foreground shadow-none focus-visible:ring-0"
                />
              </div>
              <Popover><PopoverTrigger asChild><Button variant="outline" size="sm">{createdFrom || createdTo ? `${createdFrom || 'Any date'} – ${createdTo || 'Today'}` : 'Created date range'}</Button></PopoverTrigger>
                <PopoverContent align="start" className="space-y-3">
                  <p className="text-sm font-medium">Created date range</p>
                  <div className="space-y-1"><Label htmlFor="flag-created-from">From</Label><Input id="flag-created-from" type="date" value={createdFrom} max={createdTo || undefined} onInput={e => setCreatedRange(e.currentTarget.value, createdTo)} onChange={e => setCreatedRange(e.target.value, createdTo)} /></div>
                  <div className="space-y-1"><Label htmlFor="flag-created-to">To</Label><Input id="flag-created-to" type="date" value={createdTo} min={createdFrom || undefined} onInput={e => setCreatedRange(createdFrom, e.currentTarget.value)} onChange={e => setCreatedRange(createdFrom, e.target.value)} /></div>
                  <Button variant="ghost" size="sm" onClick={() => setCreatedRange('', '')}>Clear dates</Button>
                </PopoverContent>
              </Popover>
              <FlagFilterBar />

            </div>

            <FlagEnvironmentTable rows={rows} />
          </>
        )}
      </div>
    </>
  );
}
