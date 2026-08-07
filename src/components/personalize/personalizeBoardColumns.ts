import type { Personalization } from "../../data/personalizations";
import type { CampaignStatus } from "../../data/campaigns";
import { STATUS_WORKFLOW } from "../../config/statusWorkflow";
import { groupPersonalizeRows, type PersonalizeGroupField } from "../../config/personalizeGrouping";
import type { PersonalizeBoardColumnConfig } from "../../store/personalizeViews";

// STATUS_WORKFLOW is declared in workflow order.
export const STATUS_ORDER = Object.keys(STATUS_WORKFLOW) as CampaignStatus[];

// Natural key order for a field: status = all 7 in workflow order (including
// empties); any other field = the keys present in the data, in groupPersonalizeRows order.
export function naturalKeys(field: PersonalizeGroupField, rows: Personalization[]): string[] {
  if (field === "status") return [...STATUS_ORDER];
  return groupPersonalizeRows(rows, field).map((g) => g.key);
}

// Keys in `order` (that still exist) come first, then remaining natural keys.
// Hidden keys are kept — used by the config panel, which shows them unchecked.
export function arrangeKeys(
  natural: string[],
  cfg: PersonalizeBoardColumnConfig | undefined
): string[] {
  const order = cfg?.order ?? [];
  const inOrder = order.filter((k) => natural.includes(k));
  const rest = natural.filter((k) => !inOrder.includes(k));
  return [...inOrder, ...rest];
}

// Ordered keys with hidden ones removed — what the board actually renders.
export function visibleKeys(
  natural: string[],
  cfg: PersonalizeBoardColumnConfig | undefined
): string[] {
  const hidden = new Set(cfg?.hidden ?? []);
  return arrangeKeys(natural, cfg).filter((k) => !hidden.has(k));
}
