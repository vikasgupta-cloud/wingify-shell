/** Pulse → Surveys detail — Settings Summary; A/B-style header via DetailShell (no header tabs). */

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Pencil } from "@/components/icons/protoLucide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDetailPanelsStore } from "@/store/detailPanels";
import { useVisibleSurveys } from "@/store/surveyRows";

const SETTINGS_TABS = [
  "Summary",
  "Configure",
  "Questions",
  "Design",
  "Advanced Options",
] as const;

type SettingsTab = (typeof SETTINGS_TABS)[number];

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-none shadow-none">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground"
            aria-label={`Edit ${title}`}
          >
            <Pencil className="size-3.5" strokeWidth={1.75} />
          </Button>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export default function SurveyDetailPage() {
  const { entityId = "" } = useParams();
  const surveys = useVisibleSurveys();
  const survey = useMemo(
    () => surveys.find((s) => s.id === entityId) ?? surveys[0],
    [surveys, entityId]
  );
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("Summary");
  const openPanel = useDetailPanelsStore((s) => s.open);

  useEffect(() => {
    openPanel("activity");
  }, [openPanel, entityId]);

  if (!survey) {
    return (
      <div className="px-12 py-16 text-sm text-muted-foreground">
        Survey not found.
      </div>
    );
  }

  const campaignUrl = survey.url;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-16">
      <div className="border-b border-border px-12">
        <nav
          aria-label="Survey settings sections"
          className="flex items-stretch gap-5"
        >
          {SETTINGS_TABS.map((tab) => {
            const active = settingsTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSettingsTab(tab)}
                className={cn(
                  "border-b-2 px-0.5 py-3 -mb-px text-sm font-medium transition-colors",
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6 px-12 pt-8">
        {settingsTab === "Summary" ? (
          <>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Settings Summary
            </h1>

            <div className="grid max-w-3xl gap-4">
              <SummaryCard title="URLs">
                <Field label="Included URLs">
                  <p className="break-all">{campaignUrl}</p>
                </Field>
                <Field label="Default Campaign URL">
                  <p className="break-all">{campaignUrl}</p>
                </Field>
              </SummaryCard>

              <SummaryCard title="Specific Visitor Group Targets">
                <Badge tone="neutral" fill="light" size="sm" variant="pill">
                  Custom Segment
                </Badge>
                <p className="text-sm leading-relaxed text-foreground">
                  All Visitors where Query Parameter{" "}
                  <span className="font-medium">wingifytestblog</span> is equal
                  to (case insens.){" "}
                  <span className="font-medium">890</span>
                </p>
              </SummaryCard>

              <SummaryCard title="Triggers">
                <Badge tone="neutral" fill="light" size="sm" variant="pill">
                  Standard
                </Badge>
                <div className="space-y-1 text-sm text-foreground">
                  <p className="font-medium">Page scrolled &gt; 50%</p>
                  <p className="leading-relaxed text-muted-foreground">
                    Trigger this immediately for visitors who performed Page
                    scroll where Percent of page height from top is greater than
                    50
                  </p>
                </div>
              </SummaryCard>
            </div>
          </>
        ) : (
          <div className="max-w-xl space-y-2 pt-4">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {settingsTab}
            </h1>
            <p className="text-sm text-muted-foreground">
              {settingsTab} for {survey.name} will land here next.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
