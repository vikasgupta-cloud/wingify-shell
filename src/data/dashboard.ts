// Dummy static content for Home → Dashboard cards.
// Layout mirrors product screenshots; visuals use design tokens only.

export const DASHBOARD_USER_NAME = "Vinay";

export const WANDZ_CTAS = [
  {
    id: "analyze",
    label: "Analyze data",
    prompt: "Analyze my campaign and metric performance and highlight key insights.",
  },
  {
    id: "friction",
    label: "Identify friction",
    prompt: "Identify friction points in my funnels and conversion paths.",
  },
  {
    id: "ideas",
    label: "Get ideas",
    prompt: "Suggest A/B testing and usability ideas for my top pages.",
  },
  {
    id: "explore",
    label: "Explore",
    prompt: "Help me explore heatmaps and session recordings worth reviewing.",
  },
] as const;

export const WANDZ_RECENT_CHATS = [
  {
    id: "rc1",
    title: "Free Trial Sign Up Problem Analysis",
    ago: "57 minutes ago",
    prompt:
      "Help me analyze free trial sign-up drop-off and suggest what to test next.",
  },
] as const;

export const WANDZ_DEFAULT_PROMPT =
  "I want to create an A/B test for https://vwo.com/free-trial/. Help me build a variation with updated CTA copy and layout changes.";

export const METRIC_REPORT_RANGE = ["Last 7 days", "Last 30 days"] as const;

export const METRIC_REPORTS = {
  count: 69,
  chartLabel: "Unique Visitors",
  chartPoints: [42, 38, 55, 48, 72, 68, 81],
  dayLabels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  dateStart: "Aug 01",
  dateEnd: "Aug 07",
  items: [
    {
      id: "MR2312",
      name: "Metric RD Form Success - Campaign Heatmap…",
    },
    {
      id: "MR2311",
      name: "Metric Free Trial Modal Click - Get Started",
    },
    {
      id: "MR2310",
      name: "Metric Request Demo Form Success",
    },
    {
      id: "MR2309",
      name: "Pricing CTA Click Rate",
    },
    {
      id: "MR2308",
      name: "Checkout Complete Unique Visitors",
    },
    {
      id: "MR2307",
      name: "Homepage Hero Engagement",
    },
  ],
  pages: 10,
  activePage: 1,
};

export const FUNNEL_REPORTS = {
  count: 44,
  pages: 6,
  activePage: 0,
  items: [
    {
      id: "f1",
      name: "AB Testing | DE | Free Trial Banner",
      conversionRate: "0.0%",
      maxDropoffLabel: "Max dropoff after Step 1: Page visit",
      maxDropoffRate: "60.0%",
      steps: [
        { label: "Visits to …", percent: 100 },
        { label: "Click on F…", percent: 40 },
        { label: "Filling out Tria…", percent: 0 },
        { label: "Filling out Tria…", percent: 0 },
      ],
    },
  ],
};

export const HYPOTHESIS_PIPELINE = [
  { id: "backlog", label: "Backlog", count: 90 },
  { id: "selected", label: "Selected For Testing", count: 104 },
  { id: "testing", label: "Testing", count: 1 },
  { id: "completed", label: "Completed", count: 15 },
] as const;

export const HYPOTHESIS_MORE_STAGES = 3;

export const UNTESTED_HYPOTHESES = {
  count: 90,
  stats: [
    { id: "added", label: "Added in Last 7 days", count: 0 },
    { id: "not-prio", label: "Not prioritized", count: 37 },
  ],
  items: [
    {
      id: "H94",
      title: "I am merely testing will address just testing",
      description: "",
      stage: "Backlog",
      score: "5.0 / 5",
    },
    {
      id: "H216",
      title: "✨ Improve 'Optimize Website' Section Usability",
      description:
        "Make the Optimize Website section clearer with stronger hierarchy and a more obvious next step for visitors…",
      stage: "Backlog",
      score: "4.7 / 5",
    },
  ],
  pages: 5,
  activePage: 0,
};

