import { ChevronDown } from "@/components/icons/protoLucide";
import { cn } from "@/lib/utils";
import { useConfigStore } from "../../store/config";
import type { SectionId } from "../../config/configSections";
import SectionTitle from "./SectionTitle";

// Shared collapsible wrapper for the optional config sections
// (Additional Settings / QA Assistant). Default CLOSED. Open state lives in the
// store so the DotNav can open a section when its nav item is clicked.
export default function CollapsibleSection({
  id,
  title,
  description,
  optional,
  children,
}: {
  id: SectionId;
  title: string;
  description?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const open = useConfigStore((s) => s.openSections[id] ?? false);
  const toggleSection = useConfigStore((s) => s.toggleSection);

  return (
    <div id={`section-${id}`} className="scroll-mt-20">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => toggleSection(id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleSection(id);
          }
        }}
        className="flex cursor-pointer select-none items-center gap-2 py-2"
      >
        <ChevronDown
          className={cn(
            "h-5 w-5 text-foreground transition-transform duration-200 motion-reduce:transition-none",
            !open && "-rotate-90"
          )}
          aria-hidden
        />
        <SectionTitle
          sectionId={id}
          label={title}
          description={description}
          as="span"
          className="text-lg"
        />
        {optional && (
          <span className="text-sm italic text-muted-foreground">(Optional)</span>
        )}
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none",
          open ? "max-h-[6000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
