/** Configuration → Assets Hub → Images — search, grid/list toggle, image cards.
 * Upload Image CTA lives in DrillInShell header. Reuses shadcn Input/Button.
 */

import { useMemo, useState } from "react";
import { LayoutGrid, Rows3, Search } from "@/components/icons/protoLucide";
import { Input } from "@/components/ui/input";
import { ASSET_IMAGES, type AssetImage } from "@/data/assetImages";
import { cn } from "@/lib/utils";

type Layout = "grid" | "list";

function ImageCard({
  image,
  layout,
}: {
  image: AssetImage;
  layout: Layout;
}) {
  if (layout === "list") {
    return (
      <article className="flex items-center gap-4 rounded-xl border border-border bg-background p-3">
        <div className="size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          <img
            src={image.src}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            title={image.name}
            className="truncate text-sm font-semibold text-foreground"
          >
            {image.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {image.sizeLabel} · {image.dimensions}
          </p>
        </div>
        <time className="shrink-0 text-xs text-muted-foreground">
          {image.addedLabel}
        </time>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={image.src}
          alt=""
          className="size-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="space-y-1 p-3.5">
        <h3
          title={image.name}
          className="truncate text-sm font-semibold text-foreground"
        >
          {image.name}
        </h3>
        <p className="truncate text-xs text-muted-foreground">
          {image.sizeLabel} · {image.dimensions}
        </p>
        <p className="text-xs text-muted-foreground">{image.addedLabel}</p>
      </div>
    </article>
  );
}

export default function AssetImagesPage() {
  const [query, setQuery] = useState("");
  const [layout, setLayout] = useState<Layout>("grid");

  const images = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ASSET_IMAGES;
    return ASSET_IMAGES.filter((img) => {
      const hay = [img.name, ...img.tags].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-8 pb-16 pt-10">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search images by name or tag..."
            aria-label="Search images by name or tag"
            className="h-9 bg-background pl-9 shadow-none"
          />
        </div>

        <div
          role="group"
          aria-label="Layout"
          className="inline-flex rounded-md border border-border bg-background p-0.5"
        >
          <button
            type="button"
            aria-pressed={layout === "grid"}
            aria-label="Grid view"
            onClick={() => setLayout("grid")}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded transition-colors",
              layout === "grid"
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="size-3.5" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            aria-pressed={layout === "list"}
            aria-label="List view"
            onClick={() => setLayout("list")}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded transition-colors",
              layout === "list"
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Rows3 className="size-3.5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-background px-6 py-12 text-center text-sm text-muted-foreground">
          No images match your search.
        </p>
      ) : layout === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <ImageCard key={image.id} image={image} layout="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {images.map((image) => (
            <ImageCard key={image.id} image={image} layout="list" />
          ))}
        </div>
      )}
    </div>
  );
}
