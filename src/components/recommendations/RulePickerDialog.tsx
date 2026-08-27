/** Rule type picker — list only; options not clickable until next screenshot. */

import {
  ChevronRight,
  Eye,
  ExternalLink,
  FileText,
  Filter,
  Layers,
  ListOrdered,
  RefreshCw,
  ShoppingCart,
  Square,
  TrendingUp,
} from "@/components/icons/protoLucide";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RULE_SECTIONS, type RuleOption } from "@/config/recommendationCreate";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

const RULE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "best-sellers": TrendingUp,
  "most-consulted": Eye,
  repurchase: RefreshCw,
  associated: ShoppingCart,
  "viewed-together": Layers,
  "semantic-similar": Square,
  semantic: Square,
  "sorted-by": ListOrdered,
  "from-variable": Filter,
  handpicked: Square,
  "from-strategy": RefreshCw,
  conditional: FileText,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ruleName?: string;
};

function RuleRow({ option }: { option: RuleOption }) {
  const Icon = RULE_ICONS[option.id] ?? Square;
  return (
    <div
      role="listitem"
      aria-disabled
      title="Coming soon"
      className={cn(
        "flex items-start gap-3 rounded-md px-3 py-2.5",
        option.unavailable
          ? "cursor-not-allowed opacity-50"
          : "cursor-not-allowed opacity-90 hover:bg-muted/60"
      )}
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-sans text-sm font-medium text-foreground">
          {option.title}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {option.description}
        </span>
      </span>
      {option.unavailable ? (
        <span className="inline-flex shrink-0 items-center gap-1 pt-1 text-xs text-muted-foreground">
          Enable
          <ExternalLink className="size-3" aria-hidden />
        </span>
      ) : (
        <ChevronRight
          className="mt-1 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      )}
    </div>
  );
}

export default function RulePickerDialog({
  open,
  onOpenChange,
  ruleName = "Rule #1",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,640px)] w-[min(92vw,480px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-3 border-b border-border px-5 py-4 text-left">
          <DialogTitle className="sr-only">{ruleName}</DialogTitle>
          <DialogDescription className="sr-only">
            Choose a rule type. Selection is disabled until the next step is
            designed.
          </DialogDescription>
          <Input
            value={ruleName}
            readOnly
            className="h-9 bg-muted/40 font-sans text-sm font-medium"
            aria-label="Rule name"
          />
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
          {RULE_SECTIONS.map((section) => (
            <section key={section.id} className="mb-4 last:mb-0">
              <p className="px-3 pb-1.5 font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {section.label}
              </p>
              <div role="list" className="flex flex-col">
                {section.options.map((opt) => (
                  <RuleRow key={opt.id} option={opt} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
