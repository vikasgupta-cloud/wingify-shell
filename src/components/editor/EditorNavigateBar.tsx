import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, RefreshCw } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Browser chrome for Navigate mode — browse the preview without selecting.
 * Design-only editing is gated by the dock (disabled tools + Design mode),
 * so this bar stays URL navigation only.
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
  embedded = false,
  className,
}: {
  url: string;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onUrlChange?: (url: string) => void;
  onGo?: (url: string) => void;
  onBack?: () => void;
  onForward?: () => void;
  onRefresh?: () => void;
  embedded?: boolean;
  className?: string;
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
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        embedded
          ? "h-7 flex-1"
          : "h-10 shrink-0 gap-3 border-b border-border bg-background px-3",
        className
      )}
      data-navigate-chrome
    >
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
        className="flex min-w-0 flex-1 items-center gap-1.5"
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
    </div>
  );
}
