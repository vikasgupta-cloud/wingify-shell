import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, RotateCcw, Sparkles, X } from "lucide-react";
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
import { useWandzStore, contextKey, type WandzContext } from "../../store/wandz";
import { useVisibleCampaigns } from "../../store/rows";

// Keyframes for the "thinking" dots — inlined so the panel is self-contained.
const DOTS_CSS = `
@keyframes wandz-dot { 0%,80%,100% { opacity: .4 } 40% { opacity: 1 } }
.wandz-dot { animation: wandz-dot 1.2s ease-in-out infinite; }
`;

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

function contextLine(ctx: WandzContext, campaignName?: string): string {
  switch (ctx.kind) {
    case "campaign":
      return campaignName ?? "";
    case "section":
      return campaignName ? `${ctx.sectionLabel} · ${campaignName}` : ctx.sectionLabel;
    case "general":
      return "";
  }
}

function ThinkingRow({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
        <Sparkles className="h-3 w-3 text-muted-foreground" aria-hidden />
      </div>
      {reduced ? (
        <span className="text-sm text-muted-foreground">Thinking…</span>
      ) : (
        <div className="flex items-center gap-1 pt-2" aria-label="Thinking">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="wandz-dot size-1.5 rounded-full bg-muted-foreground/60"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WandzPanel() {
  const context = useWandzStore((s) => s.context);
  const threads = useWandzStore((s) => s.threads);
  const pending = useWandzStore((s) => s.pending);
  const closeWandz = useWandzStore((s) => s.closeWandz);
  const clearThread = useWandzStore((s) => s.clearThread);
  const send = useWandzStore((s) => s.send);

  const campaigns = useVisibleCampaigns();
  const reduced = usePrefersReducedMotion();

  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const key = context ? contextKey(context) : null;
  const messages = key ? threads[key] ?? [] : [];

  // Auto-grow the composer with its content (capped by max-h-32).
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  // Auto-scroll to the newest message and when thinking starts.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, pending]);

  if (!context || !key) return null;

  const campaignName =
    context.kind === "campaign" || context.kind === "section"
      ? campaigns.find((c) => c.id === context.campaignId)?.name
      : undefined;
  const line = contextLine(context, campaignName);

  const submit = () => {
    if (!draft.trim() || pending) return;
    send(draft);
    setDraft("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="sticky top-6 flex max-h-[calc(100vh-56px-3rem)] w-[480px] shrink-0 animate-fade-in-up flex-col overflow-hidden rounded-lg border border-border bg-background duration-200">
      <style>{DOTS_CSS}</style>

      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
        <Sparkles className="h-4 w-4 shrink-0 text-foreground" aria-hidden />
        <span className="text-sm font-medium text-foreground">Wandz</span>
        {line && (
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={line}>
            {line}
          </span>
        )}
        <div className={cn("flex items-center gap-0.5", !line && "ml-auto")}>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Clear conversation"
                  className="h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => clearThread(key)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear conversation</TooltipContent>
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

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {messages.map((msg) =>
          msg.role === "assistant" ? (
            <div key={msg.id} className="flex gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                <Sparkles className="h-3 w-3 text-muted-foreground" aria-hidden />
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {msg.body}
              </p>
            </div>
          ) : (
            <div key={msg.id} className="flex justify-end gap-3">
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
        {pending && <ThinkingRow reduced={reduced} />}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border p-3">
        <Textarea
          ref={textareaRef}
          rows={1}
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
            onClick={submit}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
