/** Configuration → Pages — page-groups sidebar + definition detail (screenshot layout).
 * Reuses shadcn Input, Tabs, Tooltip.
 */

import { useMemo, useState } from "react";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Search,
} from "@/components/icons/protoLucide";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ARCHIVED_PAGE_GROUPS_COUNT,
  PAGE_GROUPS,
  type PageGroup,
  type PageUrlRule,
} from "@/data/pageGroups";
import { cn } from "@/lib/utils";

const DETAIL_TABS = [
  { id: "definition", label: "Definition" },
  { id: "metadata", label: "Metadata" },
  { id: "campaigns", label: "Campaigns" },
  { id: "metrics", label: "Metrics" },
  { id: "page-groups", label: "Page groups" },
  { id: "timeline", label: "Timeline" },
] as const;

function RuleRow({ rule }: { rule: PageUrlRule }) {
  return (
    <li className="flex items-center gap-1.5 text-sm text-foreground">
      <span>
        {rule.operator}{" "}
        <span className="font-semibold">{rule.value}</span>
      </span>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex text-muted-foreground hover:text-foreground"
              aria-label={`About ${rule.value}`}
            >
              <Info className="size-3.5" strokeWidth={1.75} aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Matches URLs that contain “{rule.value}”.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </li>
  );
}

function DefinitionPanel({ group }: { group: PageGroup }) {
  return (
    <div className="rounded-xl border border-border bg-background px-6 py-6 shadow-sm">
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Included pages
        </h3>
        <ul className="space-y-2.5">
          {group.included.map((rule) => (
            <RuleRow key={rule.id} rule={rule} />
          ))}
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Excluded pages
        </h3>
        <ul className="space-y-2.5">
          {group.excluded.map((rule) => (
            <RuleRow key={rule.id} rule={rule} />
          ))}
        </ul>
      </section>

      <section className="mt-8 space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Default URL</h3>
        <p className="text-sm text-foreground">{group.defaultUrl}</p>
      </section>
    </div>
  );
}

function ComingSoonPanel({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-6 py-16 text-center text-sm text-muted-foreground shadow-sm">
      {label} for this page group is coming soon.
    </div>
  );
}

export default function PagesPage() {
  const [query, setQuery] = useState("");
  const [groupsOpen, setGroupsOpen] = useState(true);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(PAGE_GROUPS[0]?.id ?? "");

  const activeGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PAGE_GROUPS;
    return PAGE_GROUPS.filter((g) => g.name.toLowerCase().includes(q));
  }, [query]);

  const selected =
    activeGroups.find((g) => g.id === selectedId) ??
    activeGroups[0] ??
    PAGE_GROUPS[0];

  return (
    <div className="flex h-full min-h-0 w-full gap-10 px-8 pb-16 pt-8">
      {/* Page-groups list — same top edge as the detail title */}
      <aside className="flex w-[240px] shrink-0 flex-col gap-3">
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search page groups"
            aria-label="Search page groups"
            className="h-9 bg-background pr-8 shadow-none"
          />
          <Search
            className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => setGroupsOpen((o) => !o)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-foreground hover:bg-muted/60"
          >
            <Layers className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 flex-1 truncate">
              Page groups ({PAGE_GROUPS.length})
            </span>
            {groupsOpen ? (
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
            )}
          </button>

          {groupsOpen && (
            <ul className="mt-0.5 flex flex-col gap-0.5 pb-3">
              {activeGroups.length === 0 ? (
                <li className="px-2 py-2 text-xs text-muted-foreground">
                  No page groups match.
                </li>
              ) : (
                activeGroups.map((group) => {
                  const active = group.id === selected?.id;
                  return (
                    <li key={group.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(group.id)}
                        className={cn(
                          "w-full truncate rounded-md px-2 py-2 text-left text-sm transition-colors",
                          active
                            ? "bg-muted font-medium text-foreground"
                            : "text-foreground hover:bg-muted/60"
                        )}
                      >
                        {group.name}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          )}

          <button
            type="button"
            onClick={() => setArchivedOpen((o) => !o)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-foreground hover:bg-muted/60"
          >
            <Archive className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 flex-1 truncate">Archived page groups</span>
            <span className="rounded-full bg-muted/80 px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
              {ARCHIVED_PAGE_GROUPS_COUNT}
            </span>
            {archivedOpen ? (
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
            )}
          </button>
          {archivedOpen && (
            <p className="px-2 py-2 text-xs text-muted-foreground">
              No archived page groups in this workspace mock.
            </p>
          )}
        </div>
      </aside>

      {/* Detail — title shares the row with the search field */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        {selected ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {selected.name}
            </h1>

            <Tabs defaultValue="definition" className="mt-5 w-full">
              <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
                {DETAIL_TABS.map((tab, index) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "rounded-none border-b-2 border-transparent py-2.5 text-sm data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                      index === 0 ? "pr-4 pl-0" : "px-4"
                    )}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent
                value="definition"
                className="mt-6 focus-visible:outline-none"
              >
                <DefinitionPanel group={selected} />
              </TabsContent>
              <TabsContent value="metadata" className="mt-6">
                <ComingSoonPanel label="Metadata" />
              </TabsContent>
              <TabsContent value="campaigns" className="mt-6">
                <ComingSoonPanel label="Campaigns" />
              </TabsContent>
              <TabsContent value="metrics" className="mt-6">
                <ComingSoonPanel label="Metrics" />
              </TabsContent>
              <TabsContent value="page-groups" className="mt-6">
                <ComingSoonPanel label="Page groups" />
              </TabsContent>
              <TabsContent value="timeline" className="mt-6">
                <ComingSoonPanel label="Timeline" />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Select a page group.</p>
        )}
      </div>
    </div>
  );
}
