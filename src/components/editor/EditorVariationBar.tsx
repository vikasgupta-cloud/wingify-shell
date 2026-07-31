import { useEffect, useState } from "react";
import {
  ChevronDown,
  MoreHorizontal,
  MoreVertical,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditorIcon } from "./EditorIcon";
import type {
  EditorDevice,
  EditorLayoutMode,
} from "@/config/editorScenarios";

import plusSm from "@/assets/editor/plus-sm.svg";

export type VariationId = "control" | "v1" | "v2";

const VARIATIONS: { id: VariationId; label: string; chip: string }[] = [
  { id: "control", label: "Control", chip: "C" },
  { id: "v1", label: "Variation 01", chip: "V1" },
  { id: "v2", label: "Variation 02", chip: "V2" },
];

const SUBTESTS = [
  { id: "s1", label: "Subtest 1" },
  { id: "s2", label: "Subtest 2" },
  { id: "s3", label: "Subtest 3" },
];

const DEVICES: { id: EditorDevice; icon: typeof Monitor; label: string }[] = [
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
];

export function EditorVariationBar({
  layoutMode = "default",
  device = "desktop",
  onDeviceChange,
  activeVariationId,
  onVariationChange,
}: {
  layoutMode?: EditorLayoutMode;
  device?: EditorDevice;
  onDeviceChange?: (device: EditorDevice) => void;
  activeVariationId?: VariationId;
  onVariationChange?: (id: VariationId) => void;
}) {
  const [active, setActive] = useState<VariationId>(activeVariationId ?? "v1");
  const [subtest, setSubtest] = useState("s1");
  const [page, setPage] = useState("Page 1");

  useEffect(() => {
    if (activeVariationId) setActive(activeVariationId);
  }, [activeVariationId]);

  const select = (id: VariationId) => {
    setActive(id);
    onVariationChange?.(id);
  };

  return (
    <div className="relative flex h-9 shrink-0 items-center justify-between border-b border-border bg-muted/60">
      <div className="flex h-full min-w-0 items-center">
        {layoutMode === "multipage" && (
          <>
            <button
              type="button"
              className="inline-flex h-full items-center gap-1 px-3 text-[13px] font-semibold text-foreground outline-none hover:bg-muted"
            >
              {page}
              <ChevronDown
                className="size-3.5 text-muted-foreground"
                strokeWidth={1.75}
              />
            </button>
            <div className="mx-1 h-5 w-px bg-border" />
          </>
        )}

        {layoutMode === "mvt" ? (
          <>
            {SUBTESTS.map((s) => {
              const isActive = subtest === s.id;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "relative flex h-full items-center",
                    isActive && "bg-background"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSubtest(s.id)}
                    className={cn(
                      "flex h-full items-center px-3 text-[13px] font-medium outline-none",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
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
              className="h-7 gap-1.5 rounded-md px-2 text-[13px] font-medium"
            >
              <EditorIcon src={plusSm} size={14} />
              JS/CSS section
            </Button>
          </>
        ) : (
          <>
            {VARIATIONS.map((v) => {
              const isActive = active === v.id;
              return (
                <div
                  key={v.id}
                  className={cn(
                    "relative flex h-full items-center",
                    isActive && "bg-background"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => select(v.id)}
                    className="flex h-full items-center gap-1.5 px-3 outline-none"
                  >
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-muted px-1.5 text-[11px] font-medium leading-none text-foreground">
                      {v.chip}
                    </span>
                    <span
                      className={cn(
                        "max-w-[120px] truncate text-[13px] font-medium leading-none",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {v.label}
                    </span>
                    <span
                      className={cn(
                        "inline-flex size-5 items-center justify-center text-foreground",
                        !isActive && "opacity-40"
                      )}
                      aria-hidden
                    >
                      <MoreVertical className="size-3.5" strokeWidth={1.75} />
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
              className="h-7 gap-1.5 rounded-md px-2 text-[13px] font-medium text-foreground"
            >
              <EditorIcon src={plusSm} size={14} />
              New variation
            </Button>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 pr-2">
        <button
          type="button"
          className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-semibold text-foreground outline-none hover:bg-muted"
          aria-label="Language"
          onClick={() => setPage(page)}
        >
          EN
          <ChevronDown
            className="size-3.5 text-muted-foreground"
            strokeWidth={1.75}
          />
        </button>

        <div className="flex h-7 items-center gap-1 rounded-md border border-border bg-muted p-px">
          {DEVICES.map((d) => {
            const selected = device === d.id;
            const DeviceIcon = d.icon;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onDeviceChange?.(d.id)}
                aria-label={d.label}
                className={cn(
                  "inline-flex h-[26px] items-center justify-center rounded-[5px] px-2 text-foreground outline-none transition-colors",
                  selected
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <DeviceIcon className="size-4" strokeWidth={1.75} />
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
          <MoreHorizontal className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  );
}
