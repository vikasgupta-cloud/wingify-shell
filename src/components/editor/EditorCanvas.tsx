import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Copy,
  Link2,
  MoreHorizontal,
  Move,
  Pencil,
  Sparkles,
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

type Box = { top: number; left: number; width: number; height: number };

function describeElement(el: Element): EditorSelection {
  const tag = el.tagName;
  const id = el.id;
  const classes = Array.from(el.classList);
  const label = id || classes[0] || tag.toLowerCase();
  const selector = id
    ? `${tag}#${id}`
    : classes.length > 0
      ? `${tag}.${classes[0]}`
      : tag;
  return { tag, label, selector };
}

function findBySelection(
  doc: Document,
  selection: EditorSelection
): Element | null {
  const byClass = selection.selector.includes(".")
    ? doc.querySelector(selection.selector.replace(/^([A-Z0-9]+)\./i, (_, t) => `${t}.`))
    : null;
  if (byClass) return byClass;
  // Fallback: first class token
  const classMatch = selection.selector.match(/\.([\w-]+)/);
  if (classMatch) {
    const el = doc.querySelector(`.${classMatch[1]}`);
    if (el) return el;
  }
  const tag = selection.tag.toLowerCase();
  return doc.querySelector(tag);
}

function rectInFrame(el: Element): Box {
  const r = el.getBoundingClientRect();
  return {
    top: r.top,
    left: r.left,
    width: Math.max(r.width, 1),
    height: Math.max(r.height, 1),
  };
}

/**
 * Center stage: website preview with real DOM selection from the iframe.
 */
export function EditorCanvas({
  src = PREVIEW_SRC,
  device = "desktop",
  showDimensionsBar = false,
  selection = null,
  onSelect,
  onClearSelection,
  showSubtestPopover = false,
}: {
  src?: string;
  device?: EditorDevice;
  showDimensionsBar?: boolean;
  selection?: EditorSelection | null;
  onSelect?: (selection: EditorSelection) => void;
  onClearSelection?: () => void;
  showSubtestPopover?: boolean;
}) {
  const width = DEVICE_WIDTH[device];
  const framed = device !== "desktop";
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectedElRef = useRef<Element | null>(null);
  const hoverElRef = useRef<Element | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [hoverBox, setHoverBox] = useState<Box | null>(null);
  const [frameReady, setFrameReady] = useState(0);

  const syncSelectedBox = useCallback(() => {
    const el = selectedElRef.current;
    if (!el || !el.isConnected) {
      setBox(null);
      return;
    }
    setBox(rectInFrame(el));
  }, []);

  const clearHover = useCallback(() => {
    hoverElRef.current?.removeAttribute("data-editor-hover");
    hoverElRef.current = null;
    setHoverBox(null);
  }, []);

  const bindFrame = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc?.body) return;

    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as Element | null;
      if (!target || target === doc.documentElement || target === doc.body) {
        selectedElRef.current = null;
        setBox(null);
        clearHover();
        onClearSelection?.();
        return;
      }
      selectedElRef.current = target;
      clearHover();
      setBox(rectInFrame(target));
      onSelect?.(describeElement(target));
    };

    const onMove = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target || target === doc.documentElement || target === doc.body) {
        clearHover();
        return;
      }
      if (target === selectedElRef.current) {
        clearHover();
        return;
      }
      if (hoverElRef.current !== target) {
        hoverElRef.current?.removeAttribute("data-editor-hover");
        hoverElRef.current = target;
        target.setAttribute("data-editor-hover", "");
      }
      setHoverBox(rectInFrame(target));
    };

    const onLeave = () => clearHover();
    const onScrollOrResize = () => {
      syncSelectedBox();
      if (hoverElRef.current?.isConnected) {
        setHoverBox(rectInFrame(hoverElRef.current));
      }
    };

    doc.addEventListener("click", onClick, true);
    doc.addEventListener("mousemove", onMove, true);
    doc.addEventListener("mouseleave", onLeave, true);
    doc.addEventListener("scroll", onScrollOrResize, true);
    iframe?.contentWindow?.addEventListener("resize", onScrollOrResize);

    setFrameReady((n) => n + 1);

    return () => {
      doc.removeEventListener("click", onClick, true);
      doc.removeEventListener("mousemove", onMove, true);
      doc.removeEventListener("mouseleave", onLeave, true);
      doc.removeEventListener("scroll", onScrollOrResize, true);
      iframe?.contentWindow?.removeEventListener("resize", onScrollOrResize);
      clearHover();
    };
  }, [clearHover, onClearSelection, onSelect, syncSelectedBox]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => bindFrame();
    iframe.addEventListener("load", onLoad);
    if (iframe.contentDocument?.readyState === "complete") {
      return bindFrame();
    }
    return () => iframe.removeEventListener("load", onLoad);
  }, [bindFrame, src]);

  // Scenario / external selection → find real element
  useLayoutEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.body) return;
    if (!selection) {
      selectedElRef.current = null;
      setBox(null);
      return;
    }
    const el = findBySelection(doc, selection);
    if (el) {
      selectedElRef.current = el;
      setBox(rectInFrame(el));
      el.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [selection, frameReady]);

  useEffect(() => {
    const onWinScroll = () => syncSelectedBox();
    window.addEventListener("resize", onWinScroll);
    return () => window.removeEventListener("resize", onWinScroll);
  }, [syncSelectedBox]);

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/30">
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
            framed &&
              "my-4 overflow-hidden rounded-lg border border-border shadow-sm"
          )}
          style={{
            width: framed ? width : "100%",
            height: framed ? DEVICE_HEIGHT[device] : "100%",
            maxWidth: "100%",
          }}
        >
          <iframe
            ref={iframeRef}
            title="Website preview"
            src={src}
            className="absolute inset-0 size-full border-0 bg-background"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />

          {hoverBox && !selection && (
            <div
              className="pointer-events-none absolute z-10 border border-dashed border-foreground/40"
              style={{
                top: hoverBox.top,
                left: hoverBox.left,
                width: hoverBox.width,
                height: hoverBox.height,
              }}
            />
          )}

          {selection && box && (
            <div
              className="pointer-events-none absolute z-20"
              style={{
                top: box.top,
                left: box.left,
                width: box.width,
                height: box.height,
              }}
            >
              <div className="absolute inset-0 border-2 border-foreground bg-foreground/5" />
              <div className="pointer-events-auto absolute -top-6 left-0 inline-flex max-w-[min(100%,280px)] items-center gap-1.5 rounded bg-foreground px-2 py-0.5 text-[11px] font-semibold text-background">
                <span className="truncate">{selection.selector}</span>
                <button
                  type="button"
                  className="shrink-0 outline-none"
                  aria-label="Copy selector"
                  onClick={(e) => {
                    e.stopPropagation();
                    void navigator.clipboard?.writeText(selection.selector);
                  }}
                >
                  <Copy className="size-3" strokeWidth={2} />
                </button>
              </div>
              <div className="pointer-events-auto absolute left-0 top-full mt-2 inline-flex items-center gap-0.5 rounded-full border border-border bg-background p-1 shadow-md">
                {(
                  [
                    ["AI", Sparkles],
                    ["Edit", Pencil],
                    ["Move", Move],
                    ["Link", Link2],
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
                  className="pointer-events-auto absolute left-[148px] top-full mt-3 text-[10px] font-medium text-muted-foreground underline-offset-2 hover:underline"
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
