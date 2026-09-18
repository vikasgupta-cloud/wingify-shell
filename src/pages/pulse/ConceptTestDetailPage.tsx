/** Pulse → Concept Test detail — Coming soon body; breadcrumbs from DetailShell. */

import ComingSoonState from "@/components/empty/ComingSoonState";

const LIST_PATH = "/pulse/concept-test";

export default function ConceptTestDetailPage() {
  return (
    <ComingSoonState
      title="Concept test coming soon"
      description="This concept test opens from the Concept Test list. Configuration and results will land here next — for now the listing and views are available."
      homeTo={LIST_PATH}
      homeLabel="Back to Concept Test"
    />
  );
}
