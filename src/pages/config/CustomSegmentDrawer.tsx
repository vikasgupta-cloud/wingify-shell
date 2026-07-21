import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUp,
  ChevronDown,
  CircleMinus,
  CirclePlus,
  Copy,
  Mic,
  Paperclip,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useConfigStore } from "../../store/config";
import { useCustomSegmentsStore } from "../../store/customSegments";
import {
  makeCondition,
  makeCustomSegment,
  MY_SEGMENTS,
  STANDARD_SEGMENTS,
  type SegmentCondition,
} from "../../config/segments";
import {
  ATTRIBUTE_CATEGORIES,
  findAttribute,
  findOperator,
  operatorsFor,
} from "../../config/segmentAttributes";

// Canned prompt suggestions for the (visual-only) Wandz assistant.
const WANDZ_SUGGESTIONS = [
  "Only to visitors using mobile device",
  "Target only new visitors to the website",
  "Segment visitors arriving from a specific paid ad campaign",
];

function WandzBanner() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-muted/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          Go faster with Wandz
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="px-4 pb-4">
          {/* Ask Wandz input — visual stub, no real assistant call. */}
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            <input
              placeholder="Ask Wandz"
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Paperclip className="h-4 w-4" />
              <Mic className="h-4 w-4" />
            </div>
            <Button type="button" size="icon" className="h-7 w-7">
              <ArrowUp />
            </Button>
          </div>

          {/* Suggestion chips — stubs. */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {WANDZ_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className="flex items-start gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground hover:bg-accent"
              >
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Value control for a single condition, per the VALUE RENDERING RULE.
function ValueField({
  condition,
  onChange,
}: {
  condition: SegmentCondition;
  onChange: (patch: Partial<SegmentCondition>) => void;
}) {
  const attr = findAttribute(condition.attribute);
  const op = attr ? findOperator(attr, condition.operator) : undefined;

  if (op?.valueless) return null;

  if (op?.valueType === "number") {
    return (
      <div className="flex flex-1 items-center gap-2">
        <Input
          type="number"
          value={condition.value}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder="0"
          className="h-9 w-full tabular-nums"
        />
        {op.valueSuffix && (
          <span className="shrink-0 text-sm text-muted-foreground">
            {op.valueSuffix}
          </span>
        )}
      </div>
    );
  }

  const vt = attr?.valueType;

  if (vt === "select") {
    return (
      <Select
        value={condition.value}
        onValueChange={(v) => onChange({ value: v })}
      >
        <SelectTrigger className="h-9 flex-1">
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent>
          {(attr?.options ?? []).map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (vt === "number") {
    return (
      <Input
        type="number"
        value={condition.value}
        onChange={(e) => onChange({ value: e.target.value })}
        placeholder="0"
        className="h-9 flex-1 tabular-nums"
      />
    );
  }

  return (
    <Input
      value={condition.value}
      onChange={(e) => onChange({ value: e.target.value })}
      placeholder="Value"
      className="h-9 flex-1"
    />
  );
}

function ConditionCard({
  condition,
  canRemove,
  onChange,
  onRemove,
  onDuplicate,
}: {
  condition: SegmentCondition;
  canRemove: boolean;
  onChange: (patch: Partial<SegmentCondition>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const attr = findAttribute(condition.attribute);
  const ops = attr ? operatorsFor(attr) : [];
  const op = (attr && findOperator(attr, condition.operator)) || ops[0];

  // Attribute change resets the operator to the set's first and clears value.
  const changeAttribute = (newId: string) => {
    const newAttr = findAttribute(newId);
    onChange({
      attribute: newId,
      operator: newAttr ? operatorsFor(newAttr)[0].id : condition.operator,
      value: "",
    });
  };

  // Operator change clears the value when moving to a valueless operator.
  const changeOperator = (newId: string) => {
    const newOp = ops.find((o) => o.id === newId);
    onChange(newOp?.valueless ? { operator: newId, value: "" } : { operator: newId });
  };

  return (
    <div className="flex items-stretch gap-2">
      <div className="relative flex-1 rounded-lg border border-border bg-background p-3 pt-4">
        <span className="absolute -top-2 left-3 bg-background px-1 text-[11px] text-muted-foreground">
          where
        </span>
        <div className="flex items-center gap-2">
          {/* Attribute — grouped by category. */}
          <Select value={condition.attribute} onValueChange={changeAttribute}>
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ATTRIBUTE_CATEGORIES.map((cat) => (
                <SelectGroup key={cat.id}>
                  <SelectLabel>{cat.label}</SelectLabel>
                  {cat.attributes.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>

          {/* Operator — trigger shows only the symbol, driven from state. */}
          <Select value={condition.operator} onValueChange={changeOperator}>
            <SelectTrigger className="w-16" aria-label="Operator">
              <span className="w-6 text-center">{op?.symbol}</span>
            </SelectTrigger>
            <SelectContent>
              {ops.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  <span className="flex items-center">
                    <span className="w-6 text-center">{o.symbol}</span>
                    <span>{o.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ValueField condition={condition} onChange={onChange} />
        </div>
      </div>

      {/* Remove (top) + clone (below) on one vertical axis, centered to row. */}
      <div className="flex flex-col items-center justify-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove condition"
          disabled={!canRemove}
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <CircleMinus />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Duplicate condition"
          onClick={onDuplicate}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Copy />
        </Button>
      </div>
    </div>
  );
}

export default function CustomSegmentDrawer({
  campaignId,
  open,
  onOpenChange,
}: {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const config = useConfigStore((s) => s.configs[campaignId]);
  const applyCustomSegment = useConfigStore((s) => s.applyCustomSegment);
  const saveSegment = useCustomSegmentsStore((s) => s.saveSegment);
  const savedSegments = useCustomSegmentsStore((s) => s.saved);

  const [conditions, setConditions] = useState<SegmentCondition[]>([
    makeCondition(),
  ]);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  // Ids of conditions flagged (on Apply/Save) for a missing value.
  const [valueErrorIds, setValueErrorIds] = useState<Set<string>>(new Set());

  // Seed the builder each time the drawer opens: from the campaign's applied
  // custom segment when there is one, otherwise a single fresh condition.
  useEffect(() => {
    if (!open) return;
    const existing = config?.customSegment;
    setConditions(
      existing && existing.conditions.length > 0
        ? existing.conditions.map((c) => ({ ...c }))
        : [makeCondition()]
    );
    setName(existing && existing.label !== "Custom segment" ? existing.label : "");
    setNameError(null);
    setValueErrorIds(new Set());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Every existing segment name (Standard + My Segments + session-saved),
  // lowercased & trimmed, for the uniqueness check on save.
  const existingNames = useMemo(() => {
    const set = new Set<string>();
    STANDARD_SEGMENTS.forEach((c) =>
      c.attributes.forEach((a) => set.add(a.label.trim().toLowerCase()))
    );
    MY_SEGMENTS.forEach((a) => set.add(a.label.trim().toLowerCase()));
    savedSegments.forEach((s) => set.add(s.label.trim().toLowerCase()));
    return set;
  }, [savedSegments]);

  // Clears a condition's flagged value error (used when its inputs change).
  const clearValueError = (id: string) =>
    setValueErrorIds((s) => {
      if (!s.has(id)) return s;
      const next = new Set(s);
      next.delete(id);
      return next;
    });

  const updateCondition = (id: string, patch: Partial<SegmentCondition>) => {
    setConditions((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    clearValueError(id);
  };

  const removeCondition = (id: string) => {
    setConditions((cs) => cs.filter((c) => c.id !== id));
    clearValueError(id);
  };

  const duplicateCondition = (id: string) =>
    setConditions((cs) => {
      const i = cs.findIndex((c) => c.id === id);
      if (i === -1) return cs;
      const copy: SegmentCondition = { ...cs[i], id: makeCondition().id };
      const next = [...cs];
      next.splice(i + 1, 0, copy);
      return next;
    });

  const addCondition = () => setConditions((cs) => [...cs, makeCondition()]);

  const clear = () => {
    setConditions([makeCondition()]);
    setNameError(null);
    setValueErrorIds(new Set());
  };

  // A condition needs a value unless its operator is valueless (e.g. "is set").
  const conditionMissingValue = (c: SegmentCondition) => {
    const attr = findAttribute(c.attribute);
    const op = attr ? findOperator(attr, c.operator) : undefined;
    if (op?.valueless) return false;
    return String(c.value ?? "").trim() === "";
  };

  // Shared gate for Apply and Save: a name is required and every condition must
  // have a value. Flags the offending fields and returns whether it passed.
  const validate = () => {
    const trimmed = name.trim();
    let ok = true;
    if (!trimmed) {
      setNameError("Enter a segment name");
      ok = false;
    }
    const missing = conditions.filter(conditionMissingValue).map((c) => c.id);
    setValueErrorIds(new Set(missing));
    if (missing.length > 0) ok = false;
    return ok;
  };

  const apply = () => {
    if (!validate()) return;
    applyCustomSegment(campaignId, makeCustomSegment(conditions, name.trim()));
    onOpenChange(false);
  };

  const save = () => {
    if (!validate()) return;
    const trimmed = name.trim();
    if (existingNames.has(trimmed.toLowerCase())) {
      setNameError("A segment with this name already exists");
      return;
    }
    const def = makeCustomSegment(conditions, trimmed);
    saveSegment(def);
    applyCustomSegment(campaignId, def);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[900px] max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[95vw]"
      >
        {/* Header. */}
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-6 py-4">
          <Users className="h-5 w-5 text-foreground" />
          <SheetTitle className="text-base font-semibold text-foreground">
            Custom Segment
          </SheetTitle>
          <SheetDescription className="sr-only">
            Build a custom audience segment from one or more conditions.
          </SheetDescription>
        </div>

        {/* Body. */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          {/* Segment name. */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="segment-name">Segment name</Label>
            <Input
              id="segment-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="Name this segment"
              className="max-w-[360px]"
            />
            {nameError && (
              <p className="flex items-center gap-1 text-sm text-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                {nameError}
              </p>
            )}
          </div>

          <WandzBanner />

          <div className="text-sm text-muted-foreground">All visitors&hellip;</div>

          <div className="flex flex-col gap-3">
            {conditions.map((c, i) => (
              <div key={c.id} className="flex flex-col gap-3">
                {i > 0 && (
                  <Select
                    value={c.connector}
                    onValueChange={(v) =>
                      updateCondition(c.id, { connector: v as "And" | "Or" })
                    }
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="And">And</SelectItem>
                      <SelectItem value="Or">Or</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <ConditionCard
                  condition={c}
                  canRemove={conditions.length > 1}
                  onChange={(patch) => updateCondition(c.id, patch)}
                  onRemove={() => removeCondition(c.id)}
                  onDuplicate={() => duplicateCondition(c.id)}
                />
                {valueErrorIds.has(c.id) && (
                  <p className="flex items-center gap-1 text-sm text-foreground">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Select a value for this condition
                  </p>
                )}
              </div>
            ))}
          </div>

          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addCondition}
              className="text-foreground"
            >
              <CirclePlus />
              Add another condition
            </Button>
          </div>
        </div>

        {/* Footer. */}
        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={save}>
            Save Segment
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={clear}>
              Clear
            </Button>
            <Button type="button" onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
