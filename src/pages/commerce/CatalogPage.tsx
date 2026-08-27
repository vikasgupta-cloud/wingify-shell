/** Commerce → Catalog — listing layout from product screenshots (our theme). */

import { useState } from "react";
import { Search, Settings } from "@/components/icons/protoLucide";
import CatalogDisplaySettings from "@/components/catalog/CatalogDisplaySettings";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import CatalogTable from "@/components/catalog/CatalogTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useCatalogPipeline,
  useCatalogTableStore,
} from "@/store/catalogTable";

export default function CatalogPage() {
  const search = useCatalogTableStore((s) => s.search);
  const setSearch = useCatalogTableStore((s) => s.setSearch);
  const rows = useCatalogPipeline();
  const [manageOpen, setManageOpen] = useState(false);

  const countLabel =
    rows.length === 1 ? "1 product" : `${rows.length.toLocaleString()} products`;

  return (
    <div className="px-12 pb-12 pt-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Catalog
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Last update: about 12 hours ago from{" "}
            <a
              href="https://www.shopify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Shopify
            </a>
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => setManageOpen(true)}
        >
          <Settings className="size-3.5" aria-hidden />
          Manage catalog
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <p className="mr-auto text-sm font-medium text-foreground">
            {countLabel}
          </p>
          <CatalogDisplaySettings />
          <CatalogFilters />
          <div className="flex w-full max-w-xs items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5 sm:w-72">
            <Search
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in your catalog…"
              className="h-auto border-0 bg-transparent px-0 py-0 text-sm text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <CatalogTable />
      </div>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">Manage catalog</DialogTitle>
            <DialogDescription>
              Catalog sync and source settings will live here. This is a stub for
              now.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            Coming soon — connect Shopify, map fields, and schedule syncs.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
