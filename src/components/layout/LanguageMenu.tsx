/** JD profile → Language row with left-opening search + list submenu (visual mock). */
import { useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Languages,
  Search,
} from "@/components/icons/protoLucide";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { APP_LANGUAGES, useLocaleStore } from "@/store/locale";
import { useProfileSubmenuStore } from "@/store/profileSubmenu";
import { cn } from "@/lib/utils";

export default function LanguageMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const languageId = useLocaleStore((s) => s.languageId);
  const setLanguageId = useLocaleStore((s) => s.setLanguageId);
  const openSubmenu = useProfileSubmenuStore((s) => s.open);
  const closeSubmenu = useProfileSubmenuStore((s) => s.close);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return APP_LANGUAGES;
    return APP_LANGUAGES.filter(
      (lang) =>
        lang.label.toLowerCase().includes(q) ||
        lang.id.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <Popover
      modal={false}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) openSubmenu();
        else {
          closeSubmenu();
          setQuery("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted data-[state=open]:bg-muted",
            className
          )}
        >
          <Languages
            className="h-4 w-4 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate">Language</span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        sideOffset={8}
        data-profile-submenu=""
        className="w-56 gap-0 p-1.5"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5">
          <Search
            className="size-3.5 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search language..."
            aria-label="Search language"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
        <div
          role="listbox"
          aria-label="Languages"
          className="mt-1 max-h-56 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <p className="px-2.5 py-3 text-center text-xs text-muted-foreground">
              No languages match.
            </p>
          ) : (
            filtered.map((lang) => {
              const selected = lang.id === languageId;
              return (
                <button
                  key={lang.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setLanguageId(lang.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                    selected && "bg-muted font-medium"
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{lang.label}</span>
                  {selected ? (
                    <Check
                      className="size-3.5 shrink-0 text-foreground"
                      strokeWidth={2}
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
