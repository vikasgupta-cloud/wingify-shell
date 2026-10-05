import { useState } from "react";
import {
  ChevronDown,
  Filter,
  FlaskConical,
  Search,
  Trophy,
} from "@/components/icons/protoLucide";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TestStatus = "Completed" | "Draft";

type SyntheticTest = {
  id: string;
  name: string;
  progressDone: number;
  progressTotal: number;
  progressLabel: string;
  status: TestStatus;
  variations: number;
  participants: number;
  decision: string | null;
  createdAt: string;
};

const TESTS: SyntheticTest[] = [
  {
    id: "16",
    name: "Synthetic A/B Test 16",
    progressDone: 5,
    progressTotal: 5,
    progressLabel: "All 5 done",
    status: "Completed",
    variations: 2,
    participants: 10,
    decision: "Control wins 80% confidence",
    createdAt: "28 Sep, 2026 17:11",
  },
  {
    id: "15",
    name: "Synthetic A/B Test 15",
    progressDone: 5,
    progressTotal: 5,
    progressLabel: "All 5 done",
    status: "Completed",
    variations: 2,
    participants: 100,
    decision: "Variation wins 90% confidence",
    createdAt: "28 Sep, 2026 16:48",
  },
  {
    id: "14",
    name: "Synthetic A/B Test 14",
    progressDone: 4,
    progressTotal: 5,
    progressLabel: "4 of 5 Next: Review setup",
    status: "Draft",
    variations: 0,
    participants: 0,
    decision: null,
    createdAt: "27 Sep, 2026 12:03",
  },
  {
    id: "13",
    name: "Synthetic A/B Test 13",
    progressDone: 2,
    progressTotal: 5,
    progressLabel: "2 of 5 Next: Add variations",
    status: "Draft",
    variations: 0,
    participants: 0,
    decision: null,
    createdAt: "26 Sep, 2026 09:22",
  },
  {
    id: "12",
    name: "Synthetic A/B Test 12",
    progressDone: 5,
    progressTotal: 5,
    progressLabel: "All 5 done",
    status: "Completed",
    variations: 2,
    participants: 48,
    decision: "Control wins 75% confidence",
    createdAt: "24 Sep, 2026 18:05",
  },
];

export default function WingzSyntheticAbPage() {
  const [search, setSearch] = useState("");

  const filtered = TESTS.filter((row) => {
    if (!search.trim()) return true;
    return row.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-16">
      <PageHeader title="Synthetic A/B" icon={FlaskConical} />

      <div className="space-y-6 px-12 pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-72 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            Status
            <ChevronDown className="size-3.5" aria-hidden />
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <Filter className="size-3.5" aria-hidden />
            More filters
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-medium text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Variations</th>
                <th className="px-4 py-3 font-medium">Participants</th>
                <th className="px-4 py-3 font-medium">Decision</th>
                <th className="px-4 py-3 font-medium">Created at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row) => {
                const pct =
                  row.progressTotal === 0
                    ? 0
                    : (row.progressDone / row.progressTotal) * 100;
                const complete = row.progressDone === row.progressTotal;

                return (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        className="font-medium text-foreground hover:underline"
                      >
                        {row.name}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="min-w-[10rem] space-y-1.5">
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              complete
                                ? "bg-[var(--status-running-fg)]"
                                : "bg-muted-foreground/40"
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {row.progressLabel}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        tone={row.status === "Completed" ? "ocean" : "amber"}
                        fill="light"
                        size="sm"
                        variant="pill"
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-foreground">
                      {row.variations}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-foreground">
                      {row.participants}
                    </td>
                    <td className="px-4 py-3.5">
                      {row.decision ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
                          <Trophy
                            className="size-3.5 shrink-0 text-[var(--status-running-fg)]"
                            aria-hidden
                          />
                          {row.decision}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {row.createdAt}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
