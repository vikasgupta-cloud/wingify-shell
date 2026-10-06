/** Design preview — welcome start choice (Playground vs account setup). Not in nav. */

import {
  CheckCircle2,
  Play,
  Settings2,
} from "@/components/icons/protoLucide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ACCOUNT_NAME = "Automation Testing 1791200946097";

export default function WelcomeStartPreviewPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <div className="w-full max-w-3xl space-y-10 text-center">
          <div className="space-y-2">
            <h1 className="font-title text-3xl font-semibold tracking-tight text-foreground">
              Welcome, {ACCOUNT_NAME}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Your account is ready. How would you like to start?
            </p>
          </div>

          <div className="grid gap-4 text-left sm:grid-cols-2">
            <Card className="shadow-none">
              <CardContent className="flex h-full flex-col gap-5 p-6">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                    <Play className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">
                        Explore Wingify Playground
                      </h2>
                      <Badge tone="neutral" fill="light" size="sm" variant="pill">
                        No setup required
                      </Badge>
                    </div>
                  </div>
                </div>

                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-foreground"
                      aria-hidden
                    />
                    Try Wingify in a live demo environment
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-foreground"
                      aria-hidden
                    />
                    Experiment without connecting your site
                  </li>
                </ul>

                <div className="mt-auto pt-2">
                  <Button type="button" variant="outline" className="w-full">
                    Explore
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="flex h-full flex-col gap-5 p-6">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                    <Settings2 className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">
                        Continue account Setup
                      </h2>
                      <Badge tone="neutral" fill="light" size="sm" variant="pill">
                        10% completed
                      </Badge>
                    </div>
                  </div>
                </div>

                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-foreground"
                      aria-hidden
                    />
                    Connect your site to run live experiments
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-foreground"
                      aria-hidden
                    />
                    Collaborate with your team to improve conversions
                  </li>
                </ul>

                <div className="mt-auto pt-2">
                  <Button type="button" variant="default" className="w-full">
                    Continue Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="shrink-0 px-6 pb-10 text-center">
        <p className="text-sm font-medium text-foreground">Need help?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Our optimization experts are here for you.
        </p>
      </footer>
    </div>
  );
}
