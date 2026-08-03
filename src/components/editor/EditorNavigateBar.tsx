import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Browser chrome for Navigate mode — browse the preview without selecting.
 */
export function EditorNavigateBar({
  url,
  canGoBack = false,
  canGoForward = false,
  onUrlChange,
  onGo,
  onBack,
  onForward,
  onRefresh,
  onSwitchToDesign,
}: {
  url: string;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onUrlChange?: (url: string) => void;
  onGo?: (url: string) => void;
  onBack?: () => void;
  onForward?: () => void;
  onRefresh?: () => void;
  onSwitchToDesign?: () => void;
}) {
  const [draft, setDraft] = useState(url);

  useEffect(() => {
    setDraft(url);
  }, [url]);

  const submit = () => {
    const next = draft.trim() || url;
    onUrlChange?.(next);
    onGo?.(next);
  };

  return (
    <div className="flex h-10 shrink-0 items-center gap-3 border-b border-border bg-background px-3">
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 rounded-md"
          aria-label="Back"
          disabled={!canGoBack}
          onClick={onBack}
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 rounded-md"
          aria-label="Forward"
          disabled={!canGoForward}
          onClick={onForward}
        >
          <ArrowRight className="size-3.5" strokeWidth={1.75} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 rounded-md"
          aria-label="Refresh"
          onClick={onRefresh}
        >
          <RefreshCw className="size-3.5" strokeWidth={1.75} />
        </Button>
      </div>

      <form
        className="flex min-w-0 flex-1 items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="h-7 min-w-0 flex-1 rounded-md px-2.5 text-xs shadow-none"
          aria-label="Preview URL"
          spellCheck={false}
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="h-7 shrink-0 rounded-md px-2.5 text-xs font-semibold"
        >
          Go
        </Button>
      </form>

      <button
        type="button"
        onClick={onSwitchToDesign}
        className={cn(
          "hidden shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
        )}
      >
        <Info className="size-3.5 shrink-0" strokeWidth={1.75} />
        <span className="leading-snug">
          Go to Design mode to make a change
        </span>
      </button>
    </div>
  );
}
