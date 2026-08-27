/** Create recommendation — location → strategy picker (Empty / stubs). */

import { useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Eye,
  FileText,
  Home,
  Layers,
  RefreshCw,
  Rocket,
  Sparkles,
  Square,
  TrendingUp,
} from "@/components/icons/protoLucide";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CREATE_LOCATION_OPTIONS,
  STRATEGY_TEMPLATES,
  type CreateLocationOption,
} from "@/config/recommendationCreate";
import {
  recommendationLandingPath,
  type RecommendationLocation,
} from "@/data/recommendations";
import { useRecommendationRowsStore } from "@/store/recommendationRows";
import { cn } from "@/lib/utils";

type Step = "location" | "strategy";

const LOCATION_ICONS: Record<
  CreateLocationOption["icon"],
  ComponentType<{ className?: string }>
> = {
  home: Home,
  landing: Rocket,
  category: BookOpen,
  product: Layers,
};

const TEMPLATE_ICONS = {
  bestsellers: TrendingUp,
  consulted: Eye,
  repurchase: RefreshCw,
} as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateRecommendationWizard({
  open,
  onOpenChange,
}: Props) {
  const navigate = useNavigate();
  const create = useRecommendationRowsStore((s) => s.create);
  const [step, setStep] = useState<Step>("location");
  const [location, setLocation] = useState<RecommendationLocation | null>(
    null
  );

  const reset = () => {
    setStep("location");
    setLocation(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const pickLocation = (loc: RecommendationLocation) => {
    setLocation(loc);
    setStep("strategy");
  };

  const startEmpty = () => {
    if (!location) return;
    const id = create({
      name: "New recommendation",
      status: "Draft",
      location,
    });
    handleOpenChange(false);
    navigate(recommendationLandingPath({ id }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] w-[min(92vw,560px)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-0 border-b border-border px-6 py-5 text-left">
          <DialogTitle className="font-sans text-lg font-semibold tracking-tight text-foreground">
            New recommendation strategy
          </DialogTitle>
          <DialogDescription className="sr-only">
            {step === "location"
              ? "Choose a location for your recommendation"
              : "Pick a strategy template to start from"}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 px-6 py-5">
          {step === "location" ? (
            <div className="space-y-4">
              <p className="font-sans text-sm text-muted-foreground">
                Define the location of your recommendation…
              </p>
              <ul className="flex flex-col gap-2.5">
                {CREATE_LOCATION_OPTIONS.map((opt) => {
                  const Icon = LOCATION_ICONS[opt.icon];
                  return (
                    <li key={opt.id}>
                      <button
                        type="button"
                        onClick={() => pickLocation(opt.id)}
                        className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1 font-sans text-sm font-medium text-foreground">
                          {opt.label}
                        </span>
                        <ChevronRight
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setStep("location")}
                className="inline-flex items-center gap-1.5 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" aria-hidden />
                Pick a strategy to start from…
              </button>

              <section className="space-y-2.5">
                <p className="font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Basics
                </p>
                <button
                  type="button"
                  onClick={startEmpty}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                    <FileText className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-sans text-sm font-medium text-foreground">
                      Empty strategy
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Start from scratch and build your strategy
                    </span>
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </button>
              </section>

              <section className="space-y-2.5">
                <p className="flex items-center gap-2 font-sans text-xs font-medium text-foreground">
                  <Sparkles className="size-3.5 text-muted-foreground" aria-hidden />
                  Recommended for {location}
                </p>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {STRATEGY_TEMPLATES.map((tpl) => {
                    const Icon = TEMPLATE_ICONS[tpl.icon] ?? Square;
                    return (
                      <div
                        key={tpl.id}
                        aria-disabled
                        title="Coming soon"
                        className={cn(
                          "flex w-[220px] shrink-0 flex-col gap-2 rounded-lg border border-border bg-background p-4",
                          "cursor-not-allowed opacity-70"
                        )}
                      >
                        <span className="flex size-8 items-center justify-center rounded-full border border-border bg-muted/40 text-foreground">
                          <Icon className="size-3.5" aria-hidden />
                        </span>
                        <p className="font-sans text-sm font-medium text-foreground">
                          {tpl.title}
                        </p>
                        <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                          {tpl.description}
                        </p>
                        <ChevronRight
                          className="mt-1 size-3.5 self-end text-muted-foreground"
                          aria-hidden
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Templates are stubs for now.
                </p>
              </section>
            </div>
          )}
        </div>

        {step === "strategy" && (
          <div className="shrink-0 border-t border-border px-6 py-3">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setStep("location")}
            >
              <ArrowLeft className="size-3.5" />
              Back
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
