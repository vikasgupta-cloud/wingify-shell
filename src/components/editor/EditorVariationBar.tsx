import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditorIcon } from "./EditorIcon";

import plusSm from "@/assets/editor/plus-sm.svg";
import chevronDown from "@/assets/editor/chevron-down.svg";
import monitor from "@/assets/editor/monitor.svg";
import tablet from "@/assets/editor/tablet.svg";
import phone from "@/assets/editor/phone.svg";
import dotsH from "@/assets/editor/dots-h.svg";
import dotsV from "@/assets/editor/dots-v.svg";

type VariationId = "control" | "v1" | "v2";
type Device = "desktop" | "tablet" | "mobile";

const VARIATIONS: {
  id: VariationId;
  label: string;
  chip: string;
  chipClass: string;
}[] = [
  {
    id: "control",
    label: "Control",
    chip: "C",
    chipClass: "border-border bg-muted text-foreground",
  },
  {
    id: "v1",
    label: "Variation 01",
    chip: "V1",
    chipClass: "border-border bg-secondary text-foreground",
  },
  {
    id: "v2",
    label: "Variation 02",
    chip: "V2",
    chipClass: "border-border bg-muted text-muted-foreground",
  },
];
const DEVICES: { id: Device; icon: string; label: string }[] = [
  { id: "desktop", icon: monitor, label: "Desktop" },
  { id: "tablet", icon: tablet, label: "Tablet" },
  { id: "mobile", icon: phone, label: "Mobile" },
];

export function EditorVariationBar({
  activeVariationId,
  onVariationChange,
}: {
  activeVariationId?: VariationId;
  onVariationChange?: (id: VariationId) => void;
}) {
  const [active, setActive] = useState<VariationId>(activeVariationId ?? "v1");
  const [device, setDevice] = useState<Device>("desktop");

  const select = (id: VariationId) => {
    setActive(id);
    onVariationChange?.(id);
  };

  return (
    <div className="relative flex h-9 shrink-0 items-center justify-between border-b border-border bg-muted/60 px-0">
      <div className="flex h-full items-center">
        {VARIATIONS.map((v) => {
          const isActive = active === v.id;
          return (
            <div
              key={v.id}
              className={cn(
                "relative flex h-full flex-col justify-end",
                isActive && "bg-background"
              )}
            >
              <button
                type="button"
                onClick={() => select(v.id)}
                className="flex h-6 items-center gap-1.5 pl-3 pr-1.5 outline-none"
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full border px-1.5 text-[11px] font-medium leading-4",
                    v.chipClass
                  )}
                >
                  {v.chip}
                </span>
                <span
                  className={cn(
                    "max-w-[120px] truncate text-xs font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {v.label}
                </span>
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-md",
                    !isActive && "opacity-40"
                  )}
                  aria-hidden
                >
                  <EditorIcon src={dotsV} size={14} />
                </span>
              </button>
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
              )}
            </div>
          );
        })}

        <div className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 rounded-md px-2 text-xs font-medium text-foreground"
        >
          <EditorIcon src={plusSm} size={14} />
          New variation
        </Button>
      </div>

      <div className="flex items-center gap-2 pr-2">
        <button
          type="button"
          className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-semibold text-foreground outline-none hover:bg-muted"
          aria-label="Language"
        >
          EN
          <EditorIcon src={chevronDown} size={16} />
        </button>

        <div className="flex h-6 items-center gap-1 rounded-md border border-border bg-muted p-px">
          {DEVICES.map((d) => {
            const selected = device === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDevice(d.id)}
                aria-label={d.label}
                className={cn(
                  "inline-flex h-[22px] items-center justify-center rounded-md px-2 outline-none",
                  selected && "bg-background shadow-sm"
                )}
              >
                <EditorIcon src={d.icon} size={16} />
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 rounded-md"
          aria-label="More options"
        >
          <EditorIcon src={dotsH} size={14} />
        </Button>
      </div>
    </div>
  );
}
