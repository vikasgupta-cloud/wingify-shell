/** Get Started workspace — verify email and pick a product to unlock the app. */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Mail } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CURRENT_USER, productSwitcherItems } from "@/config/navigation";
import { firstChildPath } from "@/lib/nav";
import {
  useIsGetStartedUnlocked,
  useWorkspaceStore,
} from "@/store/getStartedOnboarding";
import { cn } from "@/lib/utils";

const ONBOARDING_PRODUCTS = productSwitcherItems().filter(
  (item) => item.path !== "/wandz"
);

export default function GetStartedUnlockPanel() {
  const navigate = useNavigate();
  const unlocked = useIsGetStartedUnlocked();
  const emailVerified = useWorkspaceStore(
    (s) => s.getStartedProgress.emailVerified
  );
  const selectedProductPath = useWorkspaceStore(
    (s) => s.getStartedProgress.selectedProductPath
  );
  const verifyEmail = useWorkspaceStore((s) => s.verifyGetStartedEmail);
  const selectProduct = useWorkspaceStore((s) => s.selectGetStartedProduct);

  const selectedProduct = useMemo(
    () => ONBOARDING_PRODUCTS.find((p) => p.path === selectedProductPath),
    [selectedProductPath]
  );

  const finishUnlock = (productPath: string) => {
    selectProduct(productPath);
    const product = ONBOARDING_PRODUCTS.find((p) => p.path === productPath);
    if (product) navigate(firstChildPath(product));
  };

  if (unlocked) return null;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome to Wingify
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Verify your email and choose a product to start exploring the platform.
        </p>
      </div>

      <div className="grid max-w-3xl gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">Verify your email</CardTitle>
                <CardDescription className="mt-1">
                  Confirm the address on your account to continue.
                </CardDescription>
              </div>
              {emailVerified && (
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                  <Check className="size-3.5" aria-hidden />
                  Verified
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
              <Mail className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="truncate text-foreground">{CURRENT_USER.email}</span>
            </div>
            <Button
              type="button"
              variant={emailVerified ? "secondary" : "default"}
              disabled={emailVerified}
              onClick={verifyEmail}
            >
              {emailVerified ? "Email verified" : "Verify email"}
            </Button>
          </CardContent>
        </Card>

        <Card className={cn(!emailVerified && "opacity-60")}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">Select a product</CardTitle>
                <CardDescription className="mt-1">
                  Choose where you want to begin after onboarding.
                </CardDescription>
              </div>
              {selectedProduct && (
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                  <Check className="size-3.5" aria-hidden />
                  {selectedProduct.label}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {ONBOARDING_PRODUCTS.map((product) => {
                const Icon = product.icon;
                const active = selectedProductPath === product.path;
                return (
                  <button
                    key={product.path}
                    type="button"
                    disabled={!emailVerified}
                    onClick={() => finishUnlock(product.path)}
                    className={cn(
                      "flex items-center gap-3 rounded-md border px-3 py-3 text-left text-sm transition-colors",
                      "border-border bg-background hover:bg-muted",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      active && "border-foreground bg-accent font-medium"
                    )}
                  >
                    <Icon
                      className="size-4 shrink-0 text-muted-foreground"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span className="truncate">{product.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
