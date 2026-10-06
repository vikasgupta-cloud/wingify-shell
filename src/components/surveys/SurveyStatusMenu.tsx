// Survey status picker — same interaction as campaign StatusMenu, survey workflow only.

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "@/components/icons/protoLucide";
import type { Survey, SurveyStatus } from "@/data/surveys";
import { SURVEY_STATUS_WORKFLOW } from "@/config/surveyFilters";
import { useSurveyRowsStore } from "@/store/surveyRows";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";

const STATUS_TRIGGER: Record<SurveyStatus, string> = {
  Draft: "border-transparent bg-status-draft-fg text-white hover:bg-status-draft-fg/90",
  Running:
    "border-transparent bg-status-running-fg text-white hover:bg-status-running-fg/90",
  Paused:
    "border-transparent bg-status-paused-fg text-white hover:bg-status-paused-fg/90",
};

export default function SurveyStatusMenu({
  survey,
  triggerVariant = "badge",
}: {
  survey: Survey;
  /** Header opts into filled button CTA (same as campaign StatusMenu). */
  triggerVariant?: "badge" | "button";
}) {
  const setStatus = useSurveyRowsStore((s) => s.setStatus);
  const transitions = SURVEY_STATUS_WORKFLOW[survey.status];
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  if (transitions.length === 0) {
    if (triggerVariant === "button") {
      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          aria-label={`Status ${survey.status}`}
          className={cn(
            "w-auto disabled:opacity-100",
            STATUS_TRIGGER[survey.status]
          )}
        >
          {survey.status}
        </Button>
      );
    }
    return <StatusBadge status={survey.status} />;
  }

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        {triggerVariant === "button" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stop}
            aria-label={`Change status from ${survey.status}`}
            className={cn(
              "group w-auto hover:text-white",
              STATUS_TRIGGER[survey.status]
            )}
          >
            {survey.status}
            <ChevronDown className="h-3 w-3 opacity-70 transition-transform duration-150 group-data-[state=open]:rotate-180" />
          </Button>
        ) : (
          <button
            type="button"
            onClick={stop}
            aria-label={`Change status from ${survey.status}`}
            className="group inline-flex outline-none"
          >
            <StatusBadge status={survey.status} className="gap-1">
              <ChevronDown className="h-3 w-3 opacity-70 transition-transform duration-150 group-data-[state=open]:rotate-180" />
            </StatusBadge>
          </button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          onClick={stop}
          className="z-50 w-[260px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Next Steps
          </DropdownMenu.Label>
          {transitions.map((t) => (
            <DropdownMenu.Item
              key={t.to}
              onSelect={() => setStatus(survey.id, t.to as SurveyStatus)}
              className="flex cursor-pointer flex-col gap-0.5 rounded-md px-2 py-2 outline-none hover:bg-accent data-[highlighted]:bg-accent"
            >
              <StatusBadge status={t.to} className="w-fit self-start" />
              <span className="text-xs text-muted-foreground">{t.description}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
