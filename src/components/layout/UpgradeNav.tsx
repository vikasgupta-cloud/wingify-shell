// Upgrade left rail — flat product list (badges kept). Other modes use DrillInNav.
// Logo sits in the same 52px rail slot as ExpandedNav / DrillInNav.

import { NavLink, useNavigate } from "react-router-dom";
import { ArrowLeft } from "@/components/icons/protoLucide";
import {
  UPGRADE_SECTIONS,
  type UpgradeBadgeTone,
} from "../../config/upgradeNav";
import { SETTINGS_NAV_WIDTH } from "../../lib/nav";
import { cn } from "../../lib/utils";
import WingifyLogoButton from "./WingifyLogoButton";

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
      <div className="flex h-[52px] shrink-0 items-center px-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center">
          <WingifyLogoButton />
        </span>
      </div>

      <div className="flex shrink-0 items-center px-3 pb-3">
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
        {UPGRADE_SECTIONS.map((section, i) => {
          const prev = UPGRADE_SECTIONS[i - 1];
          // Top hairline when a labeled group follows unlabeled items
          // (Feature Management → Analytics). Commerce already gets its line
          // from Analytics’ bottom border — don’t double it.
          const topDivider = section.showHeading && !prev?.showHeading;
          const wingzBlock = section.heading === "AI Driven Optimization";
          return (
          <div
            key={section.heading}
            className={cn(
              "flex flex-col gap-0.5",
              // Grouped sections (Analytics, Commerce) get space + hairline so
              // following unlabeled items (Push Notifications, Wingz) don’t read as children.
              section.showHeading && "mb-2 border-b border-border pb-3",
              topDivider && "mt-2 border-t border-border pt-1",
              wingzBlock && "mt-3 border-t border-border pt-3"
            )}
          >
            {section.showHeading || wingzBlock ? (
              <div className="px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground">
                {section.heading}
              </div>
            ) : null}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted",
                      section.showHeading && "ml-1",
                      item.emphasize &&
                        "mt-1 border border-border bg-muted/50 shadow-none",
                      isActive &&
                        "bg-accent font-medium text-accent-foreground hover:bg-accent",
                      item.emphasize &&
                        isActive &&
                        "border-foreground/20 bg-accent"
                    )
                  }
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 text-foreground",
                      item.emphasize && "text-foreground"
                    )}
                    strokeWidth={item.emphasize ? 2 : 1.75}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-sm text-foreground",
                      item.emphasize && "font-medium"
                    )}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <Badge label={item.badge.label} tone={item.badge.tone} />
                  )}
                </NavLink>
              );
            })}
          </div>
          );
        })}
      </div>
    </nav>
  );
}

/** Whether the current path is inside Upgrade (for shell routing). */
export function isUpgradePath(pathname: string) {
  return pathname === "/upgrade" || pathname.startsWith("/upgrade/");
}
