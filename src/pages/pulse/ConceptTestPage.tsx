// Pulse → ConceptTests — WE-style views/filters/columns with concept test data; table + card layouts.
// Create comes from the shell TopBar (no page-level Create button).

import { LayoutGrid, Rows3, Search } from "@/components/icons/protoLucide";
import { Input } from "@/components/ui/input";
import ConceptTestViewBar from "@/components/concept-tests/ConceptTestViewBar";
import ConceptTestFilterBar from "@/components/concept-tests/ConceptTestFilterBar";
import ConceptTestTable from "@/components/concept-tests/ConceptTestTable";
import ConceptTestCardList from "@/components/concept-tests/ConceptTestCardList";
import { useConceptTestTableStore } from "@/store/conceptTestTable";
import {
  CONCEPT_TEST_OVERVIEW_ID,
  useActiveConceptTestViewState,
  useConceptTestViewsStore,
  type ConceptTestLayout,
} from "@/store/conceptTestViews";
import { cn } from "@/lib/utils";

export default function ConceptTestPage() {
  const { search, setSearch } = useConceptTestTableStore();
  const { layout } = useActiveConceptTestViewState();
  const updateDraft = useConceptTestViewsStore((s) => s.updateActiveViewDraft);
  const isOverview = useConceptTestViewsStore(
    (s) => s.activeViewId === CONCEPT_TEST_OVERVIEW_ID
  );

  const setLayout = (next: ConceptTestLayout) => updateDraft({ layout: next });

  return (
    <>
      <div className="px-12 pb-12 pt-10">
        <ConceptTestViewBar />
        {isOverview ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-border bg-background text-center">
            <p className="text-sm font-medium text-foreground">Coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              An overview of your Pulse concept tests will live here.
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
              <ConceptTestFilterBar />
              <div
                role="group"
                aria-label="Layout"
                className="ml-auto inline-flex rounded-md border border-border bg-background p-0.5"
              >
                <button
                  type="button"
                  aria-pressed={layout === "table"}
                  aria-label="Table view"
                  onClick={() => setLayout("table")}
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded transition-colors",
                    layout === "table"
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="size-3.5" strokeWidth={1.75} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-pressed={layout === "card"}
                  aria-label="Card view"
                  onClick={() => setLayout("card")}
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded transition-colors",
                    layout === "card"
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Rows3 className="size-3.5" strokeWidth={1.75} aria-hidden />
                </button>
              </div>
            </div>

            {layout === "table" ? <ConceptTestTable /> : <ConceptTestCardList />}
          </>
        )}
      </div>
    </>
  );
}
