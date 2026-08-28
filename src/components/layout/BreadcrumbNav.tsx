import { NavLink, useLocation } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "@/components/icons/protoLucide";
import { Badge } from "@/components/ui/badge";
import { GET_STARTED_PROGRESS } from "@/data/getStarted";
import {
  productSwitcherItems,
  type NavItem,
} from "../../config/navigation";
import { firstChildPath, resolveBreadcrumb } from "../../lib/nav";
import { useIsGetStartedLocked } from "@/store/getStartedOnboarding";
import { cn } from "../../lib/utils";
import PageGuideCluster from "./PageGuideCluster";

const PRODUCTS = productSwitcherItems();

function isSwitcherProduct(item: NavItem): boolean {
  return PRODUCTS.some((p) => p.path === item.path);
}

/** Product crumb — dropdown to jump between Wandz and the other products. */
function ProductSwitcher({
  item,
  locked = false,
}: {
  item: NavItem;
  locked?: boolean;
}) {
  const Icon = item.icon;
  const showSwitcher = isSwitcherProduct(item) && !locked;

  if (!showSwitcher) {
    return (
      <span className="flex items-center gap-1.5 truncate px-1.5 font-semibold text-foreground">
        <Icon
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
          aria-hidden
        />
        {item.label}
      </span>
    );
  }

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Switch product"
          className="flex items-center gap-1 truncate rounded-md px-1.5 py-1 font-semibold text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
        >
          <Icon
            className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="truncate">{item.label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-[240px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
        >
          {PRODUCTS.map((product) => {
            const ProductIcon = product.icon;
            const to = firstChildPath(product);
            const active = product.path === item.path;
            return (
              <DropdownMenu.Item key={product.path} asChild>
                <NavLink
                  to={to}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-accent",
                    active && "bg-accent font-medium"
                  )}
                >
                  <ProductIcon
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="truncate">{product.label}</span>
                </NavLink>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default function BreadcrumbNav() {
  const { pathname } = useLocation();
  const { item, leaf, siblings } = resolveBreadcrumb(pathname);
  const navLocked = useIsGetStartedLocked();

  if (!item) return null;

  // Direct item: product switcher (or plain label for non-products).
  if (!item.sections || !leaf) {
    return (
      <div className="flex min-w-0 items-center gap-1 text-sm">
        <ProductSwitcher item={item} locked={navLocked} />
        <PageGuideCluster guide={item.pageGuide} />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <ProductSwitcher item={item} locked={navLocked} />
      <span className="text-muted-foreground">/</span>
      {navLocked ? (
        <span className="truncate px-1.5 py-1 font-semibold text-foreground">
          {leaf.label}
        </span>
      ) : (
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
      )}
      <PageGuideCluster guide={leaf.pageGuide} />
      {leaf.path === "/home/get-started" && (
        <Badge tone="ocean" fill="light" size="sm">
          {GET_STARTED_PROGRESS}% Completed
        </Badge>
      )}
    </div>
  );
}
