import { useLocation, Link, NavLink } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { mainNavCrumbPath, resolveBreadcrumb } from "../../lib/nav";
import { cn } from "../../lib/utils";

export default function BreadcrumbNav() {
  const { pathname } = useLocation();
  const { item, leaf, siblings } = resolveBreadcrumb(pathname);

  if (!item) return null;

  const Icon = item.icon;

  // Direct item: the main-nav label is the current (last) segment.
  if (!item.sections || !leaf) {
    return (
      <div className="flex min-w-0 items-center text-sm">
        <span className="flex items-center gap-1.5 truncate px-1.5 font-semibold text-foreground">
          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          {item.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <Link
        to={mainNavCrumbPath(pathname)}
        className="flex items-center gap-1.5 truncate rounded-md px-1.5 py-1 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none"
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        {item.label}
      </Link>
      <span className="text-muted-foreground">/</span>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-1.5 py-1 font-semibold text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            <span className="truncate">{leaf.label}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={6}
            className="z-50 min-w-[220px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
          >
            {siblings.map((sibling) => (
              <DropdownMenu.Item key={sibling.path} asChild>
                {/* Plain-string className: Radix Slot can't merge NavLink's function form */}
                <NavLink
                  to={sibling.path}
                  className={cn(
                    "block cursor-pointer rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-accent",
                    sibling.path === leaf.path && "bg-accent font-medium"
                  )}
                >
                  {sibling.label}
                </NavLink>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
