/** Upgrade → Push Notifications page. */

import UpgradeProductLayout from "./UpgradeProductLayout";
import { PUSH_NOTIFICATIONS_CATALOG } from "@/data/upgradeOtherProducts";

export default function UpgradePushNotificationsPage() {
  return <UpgradeProductLayout catalog={PUSH_NOTIFICATIONS_CATALOG} />;
}
