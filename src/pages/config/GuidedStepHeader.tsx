import { type Section } from "../../config/configSections";

// Guided-only header above a focused step: the step title and its one-line
// description. Rendered ONLY in guided mode; never appears in the Scroll view.
export default function GuidedStepHeader({ section }: { section: Section }) {
  return (
    <div className="mb-6 flex flex-col gap-1">
      <h2 className="text-2xl font-semibold text-foreground">{section.label}</h2>
      <p className="text-sm text-muted-foreground">{section.description}</p>
    </div>
  );
}
