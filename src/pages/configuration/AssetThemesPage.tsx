/** Configuration → Assets Hub → Themes — grid of theme cards (palette + typography).
 * Create Theme CTA lives in DrillInShell header. Reuses shadcn Button/DropdownMenu.
 */

import { MoreVertical } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ASSET_THEMES, type AssetTheme } from "@/data/assetThemes";

function ThemeCard({ theme }: { theme: AssetTheme }) {
  return (
    <article className="flex flex-col rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {theme.name}
          </h3>
          <span className="mt-1.5 inline-flex rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {theme.badge}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${theme.name}`}
              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="size-4" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem disabled>Edit</DropdownMenuItem>
            <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
            <DropdownMenuItem disabled>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Palette</p>
          <div className="mt-2 flex items-center gap-1.5">
            {theme.palette.map((color, i) => (
              <span
                key={`${theme.id}-${i}`}
                className="size-5 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: color }}
                title={color}
                aria-hidden
              />
            ))}
          </div>
        </div>
        <div className="min-w-0 text-right">
          <p className="text-xs text-muted-foreground">Typography</p>
          <p
            title={theme.typography}
            className="mt-2 max-w-[9rem] truncate text-sm font-semibold text-foreground"
          >
            {theme.typography}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function AssetThemesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-8 pb-16 pt-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ASSET_THEMES.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} />
        ))}
      </div>
    </div>
  );
}
