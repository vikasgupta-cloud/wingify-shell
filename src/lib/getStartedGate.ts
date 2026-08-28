/** Get Started workspace — gated onboarding routes and nav helpers. */

export const GET_STARTED_PATH = "/home/get-started";

/** Home sub-nav leaves that stay clickable while the workspace is locked. */
export function isGetStartedHomeLeaf(path: string): boolean {
  return path === GET_STARTED_PATH;
}

/** Tooltip copy for disabled nav while Get Started onboarding is incomplete. */
export function getGetStartedLockTooltip(
  progress: {
    emailVerified: boolean;
    selectedProductPath: string | null;
  }
): string | null {
  if (progress.emailVerified && progress.selectedProductPath != null) return null;
  if (!progress.emailVerified) {
    return "Verify your email and select a product to Unlock your Trial";
  }
  return "Select a product to unlock your trial.";
}
