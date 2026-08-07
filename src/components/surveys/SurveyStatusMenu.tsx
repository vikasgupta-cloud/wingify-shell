// Survey status picker — same interaction as campaign StatusMenu, survey workflow only.

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { Survey, SurveyStatus } from "@/data/surveys";
import { SURVEY_STATUS_WORKFLOW } from "@/config/surveyFilters";
import { useSurveyRowsStore } from "@/store/surveyRows";
import StatusBadge from "@/components/ui/StatusBadge";

export default function SurveyStatusMenu({ survey }: { survey: Survey }) {
  const setStatus = useSurveyRowsStore((s) => s.setStatus);
  const transitions = SURVEY_STATUS_WORKFLOW[survey.status];
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
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
