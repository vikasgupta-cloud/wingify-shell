/** Strategy editor — empty strategy layout (kick-off, pins, results stubs). */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  History,
  Info,
  LayoutGrid,
  List,
  Pencil,
  Pin,
  Plus,
  Settings,
  Square,
  ShoppingCart,
} from "@/components/icons/protoLucide";
import RulePickerDialog from "@/components/recommendations/RulePickerDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useRecommendationRowsStore,
  useVisibleRecommendations,
} from "@/store/recommendationRows";
import { cn } from "@/lib/utils";

export default function RecommendationDetailPage() {
  const { entityId = "" } = useParams();
  const navigate = useNavigate();
  const rows = useVisibleRecommendations();
  const update = useRecommendationRowsStore((s) => s.update);
  const row = rows.find((r) => r.id === entityId);

  const [name, setName] = useState(row?.name ?? "New recommendation");
  const [editingName, setEditingName] = useState(false);
  const [resultsMax, setResultsMax] = useState(12);
  const [displayThreshold, setDisplayThreshold] = useState(0);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [view, setView] = useState<"gift" | "grid" | "list">("gift");

  useEffect(() => {
    if (!row) return;
    setName(row.name);
  }, [row]);

  if (!row) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-12 text-center">
        <p className="text-sm font-medium text-foreground">
          Recommendation not found
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/commerce/recommendation")}
        >
          Back to list
        </Button>
      </div>
    );
  }

  const save = () => {
    update(row.id, { name: name.trim() || row.name });
  };

  const placeholders = Array.from({ length: Math.max(resultsMax, 0) }, (_, i) => i);

  return (
    <div className="flex h-full flex-col bg-canvas text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label="Back to strategies"
            onClick={() => navigate("/commerce/recommendation")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {editingName ? (
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => {
                    setEditingName(false);
                    save();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setEditingName(false);
                      save();
                    }
                  }}
                  className="h-8 max-w-xs font-sans text-sm font-semibold"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="inline-flex max-w-md items-center gap-1.5 truncate font-sans text-sm font-semibold text-foreground"
                >
                  <span className="truncate">{name}</span>
                  <Pencil className="size-3.5 shrink-0 text-muted-foreground" />
                </button>
              )}
              <span className="inline-flex rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground">
                {row.status.startsWith("Deployed") ? row.status : "Draft"}
              </span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Last deployment: Never
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Help">
            <HelpCircle className="size-4 text-muted-foreground" />
          </Button>
          <div className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <Button type="button" variant="secondary" size="sm" disabled>
            Save
          </Button>
          <Button type="button" variant="default" size="sm" disabled>
            Save and deploy
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="Settings">
            <Settings className="size-4 text-muted-foreground" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" aria-label="History">
            <History className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:p-6">
        <aside className="flex w-full max-w-md shrink-0 flex-col overflow-y-auto rounded-xl border border-border bg-background lg:w-[380px]">
          <div className="flex flex-1 flex-col items-center justify-center gap-4 border-b border-border px-6 py-10 text-center">
            <span className="flex size-10 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
              <Square className="size-4" aria-hidden />
            </span>
            <p className="max-w-[220px] font-sans text-sm text-muted-foreground">
              Kick off your strategy by adding a first rule…
            </p>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="gap-1.5"
              onClick={() => setRuleOpen(true)}
            >
              New rule
              <Plus className="size-3.5" />
            </Button>
          </div>

          <div className="space-y-5 px-5 py-5">
            <section>
              <p className="mb-2 font-sans text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Pins
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 font-sans text-sm text-foreground hover:underline"
              >
                <Pin className="size-3.5 text-muted-foreground" aria-hidden />
                Pin product(s)
              </button>
            </section>

            <section>
              <p className="mb-2 font-sans text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Global customization
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 font-sans text-sm text-foreground hover:underline"
              >
                <Plus className="size-3.5 text-muted-foreground" aria-hidden />
                New global customization (filter, exclude, sort…)
              </button>
            </section>

            <section>
              <p className="mb-3 font-sans text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Display rules
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="inline-flex items-center gap-1 font-sans text-xs text-muted-foreground">
                    Results maximum
                    <Info className="size-3" aria-hidden />
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={48}
                    value={resultsMax}
                    onChange={(e) =>
                      setResultsMax(Math.max(0, Number(e.target.value) || 0))
                    }
                    className="h-9 tabular-nums"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="inline-flex items-center gap-1 font-sans text-xs text-muted-foreground">
                    Display threshold
                    <Info className="size-3" aria-hidden />
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={48}
                    value={displayThreshold}
                    onChange={(e) =>
                      setDisplayThreshold(
                        Math.max(0, Number(e.target.value) || 0)
                      )
                    }
                    className="h-9 tabular-nums"
                  />
                </div>
              </div>
            </section>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <h2 className="font-sans text-sm font-semibold text-foreground">
              Your strategy results
            </h2>
            <div className="flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5">
              {(
                [
                  { id: "gift" as const, icon: ShoppingCart, label: "Product cards" },
                  { id: "grid" as const, icon: LayoutGrid, label: "Grid" },
                  { id: "list" as const, icon: List, label: "List" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  aria-pressed={view === item.id}
                  onClick={() => setView(item.id)}
                  className={cn(
                    "rounded-sm p-1.5 text-muted-foreground transition-colors",
                    view === item.id && "bg-background text-foreground shadow-sm"
                  )}
                >
                  <item.icon className="size-3.5" />
                </button>
              ))}
              <button
                type="button"
                aria-label="Result settings"
                className="rounded-sm p-1.5 text-muted-foreground hover:text-foreground"
              >
                <Settings className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div
              className={cn(
                "grid gap-4",
                view === "list"
                  ? "grid-cols-1"
                  : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
              )}
            >
              {placeholders.map((i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/20 text-center",
                    view === "list" ? "flex-row gap-4 px-4 py-3" : "aspect-square p-4"
                  )}
                >
                  <span className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <ShoppingCart className="size-5" aria-hidden />
                  </span>
                  <div className={view === "list" ? "text-left" : ""}>
                    <p className="font-sans text-sm text-foreground">Add product</p>
                    <p className="text-xs text-muted-foreground">– €</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <RulePickerDialog open={ruleOpen} onOpenChange={setRuleOpen} />
    </div>
  );
}
