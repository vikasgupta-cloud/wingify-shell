import { Lock, LockOpen, Plus, Trash2 } from "@/components/icons/protoLucide";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfigV2Store } from "../../../store/configV2";
import { HYPOTHESES, LABELS, priorityScore } from "../../../data/hypotheses";

const EDITOR_VIEWS = ["desktop", "tablet", "mobile"] as const;

// A short, sensible campaign name derived from a hypothesis title.
function nameFromHypothesis(title: string): string {
  const cleaned = title.replace(/["']/g, "").trim();
  return cleaned.length > 48 ? `${cleaned.slice(0, 47).trimEnd()}…` : cleaned;
}

function IceBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-xs text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={cn(
              "h-1.5 w-5 rounded-full",
              n <= value ? "bg-foreground" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default function IdeaAct({ campaignId }: { campaignId: string }) {
  const config = useConfigV2Store((s) => s.configs[campaignId]);
  const patchV2 = useConfigV2Store((s) => s.patchV2);
  const addTypedVariation = useConfigV2Store((s) => s.addTypedVariation);
  const removeVariation = useConfigV2Store((s) => s.removeVariation);
  const renameVariation = useConfigV2Store((s) => s.renameVariation);
  const setSplit = useConfigV2Store((s) => s.setSplit);
  const toggleLock = useConfigV2Store((s) => s.toggleLock);
  const setSplitMode = useConfigV2Store((s) => s.setSplitMode);

  if (!config) return null;

  const selectHypothesis = (id: string, title: string) => {
    patchV2(campaignId, {
      hypothesis: title,
      hypothesisId: id,
      // Default the campaign name from the hypothesis; still editable below.
      name: nameFromHypothesis(title),
    });
  };

  const toggleLabel = (label: string) => {
    const has = config.labels.includes(label);
    patchV2(campaignId, {
      labels: has
        ? config.labels.filter((l) => l !== label)
        : [...config.labels, label],
    });
  };

  const manual = config.splitMode === "Manual";

  return (
    <div className="space-y-10">
      {/* HYPOTHESIS ------------------------------------------------------- */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            What are we testing, and why?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start from a hypothesis. It's the claim the experiment will confirm
            or reject.
          </p>
        </div>

        <div className="space-y-2">
          {HYPOTHESES.map((h) => {
            const selected = config.hypothesisId === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => selectHypothesis(h.id, h.title)}
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-left transition-colors",
                  selected
                    ? "border-foreground bg-muted/40"
                    : "border-border bg-background hover:bg-muted/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 shrink-0 items-center rounded-md border border-border bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
                    {h.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {h.title}
                    </p>
                    {selected && (
                      <div className="mt-3 space-y-3">
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {h.observation}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Prioritisation
                            </span>
                            <span className="text-sm font-semibold tabular-nums text-foreground">
                              {priorityScore(h)}/5
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <IceBar label="Confidence" value={h.confidence} />
                            <IceBar label="Importance" value={h.importance} />
                            <IceBar label="Ease" value={h.ease} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            …or write your own
          </p>
          <Textarea
            value={config.hypothesisId === null ? config.hypothesis ?? "" : ""}
            placeholder="I expect that changing … will improve … because …"
            onChange={(e) =>
              patchV2(campaignId, {
                hypothesis: e.target.value,
                hypothesisId: null,
              })
            }
            className="min-h-[72px] resize-y"
          />
        </div>
      </section>

      {/* NAME + LABELS ---------------------------------------------------- */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Campaign name
          </label>
          <Input
            value={config.name}
            onChange={(e) => patchV2(campaignId, { name: e.target.value })}
            placeholder="Name this experiment"
          />
          <p className="text-xs text-muted-foreground">
            Defaulted from your hypothesis — edit freely.
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Labels</label>
          <div className="flex flex-wrap gap-1.5">
            {LABELS.map((label) => {
              const on = config.labels.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    on
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* VARIATIONS ------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Variations
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              The change that tests this hypothesis.
            </p>
          </div>
          <Select
            value={config.splitMode}
            onValueChange={(v) =>
              setSplitMode(campaignId, v as typeof config.splitMode)
            }
          >
            <SelectTrigger className="w-[130px]" aria-label="Split mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Equal">Equal split</SelectItem>
              <SelectItem value="Manual">Manual split</SelectItem>
              <SelectItem value="Auto">Auto-allocate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-listing-header text-left text-xs text-listing-header-foreground">
                <th className="px-3 py-2 font-medium">Variation</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="w-24 px-3 py-2 text-right font-medium">Split</th>
                <th className="w-20 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {config.variations.map((v) => {
                const isControl = v.id === "control";
                return (
                  <tr key={v.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-6 shrink-0 items-center justify-center rounded border border-border bg-muted text-[11px] font-medium text-muted-foreground">
                          {v.label}
                        </span>
                        <Input
                          value={v.name}
                          onChange={(e) =>
                            renameVariation(campaignId, v.id, e.target.value)
                          }
                          className="h-8"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs capitalize text-muted-foreground">
                        {isControl ? "Original" : v.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={v.split}
                          disabled={!manual}
                          onChange={(e) =>
                            setSplit(campaignId, v.id, Number(e.target.value))
                          }
                          className="h-8 w-16 text-right tabular-nums"
                          aria-label={`${v.name} split`}
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                        {manual && (
                          <button
                            type="button"
                            aria-label={v.locked ? "Unlock split" : "Lock split"}
                            onClick={() => toggleLock(campaignId, v.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {v.locked ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <LockOpen className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {!isControl && (
                        <button
                          type="button"
                          aria-label={`Remove ${v.name}`}
                          onClick={() => removeVariation(campaignId, v.id)}
                          className="text-muted-foreground hover:text-danger-fg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addTypedVariation(campaignId, "editor")}
          >
            <Plus className="h-4 w-4" />
            Add variation
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addTypedVariation(campaignId, "redirect")}
          >
            <Plus className="h-4 w-4" />
            Add redirect
          </Button>
        </div>

        {/* Editor URL + view */}
        <div className="grid gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Editor URL
            </label>
            <Input
              value={config.editorUrl}
              placeholder="https://"
              onChange={(e) => patchV2(campaignId, { editorUrl: e.target.value })}
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Editor view
            </label>
            <div className="flex gap-1">
              {EDITOR_VIEWS.map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => patchV2(campaignId, { editorView: view })}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs capitalize transition-colors",
                    config.editorView === view
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                  )}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
