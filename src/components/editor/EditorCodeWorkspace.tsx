import { useMemo, useState } from "react";
import { ChevronDown, Braces, Code2, FileCode2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CodeLang = "js" | "css" | "html";
type CodeBlockId = "visual" | "wandz";

const TRIGGERS = [
  "Campaign executes",
  "DOM ready",
  "On page load",
  "Custom event",
] as const;

const LANG_TABS: { id: CodeLang; label: string; icon: typeof Code2 }[] = [
  { id: "js", label: "JavaScript", icon: FileCode2 },
  { id: "css", label: "CSS", icon: Braces },
  { id: "html", label: "HTML", icon: Code2 },
];

const DEFAULT_CODE: Record<
  CodeBlockId,
  Record<CodeLang, string>
> = {
  visual: {
    js: `(function () {
  // Variation changes applied when the campaign executes
  var heading = document.querySelector("#hero-heading");
  if (heading) {
    heading.innerHTML = "Layered essentials,<br />built to last";
  }

  var sub = document.querySelector(".hero-copy p");
  if (sub) {
    sub.textContent =
      "Thoughtful pieces for everyday wear — free shipping over $75.";
  }
})();`,
    css: `/* Variation styles */
#hero-heading {
  letter-spacing: -0.02em;
}

.hero-copy p {
  max-width: 36rem;
}`,
    html: `<!-- Optional HTML injected into the page -->
<div class="nl-banner" data-editor-inject>
  Limited drop — members get early access.
</div>`,
  },
  wandz: {
    js: `(function () {
  // Wandz-generated helpers
  console.info("[wandz] variation helpers ready");
})();`,
    css: `/* Wandz styles */
.nl-banner {
  font-size: 13px;
}`,
    html: `<!-- Wandz HTML -->`,
  },
};

const BLOCKS: { id: CodeBlockId; label: string }[] = [
  { id: "visual", label: "Visual Editor Code" },
  { id: "wandz", label: "Wandz Code" },
];

/**
 * Code mode workspace — edit JS / CSS / HTML for campaign or variation scope.
 */
export function EditorCodeWorkspace({
  scopeLabel = "Variation 01",
  onDone,
}: {
  scopeLabel?: string;
  onDone?: () => void;
}) {
  const [blockId, setBlockId] = useState<CodeBlockId>("visual");
  const [lang, setLang] = useState<CodeLang>("js");
  const [trigger, setTrigger] = useState<(typeof TRIGGERS)[number]>(
    TRIGGERS[0]
  );
  const [codeByBlock, setCodeByBlock] = useState(DEFAULT_CODE);

  const value = codeByBlock[blockId][lang];
  const lines = useMemo(() => value.split("\n"), [value]);

  const setValue = (next: string) => {
    setCodeByBlock((prev) => ({
      ...prev,
      [blockId]: { ...prev[blockId], [lang]: next },
    }));
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
      <aside className="flex w-[200px] shrink-0 flex-col border-r border-border bg-background">
        <div className="border-b border-border px-3 py-2.5">
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Code
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
            {scopeLabel}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {BLOCKS.map((b) => {
            const active = blockId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setBlockId(b.id)}
                className={cn(
                  "rounded-md px-2.5 py-2 text-left text-[13px] font-medium outline-none transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {b.label}
              </button>
            );
          })}
          <button
            type="button"
            className="mt-1 inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <Plus className="size-3.5" strokeWidth={1.75} />
            Code block
          </button>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-border px-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium"
              >
                Trigger
                <span className="text-muted-foreground">·</span>
                <span className="max-w-[140px] truncate">{trigger}</span>
                <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              {TRIGGERS.map((t) => (
                <DropdownMenuItem key={t} onClick={() => setTrigger(t)}>
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground"
              >
                More options
                <ChevronDown className="size-3.5" strokeWidth={1.75} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem disabled>Format document</DropdownMenuItem>
              <DropdownMenuItem disabled>Reset to default</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex h-9 shrink-0 items-center gap-1 border-b border-border px-2">
          {LANG_TABS.map((tab) => {
            const active = lang === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLang(tab.id)}
                className={cn(
                  "relative inline-flex h-full items-center gap-1.5 px-3 text-xs font-semibold outline-none transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                {tab.label}
                {active && (
                  <span
                    className="pointer-events-none absolute inset-x-2 -bottom-px h-px bg-foreground"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-muted/30">
          <div className="absolute inset-0 flex overflow-auto font-mono text-[12px] leading-6">
            <div
              className="sticky left-0 select-none border-r border-border bg-background/80 px-2 py-3 text-right text-muted-foreground"
              aria-hidden
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              spellCheck={false}
              className="min-h-full flex-1 resize-none rounded-none border-0 bg-transparent px-3 py-3 font-mono text-[12px] leading-6 shadow-none focus-visible:ring-0"
              aria-label={`${lang.toUpperCase()} editor`}
            />
          </div>
        </div>

        <div className="flex h-11 shrink-0 items-center justify-end border-t border-border px-3">
          <Button
            type="button"
            size="sm"
            className="h-7 rounded-md px-3 text-xs font-semibold"
            onClick={onDone}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
