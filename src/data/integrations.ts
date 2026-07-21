export interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
}

// The integration catalog. Grayscale-only surface — no brand logos are used;
// the UI renders a neutral monogram tile from each app's initials instead.
// Nothing is connected by default (see the config store's connectedIntegrations).
export const INTEGRATIONS: Integration[] = [
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
    category: "Customer Data Platform (CDP)",
    description: "Enrich visitor profiles with firmographic data.",
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

const BY_ID = new Map(INTEGRATIONS.map((i) => [i.id, i]));

export function integrationById(id: string): Integration | undefined {
  return BY_ID.get(id);
}

// The distinct categories present in the catalog, in first-seen order.
export const INTEGRATION_CATEGORIES: string[] = INTEGRATIONS.reduce<string[]>(
  (acc, i) => (acc.includes(i.category) ? acc : [...acc, i.category]),
  []
);

// A short monogram (1–2 letters) derived from the app name for the neutral tile.
export function monogram(name: string): string {
  const words = name.replace(/[()]/g, "").trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
