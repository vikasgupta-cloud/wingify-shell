import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Mic,
  MoreVertical,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditorIcon } from "./EditorIcon";

import aiSparkle from "@/assets/editor/ai-sparkle.svg";
import fixPanel from "@/assets/editor/fix-panel.svg";
import send from "@/assets/editor/send.svg";
import paletteSm from "@/assets/editor/palette-sm.svg";
import move from "@/assets/editor/move.svg";

type PanelTab = "copilot" | "edition";

const SUGGESTIONS: { icon: string; label: string }[] = [
  { icon: paletteSm, label: "Make the headline text larger" },
  { icon: move, label: "Move the image to the left" },
  { icon: paletteSm, label: "Change the button color to green" },
];

export function EditorCopilotPanel({
  userName = "Randeep",
  onClose,
}: {
  userName?: string;
  onClose?: () => void;
}) {
  const [tab, setTab] = useState<PanelTab>("copilot");
  const [draft, setDraft] = useState("");

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-l border-border bg-background">
      <div className="relative flex h-9 shrink-0 items-end border-b border-border px-4 pt-2">
        <div className="flex h-7 items-start gap-4">
          <button
            type="button"
            onClick={() => setTab("copilot")}
            className={cn(
              "relative flex h-7 items-center gap-1.5 pb-2 text-xs font-semibold outline-none",
              tab === "copilot" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <EditorIcon src={aiSparkle} size={14} className="grayscale" />
            Copilot
            {tab === "copilot" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("edition")}
            className={cn(
              "relative flex h-7 items-center pb-2 text-xs font-semibold outline-none",
              tab === "edition" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Edition
            {tab === "edition" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
            )}
          </button>
        </div>
        <div className="absolute right-2 top-1 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg"
            aria-label="Dock panel"
          >
            <EditorIcon src={fixPanel} size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg"
            aria-label="Close panel"
            onClick={onClose}
          >
            <X className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 pt-3">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-semibold text-foreground outline-none"
          >
            New chat
            <ChevronDown
              className="size-4 text-muted-foreground"
              strokeWidth={1.75}
            />
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 rounded-md"
            aria-label="Chat options"
          >
            <MoreVertical className="size-3.5" strokeWidth={1.75} />
          </Button>
        </div>

        {tab === "copilot" ? (
          <div className="flex flex-1 flex-col items-center px-4 pb-28 pt-16">
            <div className="mb-5 flex size-[50px] items-center justify-center rounded-full bg-muted">
              <EditorIcon src={aiSparkle} size={24} className="grayscale" />
            </div>
            <div className="mb-12 flex w-full flex-col items-center gap-2 text-center">
              <p className="text-sm font-semibold text-foreground">
                Hi {userName}! How can I help you today?
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                Quickly modify your variation using natural language - just type
                or speak your commands.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 px-3">
              <p className="text-xs text-muted-foreground">
                Try asking something like:
              </p>
              {SUGGESTIONS.map((s) => (
                <Button
                  key={s.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-[26px] justify-start gap-2 rounded-md px-2 text-xs font-medium"
                  onClick={() => setDraft(s.label)}
                >
                  <EditorIcon
                    src={s.icon}
                    size={14}
                    className="text-muted-foreground"
                  />
                  {s.label}
                </Button>
              ))}
              <button
                type="button"
                className="inline-flex h-[26px] items-center gap-1.5 px-1 text-xs font-semibold text-foreground outline-none hover:underline"
              >
                <EditorIcon src={aiSparkle} size={13} className="grayscale" />
                See how VWO AI can help you
                <ChevronRight className="size-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
            Edition tools will appear here.
          </div>
        )}

        <div className="absolute inset-x-4 bottom-3">
          <div className="relative flex h-24 items-end justify-between overflow-hidden rounded-lg border border-border bg-background p-3 transition-colors focus-within:border-input">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask anything....."
              className="absolute inset-x-3 bottom-10 top-3 resize-none bg-transparent text-[13px] leading-5 text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative z-10 size-7 rounded-md"
              aria-label="Attach"
            >
              <Plus className="size-[18px]" strokeWidth={1.75} />
            </Button>
            <div className="relative z-10 flex items-center gap-1.5">
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
                className="size-7 rounded-md"
                aria-label="Send"
              >
                <EditorIcon src={send} size={15} />
              </Button>
            </div>
          </div>
          <p className="mt-1.5 whitespace-nowrap text-center text-[10.5px] leading-4 text-muted-foreground">
            AI can make mistakes. Please verify the information.
          </p>
        </div>
      </div>
    </aside>
  );
}
