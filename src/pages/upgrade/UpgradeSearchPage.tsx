/** Upgrade → Search page. */

import UpgradeProductLayout from "./UpgradeProductLayout";
import { SEARCH_CATALOG } from "@/data/upgradeOtherProducts";

export default function UpgradeSearchPage() {
  return <UpgradeProductLayout catalog={SEARCH_CATALOG} />;
}
