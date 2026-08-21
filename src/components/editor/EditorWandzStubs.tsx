// Summary: Wandz stub flows — panel body for Edition empty state, or a compact
// floating card anchored to the selected element. Subflows stay inside the card.
// Grayscale shell; Create variations / Generate content / attach are stubs.

import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CaseSensitive,
  ChevronRight,
  CopyPlus,
  Ellipsis,
  FileText,
  Globe,
  ImageIcon,
  LayoutTemplate,
  Mic,
  Paperclip,
  Palette,
  Plus,
  Sparkles,
  WandSparkles,
  X,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type WandzScreen = "home" | "variations" | "content";
export type WandzVariant = "panel" | "float";

type AttachItem = {
  id: string;
  label: string;
  icon: typeof Paperclip;
  chevron?: boolean;
  section?: "start" | "mid" | "end";
};

const ATTACH_ITEMS: AttachItem[] = [
  { id: "files", label: "Add images and files", icon: Paperclip, section: "start" },
  { id: "figma", label: "Attach Figma file", icon: Plus, section: "start" },
  { id: "web", label: "Web search", icon: Globe, section: "mid" },
  { id: "libraries", label: "Libraries", icon: BookOpen, chevron: true, section: "end" },
  { id: "connectors", label: "Connectors", icon: WandSparkles, section: "end" },
  { id: "skills", label: "Skills", icon: FileText, chevron: true, section: "end" },
];

function AttachMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 rounded-md"
          aria-label="Attach"
        >
          <Plus className="size-4" strokeWidth={1.75} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        className="w-56 border-border bg-foreground p-1 text-background shadow-none"
      >
        {(["start", "mid", "end"] as const).map((section, sectionIdx) => {
          const items = ATTACH_ITEMS.filter((i) => i.section === section);
          return (
            <div key={section}>
              {sectionIdx > 0 && (
                <div className="my-1 h-px bg-background/20" aria-hidden />
              )}
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs outline-none hover:bg-background/10"
                >
                  <item.icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.chevron && (
                    <ChevronRight className="size-3.5 shrink-0 opacity-70" />
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function WandzHome({
  onOpenVariations,
  onOpenContent,
  compact,
}: {
  onOpenVariations: () => void;
  onOpenContent: () => void;
  compact?: boolean;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className={cn("flex flex-col", compact ? "gap-0" : "min-h-0 flex-1")}>
      <div className={cn(compact ? "p-3 pb-2" : "flex min-h-0 flex-1 flex-col px-3 pb-3 pt-3")}>
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-1.5 py-1.5 shadow-none">
          <AttachMenu />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Describe your idea"
            className="min-w-0 flex-1 bg-transparent text-[13px] leading-5 text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 rounded-md"
            aria-label="Writing tools"
          >
            <CaseSensitive className="size-3.5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-7 shrink-0 rounded-full shadow-none"
            aria-label="Voice input"
          >
            <Mic className="size-3.5" strokeWidth={1.75} />
          </Button>
        </div>

        <div
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-background",
            compact ? "mt-2" : "mt-3"
          )}
        >
          <button
            type="button"
            onClick={onOpenVariations}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-foreground outline-none hover:bg-muted"
          >
            <CopyPlus
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
            />
            Create variations
          </button>
          <div className="h-px bg-border" aria-hidden />
          <button
            type="button"
            onClick={onOpenContent}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-foreground outline-none hover:bg-muted"
          >
            <Sparkles
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
            />
            Generate content
          </button>
          <div className="h-px bg-border" aria-hidden />
          <button
            type="button"
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-foreground outline-none hover:bg-muted"
          >
            <Ellipsis
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
            />
            See more
          </button>
        </div>
      </div>
    </div>
  );
}

function PropertyRow({
  label,
  icon: Icon,
  checked,
  onCheckedChange,
}: {
  label: string;
  icon: typeof LayoutTemplate;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-2 hover:bg-muted/60">
      <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      <span className="min-w-0 flex-1 text-sm text-foreground">{label}</span>
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
      />
    </label>
  );
}

function CreateVariationsStub({ onBack }: { onBack: () => void }) {
  const [layout, setLayout] = useState(true);
  const [style, setStyle] = useState(true);
  const [fonts, setFonts] = useState(true);
  const [textImages, setTextImages] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [count, setCount] = useState(3);

  return (
    <div className="flex flex-col">
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Back"
          onClick={onBack}
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        </Button>
        <p className="text-sm font-semibold text-foreground">Create variations</p>
      </div>

      <div className="px-3 py-3">
        <p className="mb-2 text-xs text-muted-foreground">Properties to change</p>
        <div className="space-y-0.5">
          <PropertyRow
            label="Layout"
            icon={LayoutTemplate}
            checked={layout}
            onCheckedChange={setLayout}
          />
          <PropertyRow
            label="Style"
            icon={Palette}
            checked={style}
            onCheckedChange={setStyle}
          />
          <PropertyRow
            label="Fonts"
            icon={CaseSensitive}
            checked={fonts}
            onCheckedChange={setFonts}
          />
          <PropertyRow
            label="Text / Images"
            icon={FileText}
            checked={textImages}
            onCheckedChange={setTextImages}
          />
        </div>

        {!showInstructions ? (
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-foreground outline-none hover:underline"
          >
            <Plus className="size-3.5" strokeWidth={2} />
            Add instructions
          </button>
        ) : (
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Add instructions"
            className="mt-3 min-h-[72px] resize-none text-xs shadow-none"
          />
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-3 py-2.5">
        <div className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1">
          <button
            type="button"
            aria-label="Fewer variations"
            className="text-xs text-muted-foreground outline-none hover:text-foreground"
            onClick={() => setCount((n) => Math.max(1, n - 1))}
          >
            −
          </button>
          <span className="min-w-[4.5rem] text-center text-xs font-medium text-foreground">
            {count} variations
          </span>
          <button
            type="button"
            aria-label="More variations"
            className="text-xs text-muted-foreground outline-none hover:text-foreground"
            onClick={() => setCount((n) => Math.min(8, n + 1))}
          >
            +
          </button>
        </div>
        <Button type="button" size="sm" className="h-8 shadow-none">
          Generate
        </Button>
      </div>
    </div>
  );
}

function GenerateContentStub({ onBack }: { onBack: () => void }) {
  const [images, setImages] = useState(true);
  const [text, setText] = useState(true);
  const [icons, setIcons] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState("");

  return (
    <div className="flex flex-col">
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Back"
          onClick={onBack}
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        </Button>
        <p className="text-sm font-semibold text-foreground">Generate content</p>
      </div>

      <div className="px-3 py-3">
        <p className="mb-2 text-xs text-muted-foreground">Properties to change</p>
        <div className="space-y-0.5">
          <PropertyRow
            label="Images"
            icon={ImageIcon}
            checked={images}
            onCheckedChange={setImages}
          />
          <PropertyRow
            label="Text content"
            icon={CaseSensitive}
            checked={text}
            onCheckedChange={setText}
          />
          <PropertyRow
            label="Icons"
            icon={Sparkles}
            checked={icons}
            onCheckedChange={setIcons}
          />
        </div>

        {!showInstructions ? (
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-foreground outline-none hover:underline"
          >
            <Plus className="size-3.5" strokeWidth={2} />
            Add instructions
          </button>
        ) : (
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Add instructions"
            className="mt-3 min-h-[72px] resize-none text-xs shadow-none"
          />
        )}
      </div>

      <div className="flex shrink-0 justify-end border-t border-border px-3 py-2.5">
        <Button type="button" size="sm" className="h-8 shadow-none">
          Generate
        </Button>
      </div>
    </div>
  );
}

/** Wandz stubs for Edition empty state (panel) or selection-anchored float card. */
export function EditorWandzStubs({
  variant = "panel",
  onClose,
}: {
  variant?: WandzVariant;
  /** Close the floating card (float variant only). */
  onClose?: () => void;
}) {
  const [screen, setScreen] = useState<WandzScreen>("home");
  const isFloat = variant === "float";

  const body = (
    <>
      {screen === "home" && (
        <WandzHome
          compact={isFloat}
          onOpenVariations={() => setScreen("variations")}
          onOpenContent={() => setScreen("content")}
        />
      )}
      {screen === "variations" && (
        <CreateVariationsStub onBack={() => setScreen("home")} />
      )}
      {screen === "content" && (
        <GenerateContentStub onBack={() => setScreen("home")} />
      )}
    </>
  );

  if (isFloat) {
    return (
      <div
        role="dialog"
        aria-label="Wandz"
        className="w-[300px] overflow-hidden rounded-2xl border border-border bg-background shadow-[0_12px_40px_-12px_rgb(from var(--foreground) r g b / 0.35)]"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end px-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Close Wandz"
            onClick={onClose}
          >
            <X className="size-3.5" strokeWidth={1.75} />
          </Button>
        </div>
        <div className="-mt-1">{body}</div>
      </div>
    );
  }

  return <div className="flex min-h-0 flex-1 flex-col">{body}</div>;
}
