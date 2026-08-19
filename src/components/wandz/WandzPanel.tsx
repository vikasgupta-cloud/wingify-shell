import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUp,
  Maximize2,
  Minimize2,
  Sparkles,
  X,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "../../lib/utils";
import { useWandzStore, contextKey } from "../../store/wandz";
import {
  SIDE_PANEL_WIDTH,
  useSidePanelWidthStore,
} from "../../store/sidePanelWidth";
import { useVisibleCampaigns } from "../../store/rows";
import SuggestionsPanel from "../detail-panels/SuggestionsPanel";

// Keyframes for the "thinking" dots — inlined so the panel is self-contained.
const DOTS_CSS = `
@keyframes wandz-dot { 0%,80%,100% { opacity: .4 } 40% { opacity: 1 } }
.wandz-dot { animation: wandz-dot 1.2s ease-in-out infinite; }
`;

const WANDZ_TABS = [
  { id: "chat" as const, label: "Chat" },
  { id: "insights" as const, label: "Insights" },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

function ThinkingRow({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-highlight-bg">
        <Sparkles className="h-3 w-3 text-highlight-fg" aria-hidden />
      </div>
      {reduced ? (
        <span className="text-sm text-muted-foreground">Thinking…</span>
      ) : (
        <div className="flex items-center gap-1 pt-2" aria-label="Thinking">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="wandz-dot size-1.5 rounded-full bg-highlight-fg/60"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Cap the docked panel to the space between its live top edge and the bottom of
 * the scroll viewport (usually <main>). Same approach as Quick View.
 */
function useViewportCappedMaxHeight(
  rootRef: React.RefObject<HTMLDivElement | null>,
  active: boolean
) {
  const [maxHeight, setMaxHeight] = useState<number>();

  useLayoutEffect(() => {
    if (!active) {
      setMaxHeight(undefined);
      return;
    }

    const update = () => {
      const el = rootRef.current;
      if (!el) return;
      const scroller = el.closest("main");
      const top = el.getBoundingClientRect().top;
      const bottom = scroller
        ? scroller.getBoundingClientRect().bottom
        : window.innerHeight;
      const avail = Math.floor(bottom - top - 16);
      if (avail > 160) setMaxHeight(avail);
    };

    update();
    const scroller = rootRef.current?.closest("main");
    scroller?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro = scroller ? new ResizeObserver(update) : null;
    if (scroller) ro?.observe(scroller);
    return () => {
      scroller?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, [active, rootRef]);

  return maxHeight;
}

function ChatMessages({
  messages,
  pending,
  reduced,
  listRef,
  wide,
}: {
  messages: { id: string; role: "user" | "assistant"; body: string }[];
  pending: boolean;
  reduced: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  wide?: boolean;
}) {
  return (
    <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
      <div
        className={cn(
          "flex flex-col gap-4",
          wide ? "px-8 pb-6 pt-6" : "px-4 pb-4 pt-5"
        )}
      >
        {messages.map((msg) =>
          msg.role === "assistant" ? (
            <div key={msg.id} className={cn("flex gap-3", wide && "mx-auto w-full max-w-4xl")}>
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-highlight-bg">
                <Sparkles className="h-3 w-3 text-highlight-fg" aria-hidden />
              </div>
              <p
                className={cn(
                  "whitespace-pre-wrap leading-relaxed text-foreground",
                  wide ? "text-[15px]" : "text-sm"
                )}
              >
                {msg.body}
              </p>
            </div>
          ) : (
            <div
              key={msg.id}
              className={cn("flex justify-end gap-3", wide && "mx-auto w-full max-w-4xl")}
            >
              <p className="max-w-[80%] whitespace-pre-wrap rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
                {msg.body}
              </p>
              <Avatar className="size-6 shrink-0">
                <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
                  JD
                </AvatarFallback>
              </Avatar>
            </div>
          )
        )}
        {pending && (
          <div className={cn(wide && "mx-auto w-full max-w-4xl")}>
            <ThinkingRow reduced={reduced} />
          </div>
        )}
      </div>
    </div>
  );
}

function ChatComposer({
  draft,
  setDraft,
  pending,
  onSubmit,
  textareaRef,
  wide,
}: {
  draft: string;
  setDraft: (v: string) => void;
  pending: boolean;
  onSubmit: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  wide?: boolean;
}) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      className={cn(
        "shrink-0 border-t border-border",
        wide ? "px-8 py-4" : "p-3"
      )}
    >
      <div className={cn(wide && "mx-auto w-full max-w-4xl")}>
        <Textarea
          ref={textareaRef}
          rows={wide ? 2 : 1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask Wandz…"
          className="max-h-32 min-h-0 resize-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Enter to send · Shift+Enter for a new line
          </span>
          <Button
            type="button"
            size="sm"
            aria-label="Send"
            className="h-8 w-8 p-0"
            disabled={!draft.trim() || pending}
            onClick={onSubmit}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function PanelHeader({ fullPreview }: { fullPreview: boolean }) {
  const closeWandz = useWandzStore((s) => s.closeWandz);
  const setFullPreview = useWandzStore((s) => s.setFullPreview);
  const panelTab = useWandzStore((s) => s.panelTab);
  const setPanelTab = useWandzStore((s) => s.setPanelTab);

  return (
    <div className="flex shrink-0 flex-col border-b border-border">
      <div className="flex items-center gap-2 px-4 py-3">
        <Sparkles className="h-4 w-4 shrink-0 text-highlight-fg" aria-hidden />
        <span className="text-sm font-medium text-highlight-fg">Wandz</span>
        <div className="ml-auto flex items-center gap-0.5">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={fullPreview ? "Exit full preview" : "Full preview"}
                  className="h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setFullPreview(!fullPreview)}
                >
                  {fullPreview ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {fullPreview ? "Exit full preview" : "Full preview"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close Wandz"
            className="h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground"
            onClick={closeWandz}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        className="flex items-end gap-5 px-4"
        role="tablist"
        aria-label="Wandz views"
      >
        {WANDZ_TABS.map((tab) => {
          const active = panelTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPanelTab(tab.id)}
              className={cn(
                "relative -mb-px px-0.5 pb-2.5 text-sm transition-colors",
                active
                  ? "border-b-2 border-foreground font-medium text-foreground"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function WandzPanel({
  className,
  fillHeight = false,
}: {
  className?: string;
  /** Fill a fixed-height dock column (Reports). Skip sticky / viewport height cap. */
  fillHeight?: boolean;
}) {
  const context = useWandzStore((s) => s.context);
  const threads = useWandzStore((s) => s.threads);
  const drafts = useWandzStore((s) => s.drafts);
  const pending = useWandzStore((s) => s.pending);
  const fullPreview = useWandzStore((s) => s.fullPreview);
  const panelTab = useWandzStore((s) => s.panelTab);
  const setFullPreview = useWandzStore((s) => s.setFullPreview);
  const setDraft = useWandzStore((s) => s.setDraft);
  const send = useWandzStore((s) => s.send);
  const width = useSidePanelWidthStore((s) => s.width);
  const setWidth = useSidePanelWidthStore((s) => s.setWidth);
  const campaigns = useVisibleCampaigns();

  const reduced = usePrefersReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const key = context ? contextKey(context) : null;
  const messages = key ? threads[key] ?? [] : [];
  const draft = key ? drafts[key] ?? "" : "";
  const campaignId =
    context?.kind === "campaign" || context?.kind === "section"
      ? context.campaignId
      : null;
  const campaign =
    campaignId != null
      ? (campaigns.find((c) => c.id === campaignId) ?? null)
      : null;
  const maxHeight = useViewportCappedMaxHeight(
    rootRef,
    Boolean(context && key && !fullPreview && !fillHeight)
  );

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft, fullPreview, panelTab]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, pending, fullPreview, panelTab]);

  // Escape exits full preview first, then closes (handled by close button).
  useEffect(() => {
    if (!fullPreview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setFullPreview(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullPreview, setFullPreview]);

  if (!context || !key) return null;

  const submit = () => {
    if (!draft.trim() || pending) return;
    send(draft);
  };

  const body =
    panelTab === "insights" ? (
      <SuggestionsPanel key={campaign?.id ?? "none"} campaign={campaign} />
    ) : (
      <>
        <ChatMessages
          messages={messages}
          pending={pending}
          reduced={reduced}
          listRef={listRef}
          wide={fullPreview}
        />
        <ChatComposer
          draft={draft}
          setDraft={(v) => setDraft(key, v)}
          pending={pending}
          onSubmit={submit}
          textareaRef={textareaRef}
          wide={fullPreview}
        />
      </>
    );

  const panel = (
    <>
      <style>{DOTS_CSS}</style>
      <PanelHeader fullPreview={fullPreview} />
      {body}
    </>
  );

  if (fullPreview) {
    return createPortal(
      <div
        className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background duration-200 animate-in fade-in-0"
        role="dialog"
        aria-modal="true"
        aria-label="Wandz full preview"
      >
        {panel}
      </div>,
      document.body
    );
  }

  return (
    <div
      ref={rootRef}
      style={
        fillHeight
          ? { width, height: "100%" }
          : maxHeight
            ? { maxHeight, height: maxHeight, width }
            : { width }
      }
      className={cn(
        "relative flex shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-background",
        fillHeight
          ? "h-full min-h-0 max-h-full"
          : "sticky top-6 max-h-[calc(100dvh-8rem)]",
        className
      )}
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        aria-valuenow={width}
        aria-valuemin={SIDE_PANEL_WIDTH.min}
        aria-valuemax={SIDE_PANEL_WIDTH.max}
        onPointerDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startWidth = width;
          const onMove = (ev: PointerEvent) => {
            setWidth(startWidth + (startX - ev.clientX));
          };
          const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
          };
          document.body.style.cursor = "col-resize";
          document.body.style.userSelect = "none";
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
        }}
        className="absolute inset-y-0 left-0 z-20 w-2.5 cursor-col-resize touch-none hover:bg-foreground/10"
      />
      {panel}
    </div>
  );
}
