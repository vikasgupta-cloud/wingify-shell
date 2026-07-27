import type { PageGroup, PageRule, UrlSettings } from "../store/config";

// Outcome of testing one URL against a campaign's include/exclude page rules.
export type EligibilityResult = "run" | "no-run" | "excluded" | "invalid";

// A tested URL is valid only if it parses as an http(s) URL with a hostname —
// "https://" on its own (no host) is rejected, matching the picker's error state.
export function isValidTestUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.length > 0;
  } catch {
    return false;
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Normalize a URL/value for comparison per a rule's URL settings.
function normalize(raw: string, settings: UrlSettings): string {
  let s = raw.trim();
  if (settings.ignoreFragment) s = s.split("#")[0];
  if (settings.ignoreQueryString) s = s.split("?")[0];
  if (settings.caseInsensitive) s = s.toLowerCase();
  return s;
}

// Does a single rule match the tested URL? Page-group rules reference saved
// groups with no concrete URL, so they never match a raw URL here.
function ruleMatches(rule: PageRule, url: string): boolean {
  if (rule.predicate === "Page group is") return false;
  const value = rule.value.trim();
  if (!value) return false;

  const tested = normalize(url, rule.settings);
  const target = normalize(value, rule.settings);

  switch (rule.predicate) {
    case "URL matches":
      return tested === target;
    case "URL contains":
      return tested.includes(target);
    case "URL starts with":
      return tested.startsWith(target);
    case "URL ends with":
      return tested.endsWith(target);
    case "URL matches pattern":
      // '*' is a wildcard for any run of characters.
      return new RegExp(
        "^" + target.split("*").map(escapeRegExp).join(".*") + "$"
      ).test(tested);
    case "URL matches regex":
      try {
        return new RegExp(value, rule.settings.caseInsensitive ? "i" : "").test(
          url.trim()
        );
      } catch {
        return false;
      }
    default:
      return false;
  }
}

function anyRuleMatches(
  groups: PageGroup[],
  kind: "include" | "exclude",
  url: string
): boolean {
  return groups
    .filter((g) => g.kind === kind)
    .some((g) => g.rules.some((r) => ruleMatches(r, url)));
}

// Exclusion wins over inclusion; a valid URL matching no include rule won't run.
export function evaluateEligibility(
  url: string,
  groups: PageGroup[]
): EligibilityResult {
  if (!isValidTestUrl(url)) return "invalid";
  if (anyRuleMatches(groups, "exclude", url)) return "excluded";
  if (anyRuleMatches(groups, "include", url)) return "run";
  return "no-run";
}

export const ELIGIBILITY_MESSAGE: Record<EligibilityResult, string> = {
  run: "The campaign will run on this url.",
  "no-run": "The campaign will not run on this url.",
  excluded: "The campaign will not run on this url as it matches an exclusion rule.",
  invalid: "Please enter a valid URL",
};
