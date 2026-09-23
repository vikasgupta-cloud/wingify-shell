/** Upgrade → Behavior Analytics page. */

import UpgradeProductLayout from "./UpgradeProductLayout";
import { BEHAVIOR_ANALYTICS_CATALOG } from "@/data/upgradeOtherProducts";

export default function UpgradeBehaviorAnalyticsPage() {
  return <UpgradeProductLayout catalog={BEHAVIOR_ANALYTICS_CATALOG} />;
}
