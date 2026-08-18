import { NavLink, useNavigate } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Pin } from "@/components/icons/protoLucide";
import { visibleNav } from "../../config/navigation";
import { firstChildPath } from "../../lib/nav";
import { useUIStore } from "../../store/ui";
import { useDesignControllerStore } from "../../store/designController";
import { cn } from "../../lib/utils";

// Docked-mode More panel: fills the docked panel column with every unpinned
// pinnable item (NAV order) as a group — header row with a Pin control,
// followed by that item's sub-nav links. Undocked mode uses the rail's flyout.
export default function MorePanel() {
  const navigate = useNavigate();
  const pinnedPaths = useUIStore((s) => s.pinnedPaths);
  const pin = useUIStore((s) => s.pin);
  const showWebExperimentOld = useDesignControllerStore(
    (s) => s.showWebExperimentOld
  );
  const unpinned = visibleNav({ showWebExperimentOld }).filter(
    (i) => i.pinnable && !pinnedPaths.includes(i.path)
  );

  return (
    <Tooltip.Provider delayDuration={300}>
      <nav className="h-full w-[248px] shrink-0 overflow-y-auto border-r border-panel-border bg-panel py-6 text-panel-foreground [scrollbar-width:thin]">
        <div className="px-5 pb-4 text-sm font-semibold text-foreground">
          More
        </div>
        <div className="flex flex-col px-3">
          {unpinned.map((item, groupIndex) => {
            const Icon = item.icon;
            return (
              <div key={item.path} className="flex flex-col gap-1">
                {groupIndex > 0 && (
                  <div className="my-4 h-px bg-panel-border" aria-hidden="true" />
                )}
                <div className="flex items-center gap-1 rounded-md pr-1 transition-colors hover:bg-muted">
                  <button
                    type="button"
                    onClick={() => navigate(firstChildPath(item))}
                    className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-2 text-left"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  </button>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        type="button"
                        aria-label={`Pin ${item.label} to sidebar`}
                        onClick={(e) => {
                          e.stopPropagation();
                          pin(item.path);
                        }}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="bottom"
                        sideOffset={4}
                        className="z-50 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
                      >
                        Pin to sidebar
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
                {item.sections
                  ?.flatMap((section) => section.items)
                  .map((leaf) => (
                    <NavLink
                      key={leaf.path}
                      to={leaf.path}
                      className={({ isActive }) =>
                        cn(
                          "rounded-md py-1.5 pl-[34px] pr-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive &&
                            "bg-accent font-medium text-accent-foreground"
                        )
                      }
                    >
                      {leaf.label}
                    </NavLink>
                  ))}
              </div>
            );
          })}
        </div>
      </nav>
    </Tooltip.Provider>
  );
}
