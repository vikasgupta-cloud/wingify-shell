import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CirclePlus,
  Clock,
  MoreHorizontal,
  Search,
  Share2,
  Sparkles,
} from "@/components/icons/protoLucide";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TEMPLATES = [
  {
    id: "scratch",
    title: "Start from scratch",
    description: "Build a custom workflow from the ground up.",
    scratch: true,
  },
  {
    id: "debrief",
    title: "Automated Campaign Debrief",
    description:
      "Summarize experiment results and share winners with stakeholders.",
  },
  {
    id: "anomaly",
    title: "Metric Anomaly Watcher",
    description: "Alert your team when key metrics drift outside expected ranges.",
  },
  {
    id: "heatmap",
    title: "Heatmap Digest",
    description: "Send a weekly digest of heatmap insights to your Slack channel.",
  },
] as const;

const WORKFLOWS = [
  {
    id: "1",
    name: "Weekly campaign health check",
    description: "Pulls live campaign metrics and flags at-risk tests.",
    status: "Paused" as const,
    trigger: "Event Based" as const,
    lastRun: "Never",
    createdAt: "01 Oct, 2026 16:24",
  },
  {
    id: "2",
    name: "Losing variation digests",
    description: "Emails a digest when a variation underperforms control.",
    status: "Paused" as const,
    trigger: "Time Based" as const,
    lastRun: "Never",
    createdAt: "01 Oct, 2026 14:02",
  },
  {
    id: "3",
    name: "New winner announcements",
    description: "Posts to Slack when a test reaches decision-ready confidence.",
    status: "Paused" as const,
    trigger: "Event Based" as const,
    lastRun: "Never",
    createdAt: "30 Sep, 2026 11:18",
  },
  {
    id: "4",
    name: "Nightly heatmap snapshot",
    description: "Archives top heatmap pages for the behavior analytics team.",
    status: "Paused" as const,
    trigger: "Time Based" as const,
    lastRun: "Never",
    createdAt: "28 Sep, 2026 09:40",
  },
];

export default function WingzWorkflowsPage() {
  const [search, setSearch] = useState("");
  const [templatesHidden, setTemplatesHidden] = useState(false);

  const filtered = WORKFLOWS.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      row.name.toLowerCase().includes(q) ||
      row.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-16">
      <PageHeader title="Workflows" icon={Share2} />

      <div className="space-y-8 px-12 pt-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              Choose a workflow template
            </h2>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm">
                See all
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setTemplatesHidden((v) => !v)}
              >
                {templatesHidden ? "Show" : "Hide"}
                {templatesHidden ? (
                  <ChevronDown className="size-3.5" aria-hidden />
                ) : (
                  <ChevronUp className="size-3.5" aria-hidden />
                )}
              </Button>
              <div className="ml-1 flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label="Previous templates"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label="Next templates"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {!templatesHidden && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className="flex w-56 shrink-0 flex-col gap-3 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-muted"
                >
                  {template.scratch ? (
                    <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                      <CirclePlus className="size-5" aria-hidden />
                    </span>
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded-md text-foreground">
                      <Sparkles className="size-4" aria-hidden />
                    </span>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {template.title}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex w-72 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search.."
                className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              More filters
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Workflow</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Triggers</th>
                  <th className="px-4 py-3 font-medium">Last Run</th>
                  <th className="px-4 py-3 font-medium">Created at</th>
                  <th className="w-12 px-2 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-foreground">{row.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {row.description}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone="neutral" fill="light" size="sm" variant="pill">
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-foreground">
                        {row.trigger === "Event Based" ? (
                          <Calendar className="size-3.5 text-muted-foreground" />
                        ) : (
                          <Clock className="size-3.5 text-muted-foreground" />
                        )}
                        {row.trigger}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {row.lastRun}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {row.createdAt}
                    </td>
                    <td className="px-2 py-3.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Actions for ${row.name}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
