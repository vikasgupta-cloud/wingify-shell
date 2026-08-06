import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Copy,
  CopyPlus,
  CaseSensitive,
  Link2,
  MoreHorizontal,
  Move,
  Pencil,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EditorIcon } from "./EditorIcon";
import type {
  EditorDevice,
  EditorPreviewWidthMode,
  EditorSelection,
} from "@/config/editorScenarios";
import {
  applyFirstFold,
  resolveFirstFold,
} from "@/config/editorFirstFold";

import aiSparkle from "@/assets/editor/ai-sparkle.svg";
import micIcon from "@/assets/editor/mic.svg";
import xClose from "@/assets/editor/x-close.svg";

export type EditorMode = "design" | "navigate" | "code";

export const EDITOR_PREVIEW_SRC = "/editor-preview/index.html";

const PREVIEW_SRC = EDITOR_PREVIEW_SRC;

const DEVICE_PRESETS: Record<
  EditorDevice,
  { w: number | "100%"; h: number | "100%" }
> = {
  desktop: { w: "100%", h: "100%" },
  tablet: { w: 768, h: 1024 },
  mobile: { w: 390, h: 844 },
};

const FIXED_DESKTOP_WIDTH = 1440;

type Box = { top: number; left: number; width: number; height: number };

const EDITOR_UID_ATTR = "data-editor-uid";
let editorUidSeq = 0;

function escapeIdent(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/([^\w-])/g, "\\$1");
}

function ensureEditorUid(el: Element): string {
  const existing = el.getAttribute(EDITOR_UID_ATTR);
  if (existing) return existing;
  const uid = `sel-${++editorUidSeq}`;
  el.setAttribute(EDITOR_UID_ATTR, uid);
  return uid;
}

