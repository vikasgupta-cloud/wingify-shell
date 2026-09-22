/** Settings → Subscription → My Subscription — Active Products card list.
 * Header CTAs live in DrillInShell. Reuses shadcn Button + Tooltip.
 */

import { ChevronRight, CircleHelp, Info } from "@/components/icons/protoLucide";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ACTIVE_SUBSCRIPTION_PRODUCTS,
  type SubscriptionProduct,
} from "@/data/mySubscription";

function InfoTip({ label }: { label: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex text-muted-foreground hover:text-foreground"
            aria-label={label}
          >
            <Info className="size-3.5" strokeWidth={1.75} aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ProductCard({ product }: { product: SubscriptionProduct }) {
  const Icon = product.icon;

  return (
    <button
      type="button"
      className="flex w-full items-center gap-6 rounded-xl border border-border bg-background px-5 py-4 text-left transition-colors hover:bg-muted/30"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
          <Icon className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {product.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {product.badges.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {badge.label}
                {badge.hasInfo ? (
                  <CircleHelp
                    className="size-2.5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                ) : null}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden min-w-[11rem] shrink-0 sm:block">
        <p className="text-xs text-muted-foreground">{product.metricLabel}</p>
        <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
          {product.metricValue}
        </p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <span className="truncate">{product.metricDetail}</span>
          <InfoTip label={product.metricDetail} />
        </p>
      </div>

      <div className="hidden min-w-[10rem] shrink-0 md:block">
        <p className="text-xs text-muted-foreground">Next renewal</p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">
          {product.renewalDate}
        </p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <span>Billing frequency: {product.billingFrequency}</span>
          <InfoTip label={`Billing frequency: ${product.billingFrequency}`} />
        </p>
      </div>

      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden
      />
    </button>
  );
}

export default function MySubscriptionPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-8 pb-16 pt-10">
      <h2 className="text-sm font-semibold text-foreground">Active Products</h2>
      <div className="flex flex-col gap-3">
        {ACTIVE_SUBSCRIPTION_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
