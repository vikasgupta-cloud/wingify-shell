import {
  SECTIONS,
  SECTION_GROUPS,
  type Section,
} from "../../config/configSections";

// Guided-only header above a focused step: a display-only progress bar, an
// eyebrow ("{GROUP} · Step n of total"), the step title, and its one-line
// description. Grayscale via tokens (bar = --foreground on --muted). Rendered
// ONLY in guided mode; never appears in the Scroll view.
export default function GuidedStepHeader({ section }: { section: Section }) {
  const total = SECTIONS.length;
  const index = SECTIONS.findIndex((s) => s.id === section.id);
  const n = index + 1;
  const pct = (n / total) * 100;
  const group =
    SECTION_GROUPS.find((g) => g.id === section.group)?.label ?? section.group;

  return (
    <div className="mb-6 flex flex-col gap-3">
      {/* Display-only progress bar. */}
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-muted"
        role="presentation"
      >
        <div
          className="h-full rounded-full bg-foreground transition-[width] duration-200 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {group.toUpperCase()} · Step {n} of {total}
        </div>
        <h2 className="text-2xl font-semibold text-foreground">{section.label}</h2>
        <p className="text-sm text-muted-foreground">{section.description}</p>
      </div>
    </div>
  );
}
