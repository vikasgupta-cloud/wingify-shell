import {
  Copy,
  Link2,
  MoreHorizontal,
  Move,
  Pencil,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  EditorDevice,
  EditorSelection,
} from "@/config/editorScenarios";

const PREVIEW_SRC = "/editor-preview/index.html";

const DEVICE_WIDTH: Record<EditorDevice, number | "100%"> = {
  desktop: "100%",
  tablet: 768,
  mobile: 390,
};

const DEVICE_HEIGHT: Record<EditorDevice, string> = {
  desktop: "100%",
  tablet: "1024px",
  mobile: "844px",
};

/**
 * Center stage: website preview with optional device frame, selection, and MVT popover.
 */
export function EditorCanvas({
  src = PREVIEW_SRC,
  device = "desktop",
  showDimensionsBar = false,
  selection = null,
  onSelectDemo,
  onClearSelection,
  showSubtestPopover = false,
}: {
  src?: string;
  device?: EditorDevice;
  showDimensionsBar?: boolean;
  selection?: EditorSelection | null;
  onSelectDemo?: () => void;
  onClearSelection?: () => void;
  showSubtestPopover?: boolean;
}) {
  const width = DEVICE_WIDTH[device];
  const framed = device !== "desktop";

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/30">
      {showDimensionsBar && (
        <div className="flex h-8 shrink-0 items-center gap-3 border-b border-border bg-background px-3 text-xs">
          <span className="font-medium text-muted-foreground">Dimensions:</span>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 font-semibold text-foreground"
          >
            Responsive
          </button>
          <div className="flex items-center gap-1">
            <Input
              defaultValue={device === "tablet" ? "768" : "390"}
              className="h-6 w-14 px-1.5 text-xs shadow-none"
              aria-label="Width"
            />
            <span className="text-muted-foreground">×</span>
            <Input
              defaultValue={device === "tablet" ? "1024" : "844"}
              className="h-6 w-14 px-1.5 text-xs shadow-none"
              aria-label="Height"
            />
          </div>
          <button
            type="button"
            className="rounded-md px-2 py-0.5 font-medium text-muted-foreground hover:text-foreground"
          >
            Fit to window
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto size-6"
            aria-label="Link dimensions"
          >
            <Link2 className="size-3.5" strokeWidth={1.75} />
          </Button>
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-auto">
        <div
          className={cn(
            "relative mx-auto h-full bg-background",
            framed && "my-4 overflow-hidden rounded-lg border border-border shadow-sm"
          )}
          style={{
            width: framed ? width : "100%",
            height: framed ? DEVICE_HEIGHT[device] : "100%",
            maxWidth: "100%",
          }}
        >
          <iframe
            title="Website preview"
            src={src}
            className="absolute inset-0 size-full border-0 bg-background"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />

          {/* Demo hit target — click to select heading region */}
          <button
            type="button"
            aria-label="Select demo heading"
            onClick={onSelectDemo}
            className="absolute left-[8%] top-[42%] z-10 h-[12%] w-[40%] cursor-crosshair bg-transparent outline-none"
          />

          {selection && (
            <div className="pointer-events-none absolute left-[8%] top-[38%] z-20 w-[48%]">
              <div className="pointer-events-auto mb-1 inline-flex items-center gap-1.5 rounded bg-foreground px-2 py-0.5 text-[11px] font-semibold text-background">
                {selection.selector}
                <button
                  type="button"
                  className="outline-none"
                  aria-label="Copy selector"
                  onClick={(e) => {
                    e.stopPropagation();
                    void navigator.clipboard?.writeText(selection.selector);
                  }}
                >
                  <Copy className="size-3" strokeWidth={2} />
                </button>
              </div>
              <div className="rounded border-2 border-foreground bg-foreground/5">
                <div className="h-16" />
              </div>
              <div className="pointer-events-auto mt-2 inline-flex items-center gap-0.5 rounded-full border border-border bg-background p-1 shadow-md">
                {(
                  [
                    ["AI", Sparkles],
                    ["Edit", Pencil],
                    ["Move", Move],
                    ["Style", Wand2],
                    ["More", MoreHorizontal],
                  ] as const
                ).map(([label, Icon]) => (
                  <Button
                    key={label}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-full"
                    aria-label={label}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon className="size-3.5" strokeWidth={1.75} />
                  </Button>
                ))}
              </div>
              {onClearSelection && (
                <button
                  type="button"
                  className="pointer-events-auto ml-2 text-[10px] font-medium text-muted-foreground underline-offset-2 hover:underline"
                  onClick={onClearSelection}
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {showSubtestPopover && (
            <div className="absolute left-4 top-4 z-30 w-[240px] overflow-hidden rounded-lg border border-border bg-background shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <p className="text-xs font-semibold text-foreground">Subtest 1</p>
                <MoreHorizontal
                  className="size-3.5 text-muted-foreground"
                  strokeWidth={1.75}
                />
              </div>
              <div className="border-b border-border px-3 py-2">
                <code className="block truncate text-[10px] text-muted-foreground">
                  main .swiper-slide-active .text-heading-3
                </code>
              </div>
              <ul className="p-1.5">
                {(
                  [
                    ["C", "Control", false],
                    ["V1", "Variation 1", true],
                    ["V2", "Variation 2", false],
                  ] as const
                ).map(([chip, label, active]) => (
                  <li key={chip}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs outline-none",
                        active
                          ? "bg-accent font-semibold text-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <span className="inline-flex size-5 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-medium">
                        {chip}
                      </span>
                      {label}
                      {active && (
                        <Pencil
                          className="ml-auto size-3 text-muted-foreground"
                          strokeWidth={1.75}
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-full justify-start gap-1 text-xs font-semibold"
                >
                  + New variation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
