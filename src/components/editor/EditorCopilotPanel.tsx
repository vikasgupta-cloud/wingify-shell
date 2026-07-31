import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Mic,
  MoreVertical,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorIcon } from "./EditorIcon";
import { EditorFloatablePanel } from "./EditorFloatablePanel";
import type {
  EditorPanelChrome,
  EditorPanelGroupDragHandlers,
} from "./EditorFloatablePanel";

import aiSparkle from "@/assets/editor/ai-sparkle.svg";
import send from "@/assets/editor/send.svg";
import paletteSm from "@/assets/editor/palette-sm.svg";
import move from "@/assets/editor/move.svg";

const SUGGESTIONS: { icon: string; label: string }[] = [
  { icon: paletteSm, label: "Make the headline text larger" },
  { icon: move, label: "Move the image to the left" },
  { icon: paletteSm, label: "Change the button color to green" },
];

/** Wandz Copilot side panel — opened from the editor utility rail. */
export function EditorCopilotPanel({
  userName = "Randeep",
  onClose,
  chrome,
  onChromeChange,
  onReattach,
  grouped,
  tabPane,
  groupDrag,
}: {
  userName?: string;
  onClose?: () => void;
  chrome: EditorPanelChrome;
  onChromeChange: (next: EditorPanelChrome) => void;
  onReattach?: () => void;
  grouped?: boolean;
  tabPane?: boolean;
  groupDrag?: EditorPanelGroupDragHandlers;
}) {
  const [draft, setDraft] = useState("");

  return (
    <EditorFloatablePanel
      title="Wandz Copilot"
      icon={<EditorIcon src={aiSparkle} size={14} className="grayscale" />}
      onClose={onClose}
      bodyClassName="relative"
      chrome={chrome}
      onChromeChange={onChromeChange}
      onReattach={onReattach}
      grouped={grouped}
      tabPane={tabPane}
      groupDrag={groupDrag}
    >
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

      <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-28 pt-16">
        <div className="mb-5 flex size-[50px] items-center justify-center rounded-full bg-muted">
          <EditorIcon src={aiSparkle} size={24} className="grayscale" />
        </div>
        <div className="mb-12 flex w-full flex-col items-center gap-2 text-center">
          <p className="text-sm font-semibold text-foreground">
            Hi {userName}! How can I help you today?
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            Quickly modify your variation using natural language - just type or
            speak your commands.
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
    </EditorFloatablePanel>
  );
}
