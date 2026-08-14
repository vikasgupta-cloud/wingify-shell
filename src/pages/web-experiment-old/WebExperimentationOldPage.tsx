import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Hourglass,
  LayoutGrid,
  List,
  Plus,
  Search,
  Settings,
  Sparkles,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/components/ui/StatusBadge";
import { TYPE_ICONS } from "@/components/icons/campaignTypeIcons";
import { iconForPath, pageLabel } from "@/lib/nav";
import { CAMPAIGN_STATUSES, type CampaignType } from "@/data/campaigns";
import { useVisibleCampaigns } from "@/store/rows";
import { oldLandingPath } from "./oldFlow";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TYPES: CampaignType[] = ["A/B", "MVT", "Split URL", "Multipage"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function WebExperimentationOldPage() {
  const { pathname } = useLocation();
  const rows = useVisibleCampaigns();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [layout, setLayout] = useState<"list" | "grid">("list");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (type !== "all" && c.type !== type) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.url.toLowerCase().includes(q) ||
        c.id.includes(q)
      );
    });
  }, [rows, query, status, type]);

  const Icon = iconForPath(pathname);

  return (
    <div className="flex min-h-full flex-col pb-16">
      <div className="flex items-start justify-between px-12 pt-10">
        <div className="flex items-start gap-4">
          {Icon && (
            <Icon
              className="mt-1 size-8 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden
            />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-title text-3xl font-semibold tracking-tight text-foreground">
                {pageLabel(pathname)}
              </h1>
              <Button
                type="button"
                variant="link"
                className="h-auto gap-1.5 px-0 text-sm text-brand-deep hover:text-brand-deep/80"
              >
                <Sparkles className="size-3.5" />
                Summarize
              </Button>
            </div>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Measure page version performance with A/B, Split and Multivariate tests.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" size="icon" aria-label="History">
          <Hourglass className="size-4" />
        </Button>
      </div>

      <div className="mt-8 space-y-4 px-12">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex w-64 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status</SelectItem>
              {CAMPAIGN_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="any">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Creation Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Creation Date</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Campaign type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Campaign type</SelectItem>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="ghost" size="sm">
            Add filter
            <Plus className="size-3.5" />
          </Button>
          <div className="ml-auto flex items-center rounded-md border border-border p-0.5">
            <Button
              type="button"
              variant={layout === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setLayout("grid")}
              aria-label="Grid"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              type="button"
              variant={layout === "list" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setLayout("list")}
              aria-label="List"
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-2.5">
                  <Checkbox aria-label="Select all" />
                </th>
                <th className="px-3 py-2.5 font-medium">
                  <span className="inline-flex items-center gap-1">
                    Campaign Name <ChevronDown className="size-3" />
                  </span>
                </th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Variations/Combinations</th>
                <th className="px-3 py-2.5 font-medium">Visitors</th>
                <th className="px-3 py-2.5 font-medium">Improvement</th>
                <th className="px-3 py-2.5 font-medium">Vitals</th>
                <th className="px-3 py-2.5 font-medium">Decision</th>
                <th className="px-3 py-2.5 font-medium">Created On</th>
                <th className="px-3 py-2.5 font-medium">ID</th>
                <th className="px-3 py-2.5 font-medium">Labels</th>
                <th className="w-10 px-3 py-2.5">
                  <Settings className="size-3.5" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const TypeIcon = TYPE_ICONS[c.type];
                return (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-3">
                      <Checkbox aria-label={`Select ${c.name}`} />
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        to={oldLandingPath(c.status, c.id)}
                        className="flex items-start gap-2 hover:underline"
                      >
                        {TypeIcon && (
                          <TypeIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span>
                          <span className="block font-medium text-foreground">{c.name}</span>
                          <span className="block text-xs text-muted-foreground">{c.url}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-3 py-3 tabular-nums">{c.variations || "–"}</td>
                    <td className="px-3 py-3 tabular-nums">
                      {c.visitors ? c.visitors.toLocaleString("en-US") : "0"}
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {c.expectedImprovement
                        ? `${c.expectedImprovement.toFixed(1)}%`
                        : "–"}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">–</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.decision || "–"}</td>
                    <td className="px-3 py-3">
                      <span className="block">{formatDate(c.createdOn)}</span>
                      <span className="block text-xs text-muted-foreground">
                        by {c.createdBy}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-number tabular-nums">{c.id}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {c.labels[0] ?? "–"}
                    </td>
                    <td />
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
