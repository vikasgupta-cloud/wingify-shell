/** Upgrade → Recommendations page. */

import UpgradeProductLayout from "./UpgradeProductLayout";
import { RECOMMENDATIONS_CATALOG } from "@/data/upgradeOtherProducts";

export default function UpgradeRecommendationsPage() {
  return <UpgradeProductLayout catalog={RECOMMENDATIONS_CATALOG} />;
}
