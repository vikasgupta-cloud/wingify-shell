import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "@/components/icons/protoLucide";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { findOperator, type OperatorDef } from "../../config/qaOperators";

// The base symbol with an optional case-sensitivity tag as a superscript.
// `size` scales the two so the trigger reads compact and the list reads clear.
export function OperatorGlyph({
  operator,
  className,
}: {
  operator: OperatorDef;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-start leading-none", className)}>
      <span>{operator.symbol}</span>
      {operator.caseTag && (
        <span className="ml-px text-[0.6em] font-medium leading-none">
          {operator.caseTag}
        </span>
      )}
    </span>
  );
}

// Searchable operator picker. Collapsed, it shows just the selected operator's
// compact glyph (with a tooltip of the full label); open, it's a search box
// over a filtered list of operators.
export default function OperatorPicker({
  operators,
  value,
  onChange,
  ariaLabel = "Operator",
}: {
  operators: OperatorDef[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = findOperator(operators, value) ?? operators[0];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return operators;
    return operators.filter((o) => o.label.toLowerCase().includes(q));
  }, [operators, query]);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={ariaLabel}
                className="group flex h-9 w-16 shrink-0 items-center justify-center gap-1 rounded-md border border-input bg-background text-sm text-foreground transition-colors hover:bg-accent"
              >
                <OperatorGlyph operator={selected} />
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 group-data-[state=open]:rotate-180" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">{selected.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent align="start" sideOffset={6} className="w-[300px] p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
        <div className="mt-2 flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {results.length === 0 && (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No operators
            </div>
          )}
          {results.map((op) => {
            const isActive = op.id === selected.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => {
                  onChange(op.id);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                  isActive && "bg-accent font-medium text-foreground"
                )}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                  <OperatorGlyph operator={op} />
                </span>
                <span className="flex-1 truncate">{op.label}</span>
                {isActive && <Check className="h-4 w-4 shrink-0 text-foreground" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
