/** Upgrade → User Feedback page. */

import UpgradeProductLayout from "./UpgradeProductLayout";
import { USER_FEEDBACK_CATALOG } from "@/data/upgradeOtherProducts";

export default function UpgradeUserFeedbackPage() {
  return <UpgradeProductLayout catalog={USER_FEEDBACK_CATALOG} />;
}
