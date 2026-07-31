import { Languages, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Left Translate panel — greyscale shell (no dedicated Figma frame). */
export function EditorTranslatePanel({ onClose }: { onClose?: () => void }) {
  return (
    <aside className="flex h-full w-full flex-col bg-background">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <p className="text-sm font-semibold text-foreground">Translate</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted">
          <Languages className="size-5 text-muted-foreground" strokeWidth={1.5} />
        </span>
        <p className="text-sm font-semibold text-foreground">
          Translate this page
        </p>
        <p className="text-xs leading-5 text-muted-foreground">
          Select languages and sync copy across variations. Full translation
          workflows will appear here.
        </p>
        <Button type="button" size="sm" className="mt-1 h-7 text-xs font-semibold">
          Add language
        </Button>
      </div>
    </aside>
  );
}
