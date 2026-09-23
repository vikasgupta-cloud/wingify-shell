/** Upgrade → Web Experimentation & Rollout page. */

import UpgradeProductLayout from "./UpgradeProductLayout";
import { TESTING_WEB_CATALOG } from "@/data/upgradeTestingWeb";

export default function UpgradeTestingWebPage() {
  return <UpgradeProductLayout catalog={TESTING_WEB_CATALOG} />;
}
