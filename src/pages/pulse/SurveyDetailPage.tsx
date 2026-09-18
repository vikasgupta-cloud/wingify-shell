/** Pulse → Surveys detail — Coming soon body; breadcrumbs from DetailShell. */

import ComingSoonState from "@/components/empty/ComingSoonState";

const LIST_PATH = "/pulse/surveys";

export default function SurveyDetailPage() {
  return (
    <ComingSoonState
      title="Survey coming soon"
      description="This survey opens from the Surveys list. Configuration and responses will land here next — for now the listing and views are available."
      homeTo={LIST_PATH}
      homeLabel="Back to Surveys"
    />
  );
}
