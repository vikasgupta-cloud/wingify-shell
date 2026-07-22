// Dummy funnel catalog for the Metrics picker's Funnels tab. Client-side only.

export type FunnelMatch = { operator: string; value: string };

export type FunnelStep = {
  name: string; // "Page visit", "eBook Step 1 Form submit", "Step 1"
  event: string; // dotted-underline kind: "Page Visit" | "Form Submission" | "Click"
  whereLabel: string; // "Page URL" | "Target URL" | "Selector Path"
  matches?: FunnelMatch[]; // rendered in an "Included pages" box
  inline?: FunnelMatch; // rendered directly after "where", e.g. Is equal to .js-download-ebook
  and?: { label: string; operator: string; value: string }; // extra "and where …" condition
};

export type Funnel = {
  id: string;
  code: string; // e.g. "F2494"
  name: string;
  steps: FunnelStep[];
};

export const FUNNELS: Funnel[] = [
  {
    id: "funnel-1",
    code: "F2494",
    name: "eBook Form Tracking in Blog/Guide",
    steps: [
      {
        name: "Page visit",
        event: "Page Visit",
        whereLabel: "Page URL",
        matches: [
          { operator: "URL matches", value: "https://vwo.com/blog/crap-design-principles/" },
          { operator: "URL matches", value: "https://vwo.com/blog/ab-testing-examples/" },
          { operator: "URL matches", value: "https://vwo.com/blog/heatmap-visualization/" },
          {
            operator: "URL matches",
            value: "https://vwo.com/blog/innovative-ideas-to-improve-customer-experience",
          },
          { operator: "URL matches", value: "https://vwo.com/blog/website-form-examples/" },
          {
            operator: "URL matches",
            value: "https://vwo.com/website-heatmap/google-sheets-heatmap/",
          },
          {
            operator: "URL matches",
            value: "https://vwo.com/website-heatmap/how-to-read-heatmap/",
          },
        ],
      },
      {
        name: "eBook Step 1 Form submit",
        event: "Form Submission",
        whereLabel: "Target URL",
        matches: [
          { operator: "URL matches", value: "https://vwo.com/wp-json/action/content-form-step1" },
        ],
      },
      {
        name: "eBook Step 2 Form submit",
        event: "Form Submission",
        whereLabel: "Target URL",
        matches: [
          { operator: "URL matches", value: "https://vwo.com/wp-json/action/content-form-step2" },
        ],
      },
      {
        name: "eBook Download CTA Click",
        event: "Click",
        whereLabel: "Selector Path",
        inline: { operator: "Is equal to", value: ".js-download-ebook" },
      },
    ],
  },
  {
    id: "funnel-2",
    code: "F2312",
    name: "demo test",
    steps: [
      {
        name: "Step 1",
        event: "Page Visit",
        whereLabel: "Page URL",
        matches: [{ operator: "URL matches", value: "https://chroma.com/" }],
      },
      {
        name: "Step 2",
        event: "Click",
        whereLabel: "Selector Path",
        inline: { operator: "Is equal to", value: ".js-cta-primary" },
      },
    ],
  },
  {
    id: "funnel-3",
    code: "F2280",
    name: "demo funnel-test",
    steps: [
      {
        name: "Landing",
        event: "Page Visit",
        whereLabel: "Page URL",
        matches: [{ operator: "URL starts with", value: "https://chroma.com/products" }],
      },
      {
        name: "Add to cart",
        event: "Click",
        whereLabel: "Selector Path",
        inline: { operator: "Is equal to", value: ".add-to-cart" },
      },
      {
        name: "Checkout",
        event: "Page Visit",
        whereLabel: "Page URL",
        matches: [{ operator: "URL matches", value: "https://chroma.com/checkout" }],
      },
    ],
  },
  {
    id: "funnel-4",
    code: "F2199",
    name: "univer Funnel",
    steps: [
      {
        name: "Step 1",
        event: "Page Visit",
        whereLabel: "Page URL",
        matches: [{ operator: "URL matches", value: "https://sobharealty.com/" }],
      },
      {
        name: "Step 2",
        event: "Page Visit",
        whereLabel: "Page URL",
        matches: [
          { operator: "URL starts with", value: "https://sobharealty.com/sobha-communities" },
        ],
      },
      {
        name: "Step 3",
        event: "Click",
        whereLabel: "Page URL",
        matches: [
          { operator: "URL starts with", value: "https://sobharealty.com/sobha-communities" },
        ],
        and: { label: "Text", operator: "Is equal to (case insens.)", value: "Submit" },
      },
    ],
  },
  {
    id: "funnel-5",
    code: "F2087",
    name: "eBook blog",
    steps: [
      {
        name: "Blog visit",
        event: "Page Visit",
        whereLabel: "Page URL",
        matches: [{ operator: "URL contains", value: "/blog/" }],
      },
      {
        name: "eBook Download CTA Click",
        event: "Click",
        whereLabel: "Selector Path",
        inline: { operator: "Is equal to", value: ".js-download-ebook" },
      },
    ],
  },
];

const BY_ID = new Map(FUNNELS.map((f) => [f.id, f]));

export function funnelById(id: string): Funnel | undefined {
  return BY_ID.get(id);
}
