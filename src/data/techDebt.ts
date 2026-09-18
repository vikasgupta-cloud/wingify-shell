/** Dummy Tech Debt rows for the Feature Management Maintain list. */

export type TechDebtCodeRef = {
  fileName: string;
  fileLocation: string;
  line: number;
  character: number;
  /** Lines shown in the snippet gutter (1-indexed display). */
  snippetLines: { n: number; text: string; highlight?: "ident" | "string" }[];
};

export type TechDebtRow = {
  id: string;
  flagKey: string;
  repository: string;
  branch: string;
  recommendation: string;
  reason: string;
  lastSynced: string;
  codeRefs: TechDebtCodeRef[];
};

export const TECH_DEBT_ROWS: TechDebtRow[] = [
  {
    id: "td-1",
    flagKey: "DiscountFilter",
    repository: "vwo-fme-node-sd..",
    branch: "main",
    recommendation: "No action required.",
    reason: "No code references found.",
    lastSynced: "01-10-2025, 08:41 AM",
    codeRefs: [],
  },
  {
    id: "td-2",
    flagKey: "FestiveCoupon",
    repository: "vwo-fme-node-sd..",
    branch: "main",
    recommendation: "Remove from code or create in Wingify.",
    reason: "Not present in the account.",
    lastSynced: "01-10-2025, 09:48 AM",
    codeRefs: [
      {
        fileName: "Main.java",
        fileLocation: "/",
        line: 81,
        character: 52,
        snippetLines: [
          { n: 1, text: "GetFlag", highlight: "ident" },
          { n: 2, text: "getFlagResponse =" },
          { n: 3, text: "instance.getFlag" },
          {
            n: 4,
            text: '("FestiveCoupon",',
            highlight: "string",
          },
          { n: 5, text: "...)" },
        ],
      },
    ],
  },
  {
    id: "td-3",
    flagKey: "LaptopSales",
    repository: "vwo-fme-node-sd..",
    branch: "main",
    recommendation: "No action required.",
    reason: "No code references found.",
    lastSynced: "01-10-2025, 08:40 AM",
    codeRefs: [],
  },
];
