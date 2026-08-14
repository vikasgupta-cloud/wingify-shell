import { HelpCircle, Monitor, MoreVertical, Plus, RotateCcw } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useParams } from "react-router-dom";
import { useConfigStore } from "@/store/config";
import { OLD_STEPS } from "./oldFlow";

export default function VariationsStep() {
  const { entityId = "" } = useParams();
  const config = useConfigStore((s) => s.configs[entityId]);
  const patch = useConfigStore((s) => s.patch);
  const meta = OLD_STEPS[1];

  if (!config) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-title flex items-center gap-2 text-2xl font-semibold text-foreground">
            {meta.label}
            <HelpCircle className="size-4 text-muted-foreground" />
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
        </div>
        <Button type="button" variant="outline" size="sm">
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="editor-url">Editor URL</Label>
          <Input
            id="editor-url"
            type="url"
            value={config.editorUrl}
            onChange={(e) => patch(entityId, { editorUrl: e.target.value })}
            placeholder="https://"
          />
        </div>
        <div className="flex items-center gap-2">
          <Monitor className="size-4 text-muted-foreground" />
          <Select
            value={config.editorView}
            onValueChange={(v) =>
              patch(entityId, { editorView: v as "desktop" | "mobile" | "tablet" })
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desktop">Desktop</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="embedded-source" />
        <Label htmlFor="embedded-source" className="font-normal">
          Load editor with embedded source code
        </Label>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Variation Name</th>
              <th className="px-4 py-2.5 font-medium">Modifications</th>
              <th className="px-4 py-2.5 font-medium">
                Traffic split: {config.splitMode}
              </th>
              <th className="px-4 py-2.5 font-medium">Edit with: Visual editor</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {config.variations.map((variation) => (
              <tr key={variation.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                      {variation.label}
                    </span>
                    {variation.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {variation.modifications || "–"}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {variation.split.toFixed(2)}%
                </td>
                <td className="px-4 py-3">
                  <Button type="button" variant="link" className="h-auto p-0">
                    View
                  </Button>
                </td>
                <td className="px-2 py-3">
                  <Button type="button" variant="ghost" size="icon" aria-label="More">
                    <MoreVertical />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button type="button" variant="outline" className="gap-1.5">
        <Plus className="size-3.5" />
        Add variation
      </Button>

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
          Traffic Allocation
          <HelpCircle className="size-3.5 text-muted-foreground" />
        </h3>
        <p className="text-sm text-muted-foreground">
          Allocate the percentage of your visitors that will become part of the
          campaign
        </p>
        <div className="flex items-center gap-4">
          <Slider
            className="flex-1"
            value={[config.trafficAllocation]}
            min={1}
            max={100}
            step={1}
            onValueChange={([v]) => patch(entityId, { trafficAllocation: v })}
          />
          <div className="flex w-20 items-center gap-1">
            <Input
              className="tabular-nums"
              type="number"
              value={config.trafficAllocation}
              onChange={(e) =>
                patch(entityId, { trafficAllocation: Number(e.target.value) || 0 })
              }
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
