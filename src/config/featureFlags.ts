/**
 * Client-side feature flags for Wingify Shell.
 *
 * Edit values in `featureFlags.json` (`"on"` / `"off"`), then refresh the app.
 * See FEATURE_FLAGS.md for what each flag controls.
 */
import featureFlagsJson from "./featureFlags.json";

export type FeatureFlagState = "on" | "off";

export type FeatureFlag = keyof typeof featureFlagsJson;

/** Parsed flag map — values are `"on"` or `"off"`. */
export const FEATURE_FLAGS = featureFlagsJson as {
  readonly [K in FeatureFlag]: FeatureFlagState;
};

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag] === "on";
}
