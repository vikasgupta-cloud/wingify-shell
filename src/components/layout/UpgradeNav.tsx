// Upgrade left rail — flat product list (badges kept). Other modes use DrillInNav.

import { NavLink, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "@/components/icons/protoLucide";
import {
  UPGRADE_ADDONS_PATH,
  UPGRADE_SECTIONS,
  type UpgradeBadgeTone,
} from "../../config/upgradeNav";
import { SETTINGS_NAV_WIDTH } from "../../lib/nav";
import { cn } from "../../lib/utils";

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: UpgradeBadgeTone;
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none",
        tone === "new" &&
          "bg-[var(--status-running-bg)] text-[var(--status-running-fg)]",
        tone === "plan" && "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

export default function UpgradeNav() {
  const navigate = useNavigate();

  return (
    <nav
      className="flex h-full flex-col overflow-hidden border-r border-panel-border bg-background text-foreground"
      style={{ width: SETTINGS_NAV_WIDTH }}
    >
      <div className="flex shrink-0 items-center px-3 pb-3 pt-4">
        <button
          type="button"
          aria-label="Back to main menu"
          onClick={() => navigate("/home/dashboard")}
          className="flex min-w-0 items-center gap-1 rounded-md px-1 py-1 text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-semibold">Back to app</span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-3">
        {UPGRADE_SECTIONS.flatMap((section) =>
          section.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted",
                    isActive &&
                      "bg-accent font-medium text-accent-foreground hover:bg-accent"
                  )
                }
              >
                <Icon
                  className="h-4 w-4 shrink-0 text-foreground"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {item.label}
                </span>
                {item.badge && (
                  <Badge label={item.badge.label} tone={item.badge.tone} />
                )}
              </NavLink>
            );
          })
        )}
      </div>

      <div className="shrink-0 border-t border-border px-3 py-3">
        <NavLink
          to={UPGRADE_ADDONS_PATH}
          className={({ isActive }) =>
            cn(
              "flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted",
              isActive && "bg-accent font-medium hover:bg-accent"
            )
          }
        >
          Explore add-ons
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
        </NavLink>
      </div>
    </nav>
  );
}

/** Whether the current path is inside Upgrade (for shell routing). */
export function isUpgradePath(pathname: string) {
  return pathname === "/upgrade" || pathname.startsWith("/upgrade/");
}
