/**
 * Shell Commerce marks — candidate icons for the Commerce rail item, each as outline (idle) +
 * fill (selected). Drawn on the same 256 grid / 16-unit round stroke as the VWO sprite's
 * phosphor icons (see MegaphoneIcons). Not in the VWO sprite — prototype-only designs.
 *
 *   ShellCommerceIcon / ShellCommerceFillIcon   bag with spark (wired in navigation.ts)
 *   ShellBagIcon / ShellBagFillIcon             bag, no spark
 *   ShellCartSparkIcon / ShellCartSparkFillIcon cart with spark
 *   ShellCartIcon / ShellCartFillIcon           cart, no spark
 */
import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

type ShellIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  strokeWidth?: number;
};

const STROKE = {
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 16,
} as const;

const BAG_BODY = "M50,80H206L224,216H32Z";
const BAG_HANDLE = "M88,80V72a40,40,0,0,1,80,0v8";
const BAG_SPARK = "M128,112Q136.4,141.6 166,150Q136.4,158.4 128,188Q119.6,158.4 90,150Q119.6,141.6 128,112Z";
const BAG_SPARK_HOLE = "M128,108Q137.2,140.8 170,150Q137.2,159.2 128,192Q118.8,159.2 86,150Q118.8,140.8 128,108Z";

const CART_LINE = "M16,32H40L76.6,163.7A16,16,0,0,0,92,176H190a16,16,0,0,0,15.4-11.7L232,72H51.1";
const CART_BASKET = "M51.1,72H232L205.4,164.3A16,16,0,0,1,190,176H92A16,16,0,0,1,76.6,163.7Z";
const CART_POLE = "M16,32H40L51.1,72";
const CART_SPARK = "M142,96Q148.2,117.8 170,124Q148.2,130.2 142,152Q135.8,130.2 114,124Q135.8,117.8 142,96Z";
const CART_SPARK_HOLE = "M142,92Q149,117 174,124Q149,131 142,156Q135,131 110,124Q135,117 142,92Z";

function Svg({
  className,
  size = 16,
  strokeWidth: _strokeWidth,
  children,
  ...props
}: ShellIconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      fill="none"
      aria-hidden
      className={cn("h-4 w-4 shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

function Spark({ d }: { d: string }) {
  return <path d={d} fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeWidth={8} />;
}

function Wheels() {
  return (
    <>
      <circle cx={92} cy={216} r={14} fill="currentColor" />
      <circle cx={188} cy={216} r={14} fill="currentColor" />
    </>
  );
}

/** Bag with spark — unselected. */
export function ShellCommerceIcon(props: ShellIconProps) {
  return (
    <Svg {...props}>
      <path d={BAG_BODY} {...STROKE} />
      <path d={BAG_HANDLE} {...STROKE} />
      <Spark d={BAG_SPARK} />
    </Svg>
  );
}

/** Bag with spark — selected (spark knocked out). */
export function ShellCommerceFillIcon(props: ShellIconProps) {
  return (
    <Svg {...props}>
      <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d={BAG_BODY + BAG_SPARK_HOLE} />
      <path d={BAG_BODY} {...STROKE} />
      <path d={BAG_HANDLE} {...STROKE} />
    </Svg>
  );
}

/** Bag, no spark — unselected. */
export function ShellBagIcon(props: ShellIconProps) {
  return (
    <Svg {...props}>
      <path d={BAG_BODY} {...STROKE} />
      <path d={BAG_HANDLE} {...STROKE} />
    </Svg>
  );
}

/** Bag, no spark — selected. */
export function ShellBagFillIcon(props: ShellIconProps) {
  return (
    <Svg {...props}>
      <path d={BAG_BODY} fill="currentColor" {...STROKE} />
      <path d={BAG_HANDLE} {...STROKE} />
    </Svg>
  );
}

/** Cart with spark — unselected. */
export function ShellCartSparkIcon(props: ShellIconProps) {
  return (
    <Svg {...props}>
      <path d={CART_LINE} {...STROKE} />
      <Wheels />
      <Spark d={CART_SPARK} />
    </Svg>
  );
}

/** Cart with spark — selected (spark knocked out). */
export function ShellCartSparkFillIcon(props: ShellIconProps) {
  return (
    <Svg {...props}>
      <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d={CART_BASKET + CART_SPARK_HOLE} />
      <path d={CART_BASKET} {...STROKE} />
      <path d={CART_POLE} {...STROKE} />
      <Wheels />
    </Svg>
  );
}

/** Cart, no spark — unselected. */
export function ShellCartIcon(props: ShellIconProps) {
  return (
    <Svg {...props}>
      <path d={CART_LINE} {...STROKE} />
      <Wheels />
    </Svg>
  );
}

/** Same trapezoid + handle as BAG_BODY / BAG_HANDLE, with the bottom-left corner carved away. */
const NOTCH_BAG_BODY = "M50,80H206L224,216H136Q136,144 41.5,144Z";
const NOTCH_BAG_HANDLE = BAG_HANDLE;
const NOTCH_ARROW = "M100,176L32,196L72,204L80,244Z";
const NOTCH_SPARK = "M80,164Q87.9,192.1 116,200Q87.9,207.9 80,236Q72.1,207.9 44,200Q72.1,192.1 80,164Z";

/** Bag with carved bottom-left corner holding a pointer arrow — outline only. */
export function ShellBagArrowIcon(props: ShellIconProps) {
  return (
    <Svg {...props}>
      <path d={NOTCH_BAG_BODY} {...STROKE} />
      <path d={NOTCH_BAG_HANDLE} {...STROKE} />
      <path d={NOTCH_ARROW} {...STROKE} />
    </Svg>
  );
}

/**
 * Storefront mark for the Commerce rail item — filled bag + pointer in the
 * carved corner (matches `sidebar-nav-icons/commerce-storefront.png` / commerce.svg).
 */
export function ShellStorefrontIcon(props: ShellIconProps) {
  return (
    <Svg {...props}>
      <path d={NOTCH_BAG_BODY} fill="currentColor" />
      <path d={NOTCH_BAG_HANDLE} {...STROKE} />
      <path d={NOTCH_ARROW} fill="currentColor" />
    </Svg>
  );
}

/** Bag with carved bottom-left corner holding a spark — outline only. */
export function ShellBagCornerSparkIcon(props: ShellIconProps) {
  return (
    <Svg {...props}>
      <path d={NOTCH_BAG_BODY} {...STROKE} />
      <path d={NOTCH_BAG_HANDLE} {...STROKE} />
      <Spark d={NOTCH_SPARK} />
    </Svg>
  );
}

/** Cart, no spark — selected. */
export function ShellCartFillIcon(props: ShellIconProps) {
  return (
    <Svg {...props}>
      <path d={CART_BASKET} fill="currentColor" {...STROKE} />
      <path d={CART_POLE} {...STROKE} />
      <Wheels />
    </Svg>
  );
}
