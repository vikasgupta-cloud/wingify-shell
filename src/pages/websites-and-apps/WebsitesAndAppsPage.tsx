/** Websites and Apps listing — search + table; Add new CTA lives in DrillInShell header.
 * Reuses: shadcn Button/Input/DropdownMenu; AlertTriangle status via warning tokens.
 */

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  MoreVertical,
  Search,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  WEBSITES_AND_APPS,
  type WebsiteAppRow,
} from "@/data/websitesAndApps";
import { cn } from "@/lib/utils";

function dash(value: string | null | undefined) {
  return value && value.length > 0 ? value : "–";
}

function StatusCell({ row }: { row: WebsiteAppRow }) {
  if (row.status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-[var(--warning-fg)]">
        <AlertTriangle className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
        Error
      </span>
    );
  }
  return <span className="text-sm text-muted-foreground">{dash(null)}</span>;
}

export default function WebsitesAndAppsPage() {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WEBSITES_AND_APPS;
    return WEBSITES_AND_APPS.filter((row) => {
      const hay = [row.name, row.domain ?? "", row.type].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-8 pb-16 pt-10">
      {/* Add new CTA lives in DrillInShell header. */}
      <div className="flex flex-wrap items-center justify-start gap-2">
        <div className="relative w-[240px]">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Websites and Apps"
            aria-label="Search Websites and Apps"
            className="h-9 bg-background pl-8 shadow-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Domain</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Last activity
              </th>
              <th className="w-12 px-2 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  No websites or apps match your search.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="max-w-[16rem] px-4 py-3.5">
                    <span
                      title={row.name}
                      className="block truncate font-medium text-foreground"
                    >
                      {row.name}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-foreground">
                    {dash(row.domain)}
                  </td>
                  <td className="max-w-[12rem] px-4 py-3.5">
                    <span title={row.type} className="block truncate text-foreground">
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusCell row={row} />
                  </td>
                  <td className="px-4 py-3.5 text-foreground">
                    {dash(row.lastActivity)}
                  </td>
                  <td className="px-2 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${row.name}`}
                          className={cn(
                            "size-8 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <MoreVertical className="size-4" strokeWidth={1.75} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem disabled>View details</DropdownMenuItem>
                        <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                        <DropdownMenuItem disabled>Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
