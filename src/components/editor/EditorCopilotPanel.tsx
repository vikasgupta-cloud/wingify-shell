import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Mic,
  MoreVertical,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EditorIcon } from "./EditorIcon";
import { EditorFloatablePanel } from "./EditorFloatablePanel";
import type {
  EditorPanelChrome,
  EditorPanelGroupDragHandlers,
} from "./EditorFloatablePanel";
import type { EditorSelection } from "@/config/editorScenarios";
import type { AiMessage, AiThread } from "@/config/editorAi";

import aiSparkle from "@/assets/editor/ai-sparkle.svg";
import send from "@/assets/editor/send.svg";

/** Dedicated AI chat thread — receives inline selection prompts and panel chat. */
export function EditorCopilotPanel({
  onClose,
  chrome,
  onChromeChange,
  onReattach,
  grouped,
  tabPane,
  groupDrag,
  selection = null,
  onClearSelection,
  threads,
  activeThread,
  activeThreadId,
  onSelectThread,
  onNewThread,
  onSend,
  busy = false,
}: {
  onClose?: () => void;
  chrome: EditorPanelChrome;
  onChromeChange: (next: EditorPanelChrome) => void;
  onReattach?: () => void;
  grouped?: boolean;
  tabPane?: boolean;
  groupDrag?: EditorPanelGroupDragHandlers;
  selection?: EditorSelection | null;
  onClearSelection?: () => void;
  threads: AiThread[];
  activeThread: AiThread;
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onSend: (prompt: string) => void;
  busy?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [activeThread.messages, busy]);

  const submit = () => {
    const next = draft.trim();
    if (!next || busy) return;
    onSend(next);
    setDraft("");
  };

  const empty = activeThread.messages.length === 0;

  return (
    <EditorFloatablePanel
      title="AI thread"
      icon={<EditorIcon src={aiSparkle} size={14} />}
      onClose={onClose}
      bodyClassName="relative min-h-0"
      chrome={chrome}
      onChromeChange={onChromeChange}
      onReattach={onReattach}
      grouped={grouped}
      tabPane={tabPane}
      groupDrag={groupDrag}
    >
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 max-w-[200px] gap-1 px-2 text-xs font-semibold"
            >
              <span className="truncate">{activeThread.title}</span>
              <ChevronDown
                className="size-3.5 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Threads</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {threads.map((thread) => (
              <DropdownMenuItem
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={cn(
                  thread.id === activeThreadId && "bg-accent font-semibold"
                )}
              >
                <span className="truncate">{thread.title}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onNewThread}>New thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-medium"
            onClick={onNewThread}
          >
            New
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-md"
            aria-label="Thread options"
          >
            <MoreVertical className="size-3.5" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {empty ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center px-3 text-center">
            <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted">
              <Sparkles className="size-5" strokeWidth={1.75} />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Select an element, then ask
            </p>
            <p className="mt-1.5 max-w-[220px] text-xs leading-5 text-muted-foreground">
              Prompt on the canvas or type here. This thread keeps the full AI
              conversation.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-28">
            {activeThread.messages.map((msg) => (
              <ThreadMessage key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      <div className="absolute inset-x-3 bottom-3">
        {selection && (
          <div className="mb-2 inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1">
            <code className="truncate text-[11px] font-medium text-foreground">
              {selection.selector}
            </code>
            <button
              type="button"
              aria-label="Clear selection"
              className="text-muted-foreground hover:text-foreground"
              onClick={onClearSelection}
            >
              ×
            </button>
          </div>
        )}
        <div className="rounded-lg border border-border bg-background p-2 shadow-none focus-within:border-input">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={
              selection
                ? "Ask AI to change the selected element…"
                : "Ask AI anything about this page…"
            }
            className="min-h-[56px] resize-none border-0 p-1 text-[13px] shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded-md"
              aria-label="Attach"
            >
              <Plus className="size-4" strokeWidth={1.75} />
            </Button>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 rounded-md"
                aria-label="Voice input"
              >
                <Mic className="size-4" strokeWidth={1.75} />
              </Button>
              <Button
                type="button"
                size="icon"
                className="size-7 rounded-md shadow-none"
                aria-label="Send"
                disabled={busy || !draft.trim()}
                onClick={submit}
              >
                <EditorIcon src={send} size={15} />
              </Button>
            </div>
          </div>
        </div>
        <p className="mt-1.5 text-center text-[10.5px] leading-4 text-muted-foreground">
          AI can make mistakes. Please verify the information.
        </p>
      </div>
    </EditorFloatablePanel>
  );
}

function ThreadMessage({ message }: { message: AiMessage }) {
  const mine = message.role === "user";
  return (
    <div className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}>
      {message.selector && (
        <code className="max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {message.selector}
        </code>
      )}
      <div
        className={cn(
          "max-w-[92%] rounded-lg px-2.5 py-2 text-[13px] leading-5",
          mine
            ? "bg-foreground text-background"
            : "border border-border bg-muted text-foreground"
        )}
      >
        {message.status === "pending" ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Sparkles className="size-3.5 animate-pulse" strokeWidth={1.75} />
            Working on it…
          </span>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
}
