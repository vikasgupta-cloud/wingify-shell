/** Tech Debt list — table with flag filter; code refs open in a popover (no detail page). */

import { useMemo, useState } from "react";
import { TECH_DEBT_ROWS, type TechDebtRow } from "@/data/techDebt";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ALL = "__all__";

function CodeRefsPopover({ row }: { row: TechDebtRow }) {
  const hasRefs = row.codeRefs.length > 0;

  if (!hasRefs) {
    return (
      <span className="text-sm text-muted-foreground/60">View Details</span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-sm font-normal text-foreground underline-offset-2 hover:underline"
        >
          View Details
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[min(720px,calc(100vw-3rem))] p-0"
      >
        <PopoverArrow className="fill-popover stroke-border" />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="px-3 py-2.5 font-medium text-muted-foreground">
                  File Name
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground">
                  File Location
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground">
                  Line
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground">
                  Character
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground">
                  Code Snippet
                </th>
              </tr>
            </thead>
            <tbody>
              {row.codeRefs.map((ref) => (
                <tr
                  key={`${ref.fileName}-${ref.line}-${ref.character}`}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-3 py-3 align-top text-foreground">
                    {ref.fileName}
                  </td>
                  <td className="px-3 py-3 align-top text-foreground">
                    {ref.fileLocation}
                  </td>
                  <td className="px-3 py-3 align-top tabular-nums text-foreground">
                    {ref.line}
                  </td>
                  <td className="px-3 py-3 align-top tabular-nums text-foreground">
                    {ref.character}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <pre className="min-w-[200px] overflow-x-auto rounded-md border border-border bg-muted/40 p-2 font-mono text-xs leading-5 text-foreground">
                      {ref.snippetLines.map((line) => (
                        <div key={line.n} className="flex gap-3">
                          <span className="w-4 shrink-0 select-none text-right text-muted-foreground">
                            {line.n}
                          </span>
                          <span
                            className={cn(
                              line.highlight === "ident" && "text-foreground font-medium",
                              line.highlight === "string" && "text-muted-foreground"
                            )}
                          >
                            {line.text}
                          </span>
                        </div>
                      ))}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function TechDebtPage() {
  const [flagFilter, setFlagFilter] = useState("");

  const flagKeys = useMemo(
    () => [...new Set(TECH_DEBT_ROWS.map((r) => r.flagKey))],
    []
  );

  const rows = useMemo(
    () =>
      !flagFilter || flagFilter === ALL
        ? TECH_DEBT_ROWS
        : TECH_DEBT_ROWS.filter((r) => r.flagKey === flagFilter),
    [flagFilter]
  );

  return (
    <div className="px-12 pb-12 pt-10">
      <div className="mb-4 flex items-center justify-end gap-3">
        <span className="text-sm text-muted-foreground">
          Filter by Feature Flag
        </span>
        <Select
          value={flagFilter || ALL}
          onValueChange={(v) => setFlagFilter(v === ALL ? "" : v)}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select Flag(s) to filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Select Flag(s) to filter</SelectItem>
            {flagKeys.map((key) => (
              <SelectItem key={key} value={key}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-background">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-12 px-3 py-3 font-medium text-muted-foreground">
                #
              </th>
              <th className="px-3 py-3 font-medium text-muted-foreground">
                Feature Flag Key
              </th>
              <th className="px-3 py-3 font-medium text-muted-foreground">
                Repository
              </th>
              <th className="px-3 py-3 font-medium text-muted-foreground">
                Branch
              </th>
              <th className="px-3 py-3 font-medium text-muted-foreground">
                Recommendation
              </th>
              <th className="px-3 py-3 font-medium text-muted-foreground">
                Reason
              </th>
              <th className="px-3 py-3 font-medium text-muted-foreground">
                Last Synced
              </th>
              <th className="px-3 py-3 font-medium text-muted-foreground">
                Code References
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-0 hover:bg-[var(--neutral-50)]"
              >
                <td className="px-3 py-3">
                  <span className="inline-flex size-6 items-center justify-center rounded bg-muted text-xs font-medium tabular-nums text-foreground">
                    {i + 1}
                  </span>
                </td>
                <td className="px-3 py-3 font-medium text-foreground">
                  {row.flagKey}
                </td>
                <td className="px-3 py-3 text-foreground">{row.repository}</td>
                <td className="px-3 py-3 text-foreground">{row.branch}</td>
                <td className="px-3 py-3 text-foreground">
                  {row.recommendation}
                </td>
                <td className="px-3 py-3 text-foreground">{row.reason}</td>
                <td className="whitespace-nowrap px-3 py-3 text-foreground">
                  {row.lastSynced}
                </td>
                <td className="px-3 py-3">
                  <CodeRefsPopover row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
