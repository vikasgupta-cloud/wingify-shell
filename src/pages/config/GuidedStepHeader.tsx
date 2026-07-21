import { type ReactNode } from "react";
import { type Section } from "../../config/configSections";

// Guided-only header above a focused step: the step title and its one-line
// description, with an optional action rendered beside the title (e.g. the
// variations step's "Workflow Mode" CTA). Rendered ONLY in guided mode.
export default function GuidedStepHeader({
  section,
  action,
}: {
  section: Section;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-foreground">{section.label}</h2>
        <p className="text-sm text-muted-foreground">{section.description}</p>
      </div>
      {action}
    </div>
  );
}
