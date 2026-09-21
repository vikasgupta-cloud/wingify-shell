/** Dummy Websites and Apps rows for the Configuration → Websites and Apps listing. */

export type WebsiteAppType = "Website" | "Server-side Project" | "Mobile App";

export type WebsiteAppStatus = "error" | null;

export type WebsiteAppRow = {
  id: string;
  name: string;
  domain: string | null;
  type: WebsiteAppType;
  status: WebsiteAppStatus;
  lastActivity: string | null;
};

export const WEBSITES_AND_APPS: WebsiteAppRow[] = [
  {
    id: "vwo",
    name: "Vwo",
    domain: "vwo.com",
    type: "Website",
    status: "error",
    lastActivity: null,
  },
  {
    id: "wingify",
    name: "Wingify",
    domain: "wingify.com",
    type: "Website",
    status: "error",
    lastActivity: null,
  },
  {
    id: "long-project",
    name: "This is a very long project name that should truncate",
    domain: null,
    type: "Server-side Project",
    status: null,
    lastActivity: null,
  },
];
