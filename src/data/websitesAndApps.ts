/** Dummy Websites and Apps rows + detail fields for Configuration → Connected. */

export type WebsiteAppType = "Website" | "Server-side Project" | "Mobile App";

export type WebsiteAppStatus = "error" | null;

export type SmartCodePlatform =
  | "HTML"
  | "Next.js"
  | "Wordpress"
  | "Drupal"
  | "Shopify"
  | "Wix"
  | "Prestashop"
  | "Joomla";

export type WebsiteAppRow = {
  id: string;
  name: string;
  domain: string | null;
  type: WebsiteAppType;
  status: WebsiteAppStatus;
  lastActivity: string | null;
  /** Shown under the name on the detail header. */
  category: string;
  /** One-letter mark for the detail avatar. */
  initial: string;
  smartCode: {
    detected: boolean;
    version: string;
    type: string;
    platform: SmartCodePlatform;
    url: string;
    checkedOn: string;
  } | null;
};

export const WNA_SITES_BASE = "/configuration/websites-and-apps/sites";

export function websiteDetailPath(id: string) {
  return `${WNA_SITES_BASE}/${id}`;
}

export function getWebsiteById(id: string): WebsiteAppRow | undefined {
  return WEBSITES_AND_APPS.find((row) => row.id === id);
}

export const SMART_CODE_PLATFORMS: SmartCodePlatform[] = [
  "HTML",
  "Next.js",
  "Wordpress",
  "Drupal",
  "Shopify",
  "Wix",
  "Prestashop",
  "Joomla",
];

export const WEBSITES_AND_APPS: WebsiteAppRow[] = [
  {
    id: "vwo",
    name: "Vwo",
    domain: "vwo.com",
    type: "Website",
    status: "error",
    lastActivity: null,
    category: "SaaS (Software as a Service)",
    initial: "V",
    smartCode: {
      detected: true,
      version: "3.0",
      type: "Async",
      platform: "Wordpress",
      url: "https://vwo.com/blog",
      checkedOn: "September 22, 2026 2:17 PM",
    },
  },
  {
    id: "wingify",
    name: "Wingify",
    domain: "wingify.com",
    type: "Website",
    status: "error",
    lastActivity: null,
    category: "SaaS (Software as a Service)",
    initial: "W",
    smartCode: {
      detected: true,
      version: "3.0",
      type: "Async",
      platform: "Wordpress",
      url: "https://wingify.com/blog",
      checkedOn: "September 22, 2026 2:17 PM",
    },
  },
  {
    id: "long-project",
    name: "This is a very long project name that should truncate",
    domain: null,
    type: "Server-side Project",
    status: null,
    lastActivity: null,
    category: "Server-side Project",
    initial: "T",
    smartCode: null,
  },
];
