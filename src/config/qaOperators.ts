// Operator definitions for the QA targeting rows (IP Address, Cookie Value,
// Query Parameter). Each operator has a full label (shown in the picker list
// and the trigger's tooltip) and a compact glyph (base symbol + optional
// case-sensitivity tag) shown in the collapsed trigger.

export type CaseTag = "ci" | "cs" | null;

export type OperatorDef = {
  id: string;
  label: string;
  symbol: string; // base glyph, e.g. "=", "≠", "∋", "∌", ".*"
  caseTag: CaseTag;
};

// IP Address operators — no case-sensitivity split (regex is inherently
// case-insensitive here, matching the reference design).
export const IP_OPERATORS: OperatorDef[] = [
  { id: "eq", label: "Is equal to", symbol: "=", caseTag: null },
  { id: "neq", label: "Is not equal to", symbol: "≠", caseTag: null },
  { id: "regex", label: "Matches Regex (case insens.)", symbol: ".*", caseTag: "ci" },
  { id: "contains", label: "Contains", symbol: "∋", caseTag: null },
  { id: "not_contains", label: "Does not contain", symbol: "∌", caseTag: null },
];

// Cookie Value + Query Parameter operators — case-insensitive and
// case-sensitive variants where it matters.
export const NAMED_OPERATORS: OperatorDef[] = [
  { id: "eq_ci", label: "Is equal to (case insens.)", symbol: "=", caseTag: "ci" },
  { id: "neq_ci", label: "Is not equal to (case insens.)", symbol: "≠", caseTag: "ci" },
  { id: "eq_cs", label: "Is equal to (case sens.)", symbol: "=", caseTag: "cs" },
  { id: "neq_cs", label: "Is not equal to (case sens.)", symbol: "≠", caseTag: "cs" },
  { id: "contains_ci", label: "Contains (case insens.)", symbol: "∋", caseTag: "ci" },
  {
    id: "not_contains_ci",
    label: "Does not contain (case insens.)",
    symbol: "∌",
    caseTag: "ci",
  },
  { id: "regex_ci", label: "Matches Regex (case insens.)", symbol: ".*", caseTag: "ci" },
];

export function findOperator(list: OperatorDef[], id: string): OperatorDef | undefined {
  return list.find((o) => o.id === id);
}
