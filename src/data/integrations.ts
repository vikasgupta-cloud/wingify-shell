export interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  /** When connected, shown as "N connections" instead of the category chip. */
  connectionCount?: number;
  /** Optional connection-type labels used by the filter bar. */
  connectionTypes?: string[];
}

// The integration catalog. Grayscale-only surface — no brand logos are used;
// the UI renders a neutral monogram tile from each app's initials instead.
export const INTEGRATIONS: Integration[] = [
  // Targeting / ABM
  {
    id: "6sense",
    name: "6sense",
    category: "Targeting",
    description:
      "Prioritize high-intent accounts and sync ABM audiences into your experiments.",
    connectionTypes: ["ABM - Intent", "ABM - Impression"],
  },
  // Analytics
  {
    id: "ga4",
    name: "Google Analytics 4",
    category: "Analytics",
    description: "Send experiment data to your GA4 property for deeper analysis.",
  },
  {
    id: "gtm",
    name: "Google Tag Manager",
    category: "Analytics",
    description: "Deploy and manage tracking tags without editing site code.",
  },
  {
    id: "mixpanel",
    name: "Mixpanel",
    category: "Analytics",
    description: "Track product events and funnels alongside your experiments.",
  },
  {
    id: "amplitude",
    name: "Amplitude",
    category: "Analytics",
    description: "Analyze user behavior and cohorts from your campaigns.",
  },
  {
    id: "clarity",
    name: "Microsoft Clarity",
    category: "Analytics",
    description: "Capture heatmaps and session recordings for your variations.",
  },
  {
    id: "heap",
    name: "Heap",
    category: "Analytics",
    description: "Autocapture every interaction for retroactive analysis.",
  },
  {
    id: "adobe-analytics",
    name: "Adobe Analytics",
    category: "Analytics",
    description: "Push experiment segments into Adobe Analytics reports.",
  },
  // Customer Data Platform (CDP)
  {
    id: "segment",
    name: "Segment",
    category: "Customer Data Platform (CDP)",
    description: "Route campaign events to every tool in your stack.",
  },
  {
    id: "mparticle",
    name: "mParticle",
    category: "Customer Data Platform (CDP)",
    description: "Unify customer data and forward it to downstream tools.",
  },
  {
    id: "tealium",
    name: "Tealium",
    category: "Customer Data Platform (CDP)",
    description: "Orchestrate tags and customer data across channels.",
  },
  {
    id: "zoominfo",
    name: "ZoomInfo",
    category: "Targeting",
    description: "Enrich visitor profiles with firmographic data.",
    connectionTypes: ["ABM - Intent"],
  },
  // Data Warehouse
  {
    id: "snowflake",
    name: "Snowflake",
    category: "Data Warehouse",
    description: "Stream raw experiment data into your Snowflake warehouse.",
  },
  {
    id: "bigquery",
    name: "Google BigQuery",
    category: "Data Warehouse",
    description: "Export campaign results to BigQuery for custom queries.",
  },
  // CRM
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM",
    description: "Tie experiment exposure to leads and opportunities.",
    connectionCount: 2,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    description: "Sync experiment audiences with your HubSpot contacts.",
  },
  // Customer Engagement
  {
    id: "marketo",
    name: "Marketo",
    category: "Customer Engagement",
    description: "Trigger nurture campaigns from experiment segments.",
    connectionCount: 2,
  },
  {
    id: "braze",
    name: "Braze",
    category: "Customer Engagement",
    description: "Personalize messaging based on variation exposure.",
  },
  // CMS
  {
    id: "contentful",
    name: "Contentful",
    category: "CMS",
    description: "Test content variations sourced from Contentful.",
  },
  {
    id: "wordpress",
    name: "WordPress",
    category: "CMS",
    description: "Run experiments on your WordPress pages and posts.",
  },
  // E-commerce
  {
    id: "shopify",
    name: "Shopify",
    category: "E-commerce",
    description: "Experiment on storefronts and track revenue outcomes.",
  },
  {
    id: "magento",
    name: "Magento",
    category: "E-commerce",
    description: "Optimize product and checkout flows on Magento.",
  },
  // Call tracking
  {
    id: "calltrackingmetrics",
    name: "CallTrackingMetrics",
    category: "Call tracking",
    description: "Attribute inbound calls to your running experiments.",
  },
  // Project Management
  {
    id: "jira",
    name: "Jira",
    category: "Project Management",
    description: "Create and link experiment tickets in your Jira board.",
  },
  // Productivity
  {
    id: "notion",
    name: "Notion",
    category: "Productivity",
    description: "Document experiment plans and results in Notion.",
  },
];

/** Apps shown as connected on first load (session store seeds from this). */
export const DEFAULT_CONNECTED_INTEGRATION_IDS = [
  "6sense",
  "marketo",
  "salesforce",
  "zoominfo",
] as const;

/** Suggested starters when the campaign has no integrations yet. */
export const RECOMMENDED_INTEGRATION_IDS = [
  "ga4",
  "segment",
  "salesforce",
  "mixpanel",
  "hubspot",
  "6sense",
] as const;

const BY_ID = new Map(INTEGRATIONS.map((i) => [i.id, i]));

export function integrationById(id: string): Integration | undefined {
  return BY_ID.get(id);
}

export const INTEGRATION_CATEGORIES: string[] = INTEGRATIONS.reduce<string[]>(
  (acc, i) => (acc.includes(i.category) ? acc : [...acc, i.category]),
  []
);

export const INTEGRATION_CONNECTION_TYPES: string[] = INTEGRATIONS.reduce<
  string[]
>((acc, i) => {
  for (const t of i.connectionTypes ?? []) {
    if (!acc.includes(t)) acc.push(t);
  }
  return acc;
}, []);

export function monogram(name: string): string {
  const words = name.replace(/[()]/g, "").trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
