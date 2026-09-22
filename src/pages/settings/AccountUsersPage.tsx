/** Settings → Accounts → Users — search + table; Add User CTA in DrillInShell header.
 * No page title. Reuses shadcn Button/Input/DropdownMenu.
 */

import { useMemo, useState } from "react";
import {
  Info,
  MoreVertical,
  Search,
  UserRound,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ACCOUNT_USERS } from "@/data/settingsUsers";
import { cn } from "@/lib/utils";

export default function AccountUsersPage() {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACCOUNT_USERS;
    return ACCOUNT_USERS.filter((row) => {
      const hay = [row.name, row.email, row.accounts, row.permissions]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-8 pb-16 pt-10">
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
            placeholder="Search Users"
            aria-label="Search Users"
            className="h-9 bg-background pl-8 shadow-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Created On
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Accounts
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                2FA Method
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Permissions
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
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  No users match your search.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3.5">
                    <span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-foreground">
                      <span className="truncate">{row.name}</span>
                      {row.showPersonMark ? (
                        <UserRound
                          className="size-3.5 shrink-0 text-muted-foreground"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      ) : null}
                    </span>
                  </td>
                  <td className="max-w-[14rem] truncate px-4 py-3.5 text-foreground">
                    {row.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-foreground">
                    {row.createdOn}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-foreground">{row.accounts}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="truncate">{row.workspacesNote}</span>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex text-muted-foreground hover:text-foreground"
                                aria-label="About workspace access"
                              >
                                <Info
                                  className="size-3"
                                  strokeWidth={1.75}
                                  aria-hidden
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              Access across workspaces in this account.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      )}
                    >
                      {row.twoFaMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-foreground">
                    {row.permissions}
                  </td>
                  <td className="px-2 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${row.name}`}
                          className="size-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="size-4" strokeWidth={1.75} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                        <DropdownMenuItem disabled>Permissions</DropdownMenuItem>
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
