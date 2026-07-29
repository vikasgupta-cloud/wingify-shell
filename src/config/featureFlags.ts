/**
 * Client-side feature flags for Wingify Shell.
 *
 * Toggle flags here when enabling/disabling unfinished UI.
 * See FEATURE_FLAGS.md for what each flag controls.
 */
export const FEATURE_FLAGS = {
  /**
   * Saved filters bar on Reports → Results (chips, Save / Discard, rearrange).
   * Off until the UX is ready to ship.
   */
  savedFilters: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}
