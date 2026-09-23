/** Upgrade → Feature Management page. */

import UpgradeProductLayout from "./UpgradeProductLayout";
import { FEATURE_MANAGEMENT_CATALOG } from "@/data/upgradeOtherProducts";

export default function UpgradeFeatureManagementPage() {
  return <UpgradeProductLayout catalog={FEATURE_MANAGEMENT_CATALOG} />;
}
