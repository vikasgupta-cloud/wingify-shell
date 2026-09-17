// @summary Two-step “New Rebranding” workspace intro modal (frame only; copy may iterate).
// Opens whenever the New Rebranding workspace is selected. Skip / X / Enter close only.
import { useEffect, useState } from "react";
import { ChevronRight } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspaceStore } from "@/store/workspace";
import { cn } from "@/lib/utils";

const PRODUCT_PILLS = [
  "Web Experimentation",
  "Personalize",
  "Insights",
  "Commerce",
  "Data360",
  "Wandz",
] as const;

function StepDots({ step }: { step: 0 | 1 }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      <span
        className={cn(
          "h-1.5 rounded-full transition-all",
          step === 0 ? "w-5 bg-foreground" : "w-1.5 bg-border"
        )}
      />
      <span
        className={cn(
          "h-1.5 rounded-full transition-all",
          step === 1 ? "w-5 bg-foreground" : "w-1.5 bg-border"
        )}
      />
    </div>
  );
}

export default function RebrandingIntroModal() {
  const open = useWorkspaceStore((s) => s.rebrandingModalOpen);
  const setOpen = useWorkspaceStore((s) => s.setRebrandingModalOpen);
  const [step, setStep] = useState<0 | 1>(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent
        className={cn(
          "max-w-[560px] gap-0 overflow-hidden border-border p-0 sm:rounded-2xl",
          "[&>button]:right-4 [&>button]:top-4"
        )}
      >
        {/* Decorative circles — grayscale atmosphere, not the main idea. */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border border-border"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full border border-border"
          aria-hidden
        />

        {step === 0 ? (
          <div className="relative flex flex-col items-center px-8 pb-6 pt-10 text-center">
            <div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
              <img
                src="/wingify-logo.svg"
                alt=""
                className="size-8"
                aria-hidden
              />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Introducing Wingify
            </p>
            <DialogTitle className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              VWO and AB Tasty, together
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-[28rem] text-sm leading-relaxed text-muted-foreground">
              Two leaders in experimentation are becoming one. Wingify is your
              new unified home to test, personalize, analyze, and grow — without
              switching tools.
            </DialogDescription>
          </div>
        ) : (
          <div className="relative flex flex-col px-8 pb-6 pt-12">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              One platform
            </p>
            <DialogTitle className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              Everything you need, one shell
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-[28rem] text-sm leading-relaxed text-muted-foreground">
              Experimentation, personalization, insights, commerce, and data —
              connected in a single workspace built for teams who ship faster.
            </DialogDescription>
            <div className="mt-6 flex flex-wrap gap-2">
              {PRODUCT_PILLS.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="relative flex items-center justify-between gap-3 border-t border-border px-6 py-4">
          <StepDots step={step} />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              onClick={close}
            >
              Skip
            </Button>
            {step === 0 ? (
              <Button
                type="button"
                className="gap-1.5"
                onClick={() => setStep(1)}
              >
                Continue
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            ) : (
              <Button type="button" onClick={close}>
                Enter Wingify
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
