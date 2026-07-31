import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditorIcon } from "./EditorIcon";

import aiSparkle from "@/assets/editor/ai-sparkle.svg";
import copilotV1 from "@/assets/editor/copilot-v1.svg";
import copilotV2 from "@/assets/editor/copilot-v2.svg";
import copilotV3 from "@/assets/editor/copilot-v3.svg";
import copilotRing from "@/assets/editor/copilot-ring.svg";
import fixPanel from "@/assets/editor/fix-panel.svg";
import xClose from "@/assets/editor/x-close.svg";
import chevronDown from "@/assets/editor/chevron-down.svg";
import chevronRight from "@/assets/editor/chevron-right.svg";
import dotsV from "@/assets/editor/dots-v.svg";
import plus from "@/assets/editor/plus.svg";
import mic from "@/assets/editor/mic.svg";
import send from "@/assets/editor/send.svg";
import paletteSm from "@/assets/editor/palette-sm.svg";
import move from "@/assets/editor/move.svg";
import aiPowered from "@/assets/editor/ai-powered.svg";

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
        <div className="flex h-7 items-start gap-3">
          <button
            type="button"
            onClick={() => setTab("copilot")}
            className={cn(
              "relative flex h-7 items-center gap-1.5 pb-2 pl-1 pr-1.5 text-xs font-semibold outline-none",
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
              "relative flex h-7 items-center px-1 pb-2 text-xs font-semibold outline-none",
              tab === "edition" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Edition
            {tab === "edition" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
            )}
          </button>
        </div>
        <div className="absolute right-2 top-1 flex items-center gap-2">
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
            <EditorIcon src={xClose} size={16} />
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 pt-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground outline-none"
          >
            New chat
            <EditorIcon src={chevronDown} size={14} />
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 rounded-md"
            aria-label="Chat options"
          >
            <EditorIcon src={dotsV} size={14} />
          </Button>
        </div>

        {tab === "copilot" ? (
          <div className="flex flex-1 flex-col items-center px-4 pb-28 pt-16">
            <div className="relative mb-2.5 size-[50px] overflow-hidden rounded-full bg-muted">
              <span className="absolute left-1/2 top-1/2 size-[25px] -translate-x-1/2 -translate-y-1/2 overflow-hidden grayscale">
                <img
                  src={copilotRing}
                  alt=""
                  className="absolute inset-0 size-full max-w-none"
                />
                <img
                  src={copilotV1}
                  alt=""
                  className="absolute left-[33%] top-[8%] h-[38%] w-[38%] max-w-none"
                />
                <img
                  src={copilotV2}
                  alt=""
                  className="absolute bottom-[21%] left-[4%] h-[29%] w-[29%] max-w-none"
                />
                <img
                  src={copilotV3}
                  alt=""
                  className="absolute bottom-[17%] right-[17%] h-[17%] w-[15%] max-w-none"
                />
              </span>
            </div>
            <div className="mb-10 flex w-full flex-col items-center gap-2 text-center">
              <p className="text-sm font-semibold text-foreground">
                Hi {userName}! How can I help you today?
              </p>
              <p className="text-xs leading-[22px] text-muted-foreground">
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
                  <EditorIcon src={s.icon} size={14} />
                  {s.label}
                </Button>
              ))}
              <button
                type="button"
                className="inline-flex h-[26px] items-center gap-1.5 text-xs font-semibold text-foreground outline-none hover:underline"
              >
                <EditorIcon src={aiPowered} size={14} className="grayscale" />
                See how VWO AI can help you
                <EditorIcon src={chevronRight} size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
            Edition tools will appear here.
          </div>
        )}

        <div className="absolute inset-x-4 bottom-8">
          <div className="relative flex h-24 items-end justify-between overflow-hidden rounded-md border border-border bg-background p-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask anything....."
              className="absolute inset-x-3 top-3 bottom-10 resize-none bg-transparent text-xs leading-[18px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative z-10 size-7 rounded-md"
              aria-label="Attach"
            >
              <EditorIcon src={plus} size={16} />
            </Button>
            <div className="relative z-10 flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 rounded-md"
                aria-label="Voice input"
              >
                <EditorIcon src={mic} size={16} />
              </Button>
              <Button
                type="button"
                size="icon"
                className="size-7 rounded-md"
                aria-label="Send"
              >
                <EditorIcon src={send} size={16} />
              </Button>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] leading-4 text-muted-foreground">
            AI can make mistakes. Please verify the information.
          </p>
        </div>
      </div>
    </aside>
  );
}