function countMatches(doc: ParentNode, selector: string): number {
  try {
    return doc.querySelectorAll(selector).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

/** Build a selector that uniquely identifies `el` within its document. */
function uniqueSelector(el: Element): string {
  const doc = el.ownerDocument;

  if (el.id) {
    const idSel = `#${escapeIdent(el.id)}`;
    if (countMatches(doc, idSel) === 1) return idSel;
  }

  const parts: string[] = [];
  let current: Element | null = el;

  while (current && current !== doc.documentElement) {
    let part = current.tagName.toLowerCase();

    if (current.id) {
      part = `${part}#${escapeIdent(current.id)}`;
      parts.unshift(part);
      const trial = parts.join(" > ");
      if (countMatches(doc, trial) === 1) return trial;
      // Id on an ancestor isn't enough — keep walking with nth indexes below.
      parts.shift();
      part = current.tagName.toLowerCase();
    }

    const classes = Array.from(current.classList).filter(
      (c) => c && !c.startsWith("data-")
    );
    // Prefer a class that uniquely identifies this node under its parent.
    let classPart = "";
    for (const cls of classes) {
      const trialClass = `${part}.${escapeIdent(cls)}`;
      if (
        current.parentElement &&
        countMatches(current.parentElement, trialClass) === 1
      ) {
        classPart = `.${escapeIdent(cls)}`;
        break;
      }
    }
    if (!classPart && classes[0]) {
      classPart = `.${escapeIdent(classes[0])}`;
    }
    part += classPart;

    const parent: Element | null = current.parentElement;
    if (parent) {
      const sameTag = Array.from(parent.children).filter(
        (child) => child.tagName === current!.tagName
      );
      if (sameTag.length > 1) {
        part += `:nth-of-type(${sameTag.indexOf(current) + 1})`;
      } else if (countMatches(parent, part) > 1) {
        const all = Array.from(parent.children);
        part += `:nth-child(${all.indexOf(current) + 1})`;
      }
    }

    parts.unshift(part);
    const trial = parts.join(" > ");
    if (countMatches(doc, trial) === 1) return trial;

    current = parent;
    if (parts.length >= 12) break;
  }

  // Last resort: stable stamp so selection can never collide.
  const uid = ensureEditorUid(el);
  return `[${EDITOR_UID_ATTR}="${uid}"]`;
}

function describeElement(el: Element): EditorSelection {
  const tag = el.tagName;
  const id = el.id;
  const classes = Array.from(el.classList);
  const text = el.textContent?.trim().replace(/\s+/g, " ").slice(0, 28);
  const label = id || classes[0] || text || tag.toLowerCase();
  // Stamp uid so re-find is exact even if the human selector is reused.
  ensureEditorUid(el);
  return { tag, label, selector: uniqueSelector(el) };
}

function findBySelection(
  doc: Document,
  selection: EditorSelection
): Element | null {
  const candidates = [selection.selector, selection.selector.toLowerCase()];

  for (const sel of candidates) {
    try {
      const matches = doc.querySelectorAll(sel);
      if (matches.length === 1) return matches[0]!;
      if (matches.length > 1) {
        // Ambiguous — never silently pick the first unrelated sibling.
        continue;
      }
    } catch {
      /* invalid selector */
    }
  }

  // Demo / legacy selectors like "H3.heading_h3"
  const loose = selection.selector.replace(/^([A-Z0-9]+)/, (_, t) =>
    String(t).toLowerCase()
  );
  if (loose !== selection.selector) {
    try {
      const matches = doc.querySelectorAll(loose);
      if (matches.length === 1) return matches[0]!;
    } catch {
      /* ignore */
    }
  }

  if (selection.tag) {
    try {
      const byTagClass = doc.querySelectorAll(
        `${selection.tag.toLowerCase()}.${escapeIdent(
          selection.label.replace(/[^\w-]/g, "")
        )}`
      );
      if (byTagClass.length === 1) return byTagClass[0]!;
    } catch {
      /* ignore */
    }
  }

  return null;
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
  mode = "design",
  showDimensionsBar = false,
  selection = null,
  onSelect,
  onClearSelection,
  onOpenEdition,
  onOpenCopilot,
  onAskAi,
  previewWidthMode = "fit",
  showSubtestPopover = false,
  onDismissSubtest,
  onLocationChange,
  variationId = "control",
  versionFoldKey = "initial",
}: {
  src?: string;
  device?: EditorDevice;
  mode?: EditorMode;
  showDimensionsBar?: boolean;
  selection?: EditorSelection | null;
  onSelect?: (selection: EditorSelection) => void;
  onClearSelection?: () => void;
  onOpenEdition?: () => void;
  onOpenCopilot?: () => void;
  onAskAi?: (prompt: string, selection: EditorSelection) => void;
  previewWidthMode?: EditorPreviewWidthMode;
  showSubtestPopover?: boolean;
  onDismissSubtest?: () => void;
  onLocationChange?: (url: string) => void;
  /** Active variation — drives first-fold A/B treatment. */
  variationId?: string;
  /** Active save version fold key — drives first-fold history snapshot. */
  versionFoldKey?: string;
}) {
  const preset = DEVICE_PRESETS[device];
  const framed = device !== "desktop";
  const fixedDesktop = !framed && previewWidthMode === "fixed";
  const [frameW, setFrameW] = useState<number | "100%">(preset.w);
  const [frameH, setFrameH] = useState<number | "100%">(preset.h);
  const [dimsLinked, setDimsLinked] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectedElRef = useRef<Element | null>(null);
  const hoverElRef = useRef<Element | null>(null);
  const modeRef = useRef(mode);
  const [box, setBox] = useState<Box | null>(null);
  const [hoverBox, setHoverBox] = useState<Box | null>(null);
  const [frameReady, setFrameReady] = useState(0);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [aiDraft, setAiDraft] = useState("");
  const [wandzOpen, setWandzOpen] = useState(false);
  const aiInputRef = useRef<HTMLInputElement>(null);

  modeRef.current = mode;

  useEffect(() => {
    setAiDraft("");
    setWandzOpen(false);
  }, [selection?.selector]);

  useEffect(() => {
    if (!wandzOpen) return;
    const id = window.requestAnimationFrame(() => aiInputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [wandzOpen]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setFrameW(preset.w);
    setFrameH(preset.h);
  }, [preset.w, preset.h, device]);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (wandzOpen) {
        setWandzOpen(false);
        return;
      }
      if (!selection) return;
      e.preventDefault();
      selectedElRef.current = null;
      setBox(null);
      clearHover();
      onClearSelection?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [wandzOpen, selection, onClearSelection, clearHover]);

  const onClearSelectionRef = useRef(onClearSelection);
  onClearSelectionRef.current = onClearSelection;
  const onLocationChangeRef = useRef(onLocationChange);
  onLocationChangeRef.current = onLocationChange;

  const reportLocation = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    try {
      const href = win.location.href;
      onLocationChangeRef.current?.(href);
    } catch {
      /* cross-origin */
    }
  }, []);

  // Navigate / Code: drop design chrome so the site behaves like a normal page.
  useEffect(() => {
    if (mode === "design") return;
    clearHover();
    selectedElRef.current = null;
    setBox(null);
    onClearSelectionRef.current?.();
  }, [mode, clearHover]);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.documentElement) return;
    doc.documentElement.dataset.editorMode = mode;
  }, [mode, frameReady]);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.getElementById("section-hero")) return;
    applyFirstFold(doc, resolveFirstFold(variationId, versionFoldKey));
    // Re-measure selection after DOM text/layout changes.
    syncSelectedBox();
  }, [variationId, versionFoldKey, frameReady, syncSelectedBox]);

  const bindFrame = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const win = iframe?.contentWindow;
    if (!doc?.body || !win) return;

    const onClick = (e: MouseEvent) => {
      if (modeRef.current !== "design") return;
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
      if (modeRef.current !== "design") {
        clearHover();
        return;
      }
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

    const onLoc = () => reportLocation();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (modeRef.current !== "design") return;
      e.preventDefault();
      e.stopPropagation();
      selectedElRef.current = null;
      setBox(null);
      clearHover();
      onClearSelectionRef.current?.();
    };

    doc.addEventListener("click", onClick, true);
    doc.addEventListener("mousemove", onMove, true);
    doc.addEventListener("mouseleave", onLeave, true);
    doc.addEventListener("scroll", onScrollOrResize, true);
    doc.addEventListener("keydown", onKey, true);
    win.addEventListener("resize", onScrollOrResize);
    win.addEventListener("hashchange", onLoc);
    win.addEventListener("popstate", onLoc);

    setFrameReady((n) => n + 1);
    reportLocation();

    return () => {
      doc.removeEventListener("click", onClick, true);
      doc.removeEventListener("mousemove", onMove, true);
      doc.removeEventListener("mouseleave", onLeave, true);
      doc.removeEventListener("scroll", onScrollOrResize, true);
      doc.removeEventListener("keydown", onKey, true);
      win.removeEventListener("resize", onScrollOrResize);
      win.removeEventListener("hashchange", onLoc);
      win.removeEventListener("popstate", onLoc);
      clearHover();
    };
  }, [
    clearHover,
    onClearSelection,
    onSelect,
    reportLocation,
    syncSelectedBox,
  ]);

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

  useLayoutEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.body) return;
    if (!selection) {
      selectedElRef.current = null;
      setBox(null);
      return;
    }

    // Prefer the element from the live click if it still matches this selection.
    const live = selectedElRef.current;
    if (live?.isConnected) {
      const liveSel = uniqueSelector(live);
      if (
        liveSel === selection.selector ||
        live.getAttribute(EDITOR_UID_ATTR) ===
          selection.selector.match(/data-editor-uid="([^"]+)"/)?.[1]
      ) {
        setBox(rectInFrame(live));
        return;
      }
    }

    const el = findBySelection(doc, selection);
    if (el) {
      selectedElRef.current = el;
      setBox(rectInFrame(el));
      // Only scroll for externally applied selections (scenarios), not every click.
      if (!live?.isConnected) {
        el.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }
  }, [selection, frameReady]);

  useEffect(() => {
    const onWinScroll = () => syncSelectedBox();
    window.addEventListener("resize", onWinScroll);
    return () => window.removeEventListener("resize", onWinScroll);
  }, [syncSelectedBox]);

  const fitToWindow = () => {
    const shell = iframeRef.current?.parentElement?.parentElement?.parentElement;
    if (!shell) return;
    const { clientWidth, clientHeight } = shell;
    const pad = 64;
    setFrameW(Math.max(320, clientWidth - pad));
    setFrameH(Math.max(480, clientHeight - pad));
  };

  const resetResponsive = () => {
    setFrameW(preset.w);
    setFrameH(preset.h);
  };

  const numericW = typeof frameW === "number" ? frameW : 0;
  const numericH = typeof frameH === "number" ? frameH : 0;

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
      {showDimensionsBar && framed && (
        <div className="flex h-9 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 text-xs backdrop-blur-sm">
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
            Dimensions
          </span>
          <button
            type="button"
            onClick={resetResponsive}
            className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Device preset
          </button>
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-1.5 py-0.5">
            <Input
              value={typeof frameW === "number" ? String(frameW) : ""}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isNaN(n)) return;
                setFrameW(n);
                if (dimsLinked && typeof frameH === "number" && numericW > 0) {
                  const ratio = numericH / numericW;
                  setFrameH(Math.round(n * ratio));
                }
              }}
              className="h-6 w-14 border-0 bg-transparent px-1.5 text-xs shadow-none focus-visible:ring-0"
              aria-label="Width"
            />
            <span className="text-muted-foreground/70">×</span>
            <Input
              value={typeof frameH === "number" ? String(frameH) : ""}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isNaN(n)) return;
                setFrameH(n);
                if (dimsLinked && typeof frameW === "number" && numericH > 0) {
                  const ratio = numericW / numericH;
                  setFrameW(Math.round(n * ratio));
                }
              }}
              className="h-6 w-14 border-0 bg-transparent px-1.5 text-xs shadow-none focus-visible:ring-0"
              aria-label="Height"
            />
          </div>
          <button
            type="button"
            onClick={fitToWindow}
            className="rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Fit to window
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "ml-auto size-7 rounded-md",
              dimsLinked && "bg-accent text-foreground"
            )}
            aria-label={dimsLinked ? "Unlink dimensions" : "Link dimensions"}
            aria-pressed={dimsLinked}
            onClick={() => setDimsLinked((v) => !v)}
          >
            <Link2 className="size-3.5" strokeWidth={1.75} />
          </Button>
        </div>
      )}

      <div
        className={cn(
          "relative min-h-0 flex-1 overflow-auto",
          framed
            ? "p-8"
            : fixedDesktop
              ? "flex flex-col py-8"
              : "p-0"
        )}
      >
        <div
          className={cn(
            "relative bg-background",
            framed
              ? "mx-auto my-6 overflow-visible rounded-xl border border-border shadow-sm ring-1 ring-border"
              : fixedDesktop
                ? "mx-auto min-h-0 w-full flex-1"
                : "mx-auto h-full"
          )}
          style={{
            width: framed
              ? frameW
              : fixedDesktop
                ? FIXED_DESKTOP_WIDTH
                : "100%",
            minWidth: fixedDesktop ? FIXED_DESKTOP_WIDTH : undefined,
            height: framed ? frameH : fixedDesktop ? undefined : "100%",
            maxWidth: fixedDesktop ? undefined : "100%",
          }}
        >
          <div
            className={cn(
              "relative size-full overflow-hidden bg-background",
              framed && "rounded-xl"
            )}
          >
            <iframe
              ref={iframeRef}
              title="Website preview"
              src={src}
              className={cn(
                "absolute inset-0 size-full border-0 bg-background",
                mode === "design" ? "cursor-default" : "cursor-auto"
              )}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>

          {/* Selection / hover chrome — Design mode only */}
          {mode === "design" && hoverBox && (
            <div
              className="pointer-events-none absolute z-10 rounded-sm border border-dashed border-foreground/35"
              style={{
                top: hoverBox.top,
                left: hoverBox.left,
                width: hoverBox.width,
                height: hoverBox.height,
              }}
            />
          )}

          {mode === "design" && selection && box && (
            <div
              className="pointer-events-none absolute z-20"
              style={{
                top: box.top,
                left: box.left,
                width: box.width,
                height: box.height,
              }}
            >
              <div className="absolute inset-0 rounded-sm border-2 border-foreground bg-foreground/[0.04]" />
              <div className="pointer-events-auto absolute -top-8 left-0 inline-flex max-w-[min(100%,300px)] items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium tracking-tight text-background shadow-sm">
                <span className="truncate">{selection.selector}</span>
                <span className="mx-0.5 h-3 w-px shrink-0 bg-background/25" />
                <button
                  type="button"
                  className="shrink-0 rounded outline-none opacity-70 transition-opacity hover:opacity-100"
                  aria-label="Copy selector"
                  onClick={(e) => {
                    e.stopPropagation();
                    void (async () => {
                      try {
                        await navigator.clipboard.writeText(selection.selector);
                        showToast("Selector copied");
                      } catch {
                        showToast("Couldn't copy selector");
                      }
                    })();
                  }}
                >
                  <Copy className="size-3" strokeWidth={2} />
                </button>
                {onClearSelection && (
                  <button
                    type="button"
                    className="shrink-0 rounded outline-none opacity-70 transition-opacity hover:opacity-100"
                    aria-label="Clear selection"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearSelection();
                    }}
                  >
                    <X className="size-3" strokeWidth={2} />
                  </button>
                )}
              </div>
              <div className="pointer-events-auto absolute left-0 top-full mt-2.5 flex w-[min(340px,max(100%,280px))] flex-col gap-2">
                <div className="inline-flex w-fit items-center gap-0.5 rounded-full border border-border bg-background p-1 shadow-sm">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-7 rounded-full",
                      wandzOpen && "bg-muted text-foreground"
                    )}
                    aria-label="Wandz"
                    aria-pressed={wandzOpen}
                    title="Wandz"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWandzOpen((open) => !open);
                    }}
                  >
                    <EditorIcon src={aiSparkle} size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-full"
                    aria-label="Edit in Edition"
                    title="Edit in Edition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWandzOpen(false);
                      onOpenEdition?.();
                    }}
                  >
                    <Pencil className="size-3.5" strokeWidth={1.75} />
                  </Button>
                  <span className="mx-0.5 h-4 w-px shrink-0 bg-border" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-full text-muted-foreground/50"
                    aria-label="Move (coming soon)"
                    disabled
                  >
                    <Move className="size-3.5" strokeWidth={1.75} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-full text-muted-foreground/50"
                    aria-label="Link (coming soon)"
                    disabled
                  >
                    <Link2 className="size-3.5" strokeWidth={1.75} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-full text-muted-foreground/50"
                    aria-label="More (coming soon)"
                    disabled
                  >
                    <MoreHorizontal className="size-3.5" strokeWidth={1.75} />
                  </Button>
                </div>

                {wandzOpen && (
                  <div
                    className="relative rounded-xl border border-border bg-background p-3 pt-4 shadow-[0_12px_40px_-12px_hsl(var(--foreground)/0.28)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute -right-2 -top-2 size-7 rounded-full border-border bg-background shadow-sm hover:bg-muted"
                      aria-label="Close Wandz"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWandzOpen(false);
                        setAiDraft("");
                      }}
                    >
                      <EditorIcon src={xClose} size={12} />
                    </Button>

                    <form
                      className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-1.5"
                      onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const next = aiDraft.trim();
                        if (!next) return;
                        onAskAi?.(next, selection);
                        setAiDraft("");
                        setWandzOpen(false);
                        showToast("Sent to AI thread");
                      }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 rounded-full"
                        aria-label="Add context"
                      >
                        <Plus className="size-3.5" strokeWidth={1.75} />
                      </Button>
                      <input
                        ref={aiInputRef}
                        value={aiDraft}
                        onChange={(e) => setAiDraft(e.target.value)}
                        placeholder="Describe your idea"
                        className="h-7 min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                        aria-label="Describe your idea"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 rounded-full text-muted-foreground"
                        aria-label="Formatting"
                      >
                        <CaseSensitive className="size-3.5" strokeWidth={1.75} />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="size-7 shrink-0 rounded-full"
                        aria-label="Voice input"
                      >
                        <EditorIcon src={micIcon} size={14} />
                      </Button>
                    </form>

                    <div className="mt-2 overflow-hidden rounded-lg border border-border">
                      {(
                        [
                          {
                            id: "variations",
                            label: "Create variations",
                            Icon: CopyPlus,
                          },
                          {
                            id: "content",
                            label: "Generate content",
                            Icon: Sparkles,
                          },
                          {
                            id: "more",
                            label: "See more",
                            Icon: MoreHorizontal,
                          },
                        ] as const
                      ).map(({ id, label, Icon }, index) => (
                        <button
                          key={id}
                          type="button"
                          className={cn(
                            "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted",
                            index > 0 && "border-t border-border"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (id === "more") {
                              setWandzOpen(false);
                              onOpenCopilot?.();
                              return;
                            }
                            const prompt =
                              id === "variations"
                                ? "Create variations of this element"
                                : "Generate content for this element";
                            onAskAi?.(prompt, selection);
                            setWandzOpen(false);
                            showToast("Sent to AI thread");
                          }}
                        >
                          <Icon
                            className="size-3.5 shrink-0 text-muted-foreground"
                            strokeWidth={1.75}
                          />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {showSubtestPopover && (
            <div className="absolute left-4 top-4 z-30 w-[240px] overflow-hidden rounded-lg border border-border bg-background shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <p className="text-xs font-semibold text-foreground">Subtest 1</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  aria-label="Close subtest panel"
                  onClick={onDismissSubtest}
                >
                  <X className="size-3.5" strokeWidth={1.75} />
                </Button>
              </div>
              <div className="border-b border-border px-3 py-2">
                <code className="block truncate text-[10px] text-muted-foreground">
                  {selection?.selector ?? "main .text-heading-3"}
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

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-md border border-border bg-foreground px-3 py-2 text-xs font-medium text-background shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
