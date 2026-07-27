import { type ReactNode } from "react";
import { type Section } from "../../config/configSections";
import SectionTitle from "./SectionTitle";

// Guided-only header above a focused step: the step title (description on
// hover) with an optional action beside it (e.g. variations "Workflow Mode").
// Rendered ONLY in guided mode.
export default function GuidedStepHeader({
  section,
  action,
}: {
  section: Section;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <SectionTitle
        label={section.label}
        description={section.description}
        className="text-2xl"
      />
      {action}
    </div>
  );
}
