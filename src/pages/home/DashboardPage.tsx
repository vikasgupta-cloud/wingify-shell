// Home → Dashboard — static overview cards + Wandz hero (wired to existing chat).
// Card grid layout matches product screenshots. Create stays hidden via nav.

import { useLocation } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { iconForPath, pageLabel } from "@/lib/nav";
import {
  ActiveTestsCard,
  DashboardGreeting,
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
      <PageHeader title={pageLabel(pathname)} icon={iconForPath(pathname)} />
      <div className="px-12 pt-2">
        <DashboardGreeting />
      </div>

      <div className="mt-8 space-y-8 px-12">
        <WandzHero />

        {/* Row: Metric reports | Funnel reports */}
        <div className="grid gap-6 xl:grid-cols-2">
          <MetricReportsCard />
          <FunnelReportsCard />
        </div>

        {/* Full-width hypothesis pipeline */}
        <HypothesisCard />

        {/* Left stack (Active + Personalization) | Untested hypotheses */}
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-6">
            <ActiveTestsCard />
            <PersonalizationCard />
          </div>
          <UntestedHypothesesCard />
        </div>

        {/* Rolled out (wider) | Total experiences */}
        <div className="grid gap-6 md:grid-cols-[1.7fr_1fr]">
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
