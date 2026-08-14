import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  HelpCircle,
  Pencil,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVisibleCampaigns } from "@/store/rows";
import { useConfigStore } from "@/store/config";
import { OLD_EXPERIMENT_BASE, OLD_STEPS, oldCampaignPath } from "./oldFlow";

export default function OldCampaignShell() {
  const { entityId = "" } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const campaigns = useVisibleCampaigns();
  const campaign = campaigns.find((c) => c.id === entityId);
  const ensureConfig = useConfigStore((s) => s.ensureConfig);

  const step = pathname.split("/").pop() ?? "pages";
  const isReports = step === "reports";
  const stepIndex = OLD_STEPS.findIndex((s) => s.id === step);

  useEffect(() => {
    if (campaign) ensureConfig(campaign.id, campaign.name, campaign);
  }, [campaign, ensureConfig]);

  if (!campaign) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-2 px-12">
        <p className="text-sm font-medium text-foreground">Campaign not found</p>
        <Button variant="outline" asChild>
          <Link to={OLD_EXPERIMENT_BASE}>Back to campaigns</Link>
        </Button>
      </div>
    );
  }

  const goPrev = () => {
    if (stepIndex <= 0) return;
    navigate(oldCampaignPath(campaign.id, OLD_STEPS[stepIndex - 1].id));
  };
  const goNext = () => {
    if (stepIndex < 0 || stepIndex >= OLD_STEPS.length - 1) return;
    navigate(oldCampaignPath(campaign.id, OLD_STEPS[stepIndex + 1].id));
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-canvas">
      <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-stretch gap-4 border-b border-border bg-background px-6">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate font-title text-sm font-semibold text-foreground">
            {campaign.name}
          </p>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Rename campaign"
          >
            <Pencil className="size-3.5" />
          </button>
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 font-number text-xs tabular-nums text-muted-foreground">
            #{campaign.id}
            <Copy className="size-3" />
          </span>
        </div>

        <nav className="flex items-stretch justify-center gap-6 text-sm">
          <NavLink
            to={oldCampaignPath(campaign.id, "pages")}
            className={() =>
              cn(
                "-mb-px flex items-center border-b-2 font-medium",
                !isReports
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )
            }
          >
            Configuration
          </NavLink>
          <NavLink
            to={oldCampaignPath(campaign.id, "reports")}
            className={({ isActive }) =>
              cn(
                "-mb-px flex items-center border-b-2 font-medium",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )
            }
          >
            Reports
          </NavLink>
        </nav>

        <div className="flex items-center justify-end">
          <Button type="button" variant="ghost" size="sm" disabled>
            Send for Approval
          </Button>
        </div>
      </header>

      {isReports ? (
        <div className="flex min-h-0 flex-1">
          <Outlet />
        </div>
      ) : (
        <>
          <div className="flex min-h-0 flex-1">
            <aside className="w-56 shrink-0 border-r border-border bg-background py-6">
              <p className="px-4 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                1 Define
              </p>
              <nav className="flex flex-col gap-0.5 px-2">
                {OLD_STEPS.map((item) => {
                  const active = step === item.id;
                  return (
                    <NavLink
                      key={item.id}
                      to={oldCampaignPath(campaign.id, item.id)}
                      className={cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm",
                        active
                          ? "bg-muted font-medium text-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <span>{item.label}</span>
                      {item.id === "integrations" ? (
                        <CheckCircle2 className="size-3.5 text-success-fg" />
                      ) : (
                        <HelpCircle className="size-3.5 text-muted-foreground" />
                      )}
                    </NavLink>
                  );
                })}
                <button
                  type="button"
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  More configurations
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>
              </nav>
              <p className="mt-6 flex items-center justify-between px-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                2 Review
                <ChevronDown className="size-3.5" />
              </p>
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-canvas">
              <div className="min-h-0 flex-1 overflow-y-auto px-10 py-8">
                <Outlet />
              </div>
              <footer className="sticky bottom-0 z-10 flex shrink-0 items-center justify-between border-t border-border bg-background px-10 py-3">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={stepIndex <= 0}
                    onClick={goPrev}
                  >
                    <ChevronLeft className="size-3.5" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={stepIndex >= OLD_STEPS.length - 1}
                    onClick={goNext}
                  >
                    Next
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm">
                    Discard
                  </Button>
                  <Button type="button" size="sm">
                    Save Now
                  </Button>
                </div>
              </footer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
