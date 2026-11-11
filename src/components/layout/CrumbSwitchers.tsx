/** Shared breadcrumb node menus — product switcher and sub-nav leaf switcher. */
/* Change summary: ProductCrumb and LeafCrumb gain `iconOnly` (nav icon + hover label) for the
 * detail-header trail; new shared `CrumbIconTooltip` reuses the shadcn Tooltip. The section
 * switcher menu lists sibling pages with their nav icons. A leaf without an icon stays text.
 * Both also gain `withIcon` (icon before the name) for the list-page trail (BreadcrumbNav). */

import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "@/components/icons/protoLucide";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  productSwitcherItems,
  type NavItem,
  type NavLeaf,
} from "../../config/navigation";
import { firstChildPath } from "../../lib/nav";
import { cn } from "../../lib/utils";

const PRODUCTS = productSwitcherItems();

function isSwitcherProduct(item: NavItem): boolean {
  return PRODUCTS.some((p) => p.path === item.path);
}

/** Shared trigger chrome for every breadcrumb node (list, detail, overflow). */
export const crumbTriggerClass =
  "flex max-w-[10rem] items-center gap-0.5 truncate rounded-md px-1 py-0.5 outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none";

export type CrumbTone = "strong" | "normal" | "muted";

export function crumbToneClass(tone: CrumbTone): string {
  if (tone === "strong") return "font-semibold text-foreground";
  if (tone === "muted") return "font-normal text-muted-foreground";
  return "font-normal text-foreground";
}

/** Icon-only crumb chrome — square hit area around a 16px icon. */
export const crumbIconTriggerClass = cn(crumbTriggerClass, "shrink-0 p-1");

/** Hover label for icon-only crumbs (the icon alone doesn't name the step). */
export function CrumbIconTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Product crumb — dropdown to jump between products. */
export function ProductCrumb({
  item,
  locked = false,
  tone = "normal",
  iconOnly = false,
  withIcon = false,
  onOpenChange,
}: {
  item: NavItem;
  locked?: boolean;
  tone?: CrumbTone;
  /** Show the product's nav icon instead of its name (compact detail trail). */
  iconOnly?: boolean;
  /** Show the product's nav icon before its name (list-page trail). */
  withIcon?: boolean;
  /** Notify parents (e.g. overflow popover) when the menu opens/closes. */
  onOpenChange?: (open: boolean) => void;
}) {
  const showSwitcher = isSwitcherProduct(item) && !locked;
  const weight = crumbToneClass(tone);
  const ProductIcon = item.icon;
  const icon = (
    <ProductIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
  );

  if (!showSwitcher) {
    if (iconOnly) {
      return (
        <CrumbIconTooltip label={item.label}>
          <span
            role="img"
            aria-label={item.label}
            className={cn(crumbIconTriggerClass, "hover:bg-transparent")}
          >
            {icon}
          </span>
        </CrumbIconTooltip>
      );
    }
    if (withIcon) {
      return (
        <span
          className={cn("flex min-w-0 items-center gap-1.5 px-1 py-0.5", weight)}
          title={item.label}
        >
          {icon}
          <span className="truncate">{item.label}</span>
        </span>
      );
    }
    return (
      <span className={cn("truncate px-1 py-0.5", weight)} title={item.label}>
        {item.label}
      </span>
    );
  }

  const trigger = (
    <DropdownMenu.Trigger asChild>
      {iconOnly ? (
        <button
          type="button"
          aria-label={`Switch product (${item.label})`}
          className={crumbIconTriggerClass}
        >
          {icon}
        </button>
      ) : (
        <button
          type="button"
          aria-label="Switch product"
          title={item.label}
          className={cn(crumbTriggerClass, weight, withIcon && "max-w-[14rem] gap-1.5")}
        >
          {withIcon ? icon : null}
          <span className="truncate">{item.label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      )}
    </DropdownMenu.Trigger>
  );

  return (
    <DropdownMenu.Root modal={false} onOpenChange={onOpenChange}>
      {iconOnly ? (
        <CrumbIconTooltip label={item.label}>{trigger}</CrumbIconTooltip>
      ) : (
        trigger
      )}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
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

/** Sub-nav leaf crumb — dropdown to jump between sibling leaves. */
export function LeafCrumb({
  leaf,
  siblings,
  locked = false,
  tone = "strong",
  iconOnly = false,
  withIcon = false,
  onOpenChange,
}: {
  leaf: NavLeaf;
  siblings: NavLeaf[];
  locked?: boolean;
  tone?: CrumbTone;
  /** Show the page's nav icon instead of its name (falls back to text when it has none). */
  iconOnly?: boolean;
  /** Show the page's nav icon before its name (list-page trail). */
  withIcon?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const weight = crumbToneClass(tone);
  const LeafIconGlyph = leaf.icon;
  const leafIcon = LeafIconGlyph ? (
    <LeafIconGlyph className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
  ) : null;
  const glyph = iconOnly ? leafIcon : null;
  const labelIcon = withIcon && !iconOnly ? leafIcon : null;

  if (locked || siblings.length <= 1) {
    if (glyph) {
      return (
        <CrumbIconTooltip label={leaf.label}>
          <span
            role="img"
            aria-label={leaf.label}
            className={cn(crumbIconTriggerClass, "hover:bg-transparent")}
          >
            {glyph}
          </span>
        </CrumbIconTooltip>
      );
    }
    if (labelIcon) {
      return (
        <span
          className={cn("flex min-w-0 items-center gap-1.5 px-1 py-0.5", weight)}
          title={leaf.label}
        >
          {labelIcon}
          <span className="truncate">{leaf.label}</span>
        </span>
      );
    }
    return (
      <span className={cn("truncate px-1 py-0.5", weight)} title={leaf.label}>
        {leaf.label}
      </span>
    );
  }

  const trigger = (
    <DropdownMenu.Trigger asChild>
      {glyph ? (
        <button
          type="button"
          aria-label={`Switch section (${leaf.label})`}
          className={crumbIconTriggerClass}
        >
          {glyph}
        </button>
      ) : (
        <button
          type="button"
          aria-label="Switch section"
          title={leaf.label}
          className={cn(crumbTriggerClass, weight, labelIcon && "max-w-[14rem] gap-1.5")}
        >
          {labelIcon}
          <span className="truncate">{leaf.label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      )}
    </DropdownMenu.Trigger>
  );

  return (
    <DropdownMenu.Root modal={false} onOpenChange={onOpenChange}>
      {glyph ? (
        <CrumbIconTooltip label={leaf.label}>{trigger}</CrumbIconTooltip>
      ) : (
        trigger
      )}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className="z-50 min-w-[220px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
        >
          {siblings.map((sibling) => {
            const SiblingIcon = sibling.icon;
            return (
              <DropdownMenu.Item key={sibling.path} asChild>
                <NavLink
                  to={sibling.path}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-accent",
                    sibling.path === leaf.path && "bg-accent font-medium"
                  )}
                >
                  {SiblingIcon ? (
                    <SiblingIcon
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  ) : null}
                  <span className="truncate">{sibling.label}</span>
                </NavLink>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
