/** Upgrade → Web Personalization page. */

import UpgradeProductLayout from "./UpgradeProductLayout";
import { PERSONALIZE_WEB_CATALOG } from "@/data/upgradeOtherProducts";

export default function UpgradePersonalizeWebPage() {
  return <UpgradeProductLayout catalog={PERSONALIZE_WEB_CATALOG} />;
}