export const ACTIVE_TESTS = {
  count: 3,
  pages: 4,
  activePage: 0,
  items: [
    {
      id: "t1",
      name: "Show recording popup to returning visitors - only on insights pages",
      hypothesis: "No hypothesis added",
      rows: [
        { badge: "V1", conversions: 18, visitors: 187 },
        { badge: "C", conversions: 1, visitors: 196 },
      ],
    },
    {
      id: "t2",
      name: "test : Testing rule 1",
      hypothesis: "",
      rows: [
        { badge: "V1", conversions: 0, visitors: 0 },
        { badge: "D", conversions: 0, visitors: 0 },
      ],
    },
  ],
};

export const PERSONALIZATION = {
  count: 5,
  pages: 4,
  activePage: 0,
  name: "Landing-Page-Testing-Personalize_by_KW",
  moreExperiences: 4,
  donut: [8, 92],
  experiences: [
    {
      id: "E4",
      label: "Website Testing Software",
      visitors: 4,
      conversionRate: "31.38%",
      segment: "Utm_term = Website Te…",
    },
    {
      id: "E3",
      label: "Landing Page Testing Tool",
      visitors: 125,
      conversionRate: "22.69%",
      segment: "Utm_term = Landing Pa…",
    },
  ],
};

export const ROLLED_OUT = {
  pages: 7,
  activePage: 0,
  items: [
    { id: "r1", name: "Get started LP - B - Changed Heading" },
    { id: "r2", name: "Get started LP - Remove eBook section" },
    { id: "r3", name: "Mobile Hero Section Redesign (Cloned) - Variation 1" },
  ],
};

export const TOTAL_EXPERIENCES = 186;

export const HEATMAP_PAGES = [
  { id: "hm1", url: "https://vwo.com/" },
  { id: "hm2", url: "https://vwo.com/pricing/" },
  { id: "hm3", url: "https://vwo.com/tools/ab-test-significance-calculator/" },
  { id: "hm4", url: "https://vwo.com/free-trial/" },
];

export const SESSION_RECORDINGS = [
  {
    id: "sr1",
    location: "Lagos, Nigeria",
    countryCode: "NG",
    url: "https://www.google.com/",
    device: "Desktop",
    sessions: 1,
    duration: "00:00:22",
  },
  {
    id: "sr2",
    location: "England, United Ki…",
    countryCode: "GB",
    url: "https://www.google.com/",
    device: "Desktop",
    sessions: 1,
    duration: "00:01:03",
  },
  {
    id: "sr3",
    location: "Ahmedabad, India",
    countryCode: "IN",
    url: "https://wingify.com/",
    device: "Desktop",
    sessions: 1,
    duration: "00:01:25",
  },
];

export const FORMS_REPORT = {
  count: 25,
  ranges: ["Last 7 days", "All data"] as const,
  name: "Modal Free Trial Step 1 (8 October 2025)",
  submitsLabel: "95 Form Submits in Last 7 days",
  submitsHighlight: "95",
  pages: 5,
  activePage: 0,
  steps: [
    { label: "Landed", percent: 100, fill: "full" as const },
    { label: "Interacted", percent: 6.45, fill: "partial" as const },
    { label: "Submitted", percent: 1.76, fill: "partial" as const },
  ],
};

export const SURVEYS_REPORT = {
  count: 4,
  name: "Blog page survey",
  responsesLabel: "1 Responses till date",
  responsesHighlight: "1",
  questionId: "Q1",
  question: "Did this blog answer what you were looking for?",
  moreQuestions: 3,
  moreChoices: 1,
  pages: 5,
  activePage: 0,
  answers: [
    { n: 1, label: "Yes, it fully answered…", value: 55 },
    { n: 2, label: "Partly, but I need…", value: 30 },
    { n: 3, label: "No, it didn't cover…", value: 15 },
  ],
};
