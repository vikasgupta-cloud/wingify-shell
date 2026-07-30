import SavedFilterBarClassic from "./SavedFilterBarClassic";
import SavedFilterBarQuiet from "./SavedFilterBarQuiet";
import { isFeatureEnabled } from "../../config/featureFlags";

/**
 * Picks classic (chips + dirty Save/Discard) or quiet (title + ⋯) chrome.
 * Quiet wins when both flags are on. Neither → renders nothing.
 */
export default function SavedFilterBar({
  campaignId,
  embedded,
}: {
  campaignId: string;
  embedded?: boolean;
}) {
  if (isFeatureEnabled("savedFiltersQuiet")) {
    return <SavedFilterBarQuiet campaignId={campaignId} embedded={embedded} />;
  }
  if (isFeatureEnabled("savedFiltersClassic")) {
    return (
      <SavedFilterBarClassic campaignId={campaignId} embedded={embedded} />
    );
  }
  return null;
}
