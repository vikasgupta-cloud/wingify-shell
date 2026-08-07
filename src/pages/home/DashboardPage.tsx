// Home → Dashboard — static overview cards + Wandz hero (wired to existing chat).
// Card grid layout matches product screenshots. Create stays hidden via nav.

import { useLocation } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { iconForPath, pageLabel } from "@/lib/nav";
import {
  ActiveTestsCard,
  FormsCard,
  FunnelReportsCard,
  HeatmapsCard,
  HypothesisCard,
  MetricReportsCard,
  PersonalizationCard,
  RolledOutCard,
  SessionRecordingsCard,
  SurveysCard,
  TotalExperiencesCard,
  UntestedHypothesesCard,
  WandzHero,
} from "./dashboard/cards";

export default function DashboardPage() {
  const { pathname } = useLocation();

  return (
    <div className="pb-16">
      <PageHeader
        title={pageLabel(pathname)}
        icon={iconForPath(pathname)}
      />

      <div className="mt-14 space-y-8 px-12">
        <WandzHero />

        {/* Metric + Funnel stacked full width */}
        <div className="flex flex-col gap-6">
          <MetricReportsCard />
          <FunnelReportsCard />
        </div>

        {/* Full-width hypothesis pipeline */}
        <HypothesisCard />

        {/* Left stack (~2/3) | Untested hypotheses (~1/3) */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="flex min-w-0 flex-col gap-6">
            <ActiveTestsCard />
            <PersonalizationCard />
          </div>
          <UntestedHypothesesCard />
        </div>

        {/* Rolled out (~2/3) | Total experiences (~1/3, matches Untested) */}
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <RolledOutCard />
          <TotalExperiencesCard />
        </div>

        {/* Heatmaps | Session recordings */}
        <div className="grid gap-6 xl:grid-cols-2">
          <HeatmapsCard />
          <SessionRecordingsCard />
        </div>

        {/* Forms | Surveys */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormsCard />
          <SurveysCard />
        </div>
      </div>
    </div>
  );
}
