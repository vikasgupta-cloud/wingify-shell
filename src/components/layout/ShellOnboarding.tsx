import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronRight } from "@/components/icons/protoLucide";
import { SHELL_ONBOARDING_SLIDES } from "@/config/shellOnboarding";
import {
  shouldShowShellOnboarding,
  useShellOnboardingStore,
} from "@/store/shellOnboarding";
import { useThemeStore } from "@/store/theme";
import { cn } from "@/lib/utils";

const BOOT_SPLASH_FALLBACK_MS = 3500;
/** How long the flying mark plays inside the modal before content slides. */
const MODAL_SPLASH_MS = 2200;

export default function ShellOnboarding() {
  const seenVersion = useShellOnboardingStore((s) => s.seenVersion);
  const markSeen = useShellOnboardingStore((s) => s.markSeen);
  const colorMode = useThemeStore((s) => s.colorMode);
  const [open, setOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [step, setStep] = useState(0);

  const logoSrc =
    colorMode === "dark" ? "/wingify-logo-dark.svg" : "/wingify-logo.svg";

  const lastStep = SHELL_ONBOARDING_SLIDES.length - 1;
  const slide = SHELL_ONBOARDING_SLIDES[step]!;

  useEffect(() => {
    if (!shouldShowShellOnboarding(seenVersion)) return;

    let cancelled = false;

    const tryOpen = () => {
      if (cancelled || document.getElementById("boot-splash")) return false;
      setShowSplash(true);
      setStep(0);
      setOpen(true);
      return true;
    };

    if (tryOpen()) return;

    const interval = window.setInterval(() => {
      if (tryOpen()) window.clearInterval(interval);
    }, 100);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      if (!cancelled) {
        setShowSplash(true);
        setStep(0);
        setOpen(true);
      }
    }, BOOT_SPLASH_FALLBACK_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [seenVersion]);

  useEffect(() => {
    if (!open || !showSplash) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const timeout = window.setTimeout(
      () => setShowSplash(false),
      reduceMotion ? 0 : MODAL_SPLASH_MS
    );

    return () => window.clearTimeout(timeout);
  }, [open, showSplash]);

  const finish = () => {
    markSeen();
    setOpen(false);
  };

  const goNext = () => {
    if (step >= lastStep) {
      finish();
      return;
    }
    setStep((current) => current + 1);
  };

  if (!shouldShowShellOnboarding(seenVersion) && !open) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) finish();
        else setOpen(true);
      }}
    >
      <DialogContent className="gap-0 overflow-hidden border-border/80 p-0 shadow-xl sm:max-w-[28rem] [&>button]:right-5 [&>button]:top-5 [&>button]:opacity-60 [&>button]:hover:opacity-100">
        {showSplash ? (
          <div
            className="flex min-h-[26rem] items-center justify-center bg-[#141412] px-8 py-12"
            aria-label="Wingify"
          >
            <img
              src="/wingify-splash.gif"
              alt=""
              width={200}
              height={200}
              className="h-[7.5rem] w-auto scale-x-[-1]"
            />
          </div>
        ) : (
          <>
            <div className="relative overflow-hidden bg-[linear-gradient(180deg,color-mix(in_srgb,var(--muted)_55%,transparent)_0%,var(--background)_100%)] px-8 pb-7 pt-10 animate-in fade-in duration-400">
              <div
                className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full border border-border/50"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -left-6 bottom-4 size-24 rounded-full border border-border/35"
                aria-hidden
              />

              <div
                key={slide.id}
                className="relative animate-in fade-in slide-in-from-right-3 duration-300"
              >
                {step === 0 ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-8 flex size-28 items-center justify-center rounded-[1.75rem] border border-border/70 bg-background/80 shadow-[0_1px_0_0_color-mix(in_srgb,var(--foreground)_6%,transparent)] backdrop-blur-sm">
                      <img
                        src={logoSrc}
                        alt=""
                        className="h-[4.5rem] w-auto"
                        width={76}
                        height={76}
                      />
                    </div>
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {slide.eyebrow}
                    </p>
                    <DialogTitle className="font-title mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground">
                      {slide.title}
                    </DialogTitle>
                    <DialogDescription className="mt-3 max-w-[22rem] text-sm leading-relaxed text-muted-foreground">
                      {slide.description}
                    </DialogDescription>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {slide.eyebrow}
                      </p>
                      <DialogTitle className="font-title mt-2 text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground">
                        {slide.title}
                      </DialogTitle>
                      <DialogDescription className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {slide.description}
                      </DialogDescription>
                    </div>

                    {slide.highlights ? (
                      <div className="flex flex-wrap gap-2">
                        {slide.highlights.map((label) => (
                          <span
                            key={label}
                            className="rounded-full border border-border/80 bg-background/70 px-3 py-1 text-xs font-medium text-foreground shadow-sm"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border/70 bg-background px-8 py-5">
              <div
                className="flex items-center gap-2"
                aria-label="Onboarding progress"
              >
                {SHELL_ONBOARDING_SLIDES.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === step ? "step" : undefined}
                    onClick={() => setStep(index)}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      index === step
                        ? "h-1.5 w-8 bg-foreground"
                        : "size-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={finish}>
                  Skip
                </Button>
                <Button type="button" size="sm" onClick={goNext}>
                  {step === lastStep ? (
                    "Enter Wingify"
                  ) : (
                    <>
                      Continue
                      <ChevronRight aria-hidden />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
