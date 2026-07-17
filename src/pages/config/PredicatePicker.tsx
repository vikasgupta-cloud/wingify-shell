import { useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { UrlPredicate } from "../../store/config";
import { URL_PREDICATES, type PredicateDef } from "../../config/urlPredicates";

const PAGE_GROUP_ID: UrlPredicate = "Page group is";

export default function PredicatePicker({
  value,
  onChange,
}: {
  value: UrlPredicate;
  onChange: (predicate: UrlPredicate) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState<UrlPredicate | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedDef =
    URL_PREDICATES.find((p) => p.id === value) ?? URL_PREDICATES[0];

  const filtered = useMemo(
    () =>
      URL_PREDICATES.filter((p) =>
        p.label.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [query]
  );

  const activeDef: PredicateDef =
    (highlighted && filtered.find((p) => p.id === highlighted)) || selectedDef;

  const select = (predicate: UrlPredicate) => {
    onChange(predicate);
    setOpen(false);
  };

  const move = (dir: 1 | -1) => {
    if (filtered.length === 0) return;
    const currentId = highlighted ?? value;
    const idx = filtered.findIndex((p) => p.id === currentId);
    const nextIdx =
      idx === -1
        ? dir === 1
          ? 0
          : filtered.length - 1
        : (idx + dir + filtered.length) % filtered.length;
    setHighlighted(filtered[nextIdx].id);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setQuery("");
          setHighlighted(null);
          // Autofocus the search input once the content mounts.
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[200px] shrink-0 justify-between font-normal">
          <span className="truncate text-left">{selectedDef.label}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[560px] p-0"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          } else if (e.key === "Enter") {
            e.preventDefault();
            const target = highlighted ?? filtered[0]?.id;
            if (target) select(target);
          }
        }}
      >
        <div className="flex items-center gap-2 border-b border-border p-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlighted(null);
            }}
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="grid grid-cols-[240px_1fr]">
          <div className="border-r border-border p-1">
            {filtered.map((p) => {
              const isSeparated =
                p.id === PAGE_GROUP_ID && filtered.length > 1;
              return (
                <div key={p.id}>
                  {isSeparated && <div className="my-1 border-t border-border" />}
                  <div
                    onMouseEnter={() => setHighlighted(p.id)}
                    onClick={() => select(p.id)}
                    className={cn(
                      "cursor-pointer rounded-md px-3 py-2.5 text-sm",
                      p.id === value
                        ? "bg-accent font-medium text-foreground"
                        : p.id === highlighted
                        ? "bg-muted"
                        : ""
                    )}
                  >
                    {p.label}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4">
            <div className="text-sm font-medium text-foreground">{activeDef.label}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {activeDef.description}
            </div>
            <div className="mt-4 rounded-md bg-muted p-3">
              <div className="text-xs font-medium text-foreground">For example</div>
              <div className="mt-1 break-words text-xs text-muted-foreground">
                {activeDef.example}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
