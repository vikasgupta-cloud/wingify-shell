/** Feature Management detail placeholder — breadcrumbs from DetailShell; body is Coming soon. */

import ComingSoonState from "@/components/empty/ComingSoonState";
import {
  FLAG_REPORT_CONFIG,
  type FlagReportKind,
} from "@/config/flagReports";

const FLAG_REPORT_PATHS: Record<string, FlagReportKind> = {
  "/feature-management/flag-rollout": "rollout",
  "/feature-management/flag-testing": "testing",
  "/feature-management/flag-personalize": "personalize",
  "/feature-management/flag-multivariate": "multivariate",
};

const COPY: Record<
  string,
  { title: string; description: string; homeLabel: string }
> = {
  "/feature-management/feature-flags": {
    title: "Feature flag coming soon",
    description:
      "This flag opens from the Feature Flags list. Configuration and targeting will land here next — for now the listing and views are available.",
    homeLabel: "Back to Feature Flags",
  },
};

export default function FlagDetailPage({ listPath }: { listPath: string }) {
  const kind = FLAG_REPORT_PATHS[listPath];
  const report = kind ? FLAG_REPORT_CONFIG[kind] : undefined;
  const preset = COPY[listPath];

  const title =
    preset?.title ??
    (report ? `${report.title.replace(/^Feature Flags /, "")} coming soon` : "Coming soon");
  const description =
    preset?.description ??
    (report
      ? `This item opens from the ${report.title} list. Configuration and reports will land here next — for now the listing and views are available.`
      : "This section is still in progress.");
  const homeLabel =
    preset?.homeLabel ??
    (report ? `Back to ${report.title.replace(/^Feature Flags /, "Flag ")}` : "Back");

  return (
    <ComingSoonState
      title={title}
      description={description}
      homeTo={listPath}
      homeLabel={homeLabel}
    />
  );
}
