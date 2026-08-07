// Personalize campaign detail placeholder — breadcrumbs come from DetailShell;
// configure/reports bodies stay Coming soon until the product surface is built.

import ComingSoonState from "@/components/empty/ComingSoonState";

export default function PersonalizeComingSoonPage() {
  return (
    <ComingSoonState
      title="Personalize campaign coming soon"
      description="This campaign opens from the Personalize list. Configuration and reports will land here next — for now the listing, views, and Wandz hover are available."
      homeTo="/personalize"
      homeLabel="Back to Personalize"
    />
  );
}
