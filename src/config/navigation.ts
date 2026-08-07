import type { LucideIcon } from "lucide-react";
import {
  Home,
  Wand2,
  FlaskConical,
  Target,
  Flag,
  ShoppingCart,
  BarChart3,
  HeartPulse,
  Megaphone,
  Database,
  Activity,
  LifeBuoy,
  UserCircle,
  Settings,
  Layers,
  FileText,
  Contact,
  Building2,
  Circle,
  AppWindow,
  CirclePlus,
  Image,
  Images,
  Component,
  Palette,
  CodeXml,
  Blocks,
  LogOut,
} from "lucide-react";
export type NavLeaf = {
  label: string;
  path: string;
  hideCreate?: boolean;
  /** Optional glyph for drill-in section children (e.g. website rows). */
  icon?: LucideIcon;
  /** Muted action row (e.g. Add new) — still navigates to a stub page. */
  action?: boolean;
  /** Optional count pill on the right (e.g. Assets Hub). */
  count?: number;
};
export type NavSection = { heading?: string; items: NavLeaf[] };
export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  group: 1 | 2 | 3;
  pinnable?: boolean;
  /** Rendered as a circular avatar with these initials instead of the icon. */
  initials?: string;
  /** Tooltip only: no navigation on click, no sub-nav flyout on hover. */
  flyoutOnly?: boolean;
  hideCreate?: boolean;
  sections?: NavSection[];
};

/** Sidebar row inside a Profile-mode drill-in (Settings, Profile, …). */
export type DrillInNavItem = {
  label: string;
  path: string;
  /** Omit for text-only rows like Introduction / CSP. */
  icon?: LucideIcon;
  hideCreate?: boolean;
  /** Nested leaves; when present the row is an accordion (unless alwaysOpen). */
  items?: NavLeaf[];
  /** Static section heading + children — no chevron (Websites and Apps list). */
  alwaysOpen?: boolean;
  /** Optional count pill on the right (e.g. Assets Hub). */
  count?: number;
};

/** One Linear-style drill-in opened from the Profile flyout (or Settings gear). */
export type ProfileMode = {
  id: string;
  label: string;
  path: string;
  nav: DrillInNavItem[];
  /** When set, sidebar shows a filter field above the list (e.g. Pages). */
  searchPlaceholder?: string;
};

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Placeholder sidebar until real nav is provided per mode. */
function dummyNav(
  base: string,
  sections: { title: string; children?: string[] }[]
): DrillInNavItem[] {
  return sections.map(({ title, children }) => {
    const sectionPath = `${base}/${slugify(title)}`;
    if (!children?.length) {
      return {
        label: title,
        path: sectionPath,
        icon: Circle,
        hideCreate: true,
      };
    }
    return {
      label: title,
      path: sectionPath,
      icon: Circle,
      items: children.map((child) => ({
        label: child,
        path: `${sectionPath}/${slugify(child)}`,
        hideCreate: true,
      })),
    };
  });
}


export const NAV: NavItem[] = [
  { label: "Home", path: "/home", icon: Home, group: 1, sections: [
    { items: [
      { label: "Dashboard", path: "/home/dashboard", hideCreate: true },
      { label: "ROI Dashboard", path: "/home/roi-dashboard", hideCreate: true },
      { label: "Account Overview", path: "/home/account-overview", hideCreate: true },
    ]},
  ]},
  { label: "Wandz", path: "/wandz", icon: Wand2, group: 1, pinnable: true, sections: [
    { heading: "Assistant", items: [{ label: "Chat", path: "/wandz/chat" }]},
    { heading: "Automation", items: [
      { label: "Agents", path: "/wandz/agents" },
      { label: "Workflows", path: "/wandz/workflows" },
    ]},
    { heading: "Discover", items: [{ label: "What's New", path: "/wandz/whats-new" }]},
  ]},
  { label: "Web Experimentation", path: "/web-experiment", icon: FlaskConical, group: 2, pinnable: true },
  { label: "Personalize", path: "/personalize", icon: Target, group: 2, pinnable: true },
  { label: "Feature Management", path: "/feature-management", icon: Flag, group: 2, pinnable: true, sections: [
    { heading: "Create", items: [
      { label: "Feature Flags", path: "/feature-management/feature-flags" },
    ]},
    { heading: "Reports", items: [
      { label: "Flag Rollout", path: "/feature-management/flag-rollout", hideCreate: true },
      { label: "Flag Testing", path: "/feature-management/flag-testing", hideCreate: true },
      { label: "Flag Personalize", path: "/feature-management/flag-personalize", hideCreate: true },
      { label: "Flag Multivariate", path: "/feature-management/flag-multivariate", hideCreate: true },
    ]},
    { heading: "Maintain", items: [{ label: "Tech Debt", path: "/feature-management/tech-debt", hideCreate: true }]},
  ]},
  { label: "Commerce", path: "/commerce", icon: ShoppingCart, group: 2, pinnable: true, sections: [
    { heading: "Discover", items: [
      { label: "Search", path: "/commerce/search" },
      { label: "Recommendation", path: "/commerce/recommendation" },
    ]},
    { heading: "Optimize", items: [{ label: "Merchandising", path: "/commerce/merchandising" }]},
  ]},
  { label: "Insights", path: "/insights", icon: BarChart3, group: 2, pinnable: true, sections: [
    { heading: "Overview", items: [{ label: "Dashboard", path: "/insights/dashboard", hideCreate: true }]},
    { heading: "Reports", items: [
      { label: "Metric Reports", path: "/insights/metric-reports" },
      { label: "Funnel Reports", path: "/insights/funnel-reports" },
    ]},
    { heading: "Behavior", items: [
      { label: "Heatmaps", path: "/insights/heatmaps", hideCreate: true },
      { label: "Session Recordings", path: "/insights/session-recordings", hideCreate: true },
      { label: "Mobile Recordings", path: "/insights/mobile-recordings", hideCreate: true },
    ]},
    { heading: "Feedback", items: [{ label: "Forms", path: "/insights/forms" }]},
  ]},
  { label: "Pulse", path: "/pulse", icon: HeartPulse, group: 2, pinnable: true, sections: [
    { heading: "Research", items: [
      { label: "Surveys", path: "/pulse/surveys" },
      { label: "Concept Test", path: "/pulse/concept-test" },
    ]},
    { heading: "Resources", items: [{ label: "Templates", path: "/pulse/templates", hideCreate: true }]},
    { heading: "Administration", items: [{ label: "Settings", path: "/pulse/settings", hideCreate: true }]},
  ]},
  { label: "Engage", path: "/engage", icon: Megaphone, group: 2, pinnable: true },
  { label: "Data 360", path: "/data-360", icon: Database, group: 2, pinnable: true, sections: [
    { heading: "Customer Data", items: [
      { label: "Profiles", path: "/data-360/profiles" },
      { label: "Attributes", path: "/data-360/attributes" },
      { label: "Events", path: "/data-360/events" },
      { label: "Segments", path: "/data-360/segments" },
      { label: "Metrics", path: "/data-360/metrics" },
      { label: "Funnels", path: "/data-360/funnels" },
      { label: "Data Studio", path: "/data-360/data-studio" },
    ]},
    { heading: "Automation", items: [{ label: "Triggers", path: "/data-360/triggers" }]},
    { heading: "Administration", items: [{ label: "Audit", path: "/data-360/audit", hideCreate: true }]},
  ]},
  { label: "Activity", path: "/activity-timeline", icon: Activity, group: 3, flyoutOnly: true, hideCreate: true },
  { label: "Help", path: "/helpdesk", icon: LifeBuoy, group: 3, flyoutOnly: true, hideCreate: true },
  // Settings lives in the Profile flyout (no rail gear). Avatar expands options; does not navigate.
  { label: "John Doe", path: "/profile", icon: UserCircle, group: 3, initials: "JD", flyoutOnly: true, sections: [
    // Filled after PROFILE_MODES is declared — see profileFlyoutSections below.
    { items: [] },
  ]},
];

/**
 * Settings sidebar (real). Other Profile modes use dummyNav until you paste
 * their navigation one by one.
 */
export const SETTINGS_NAV: DrillInNavItem[] = [
  {
    label: "Accounts",
    path: "/settings/accounts",
    icon: Settings,
    items: [
      { label: "General", path: "/settings/accounts/general", hideCreate: true },
      { label: "Usage", path: "/settings/accounts/usage", hideCreate: true },
      { label: "Users", path: "/settings/accounts/users", hideCreate: true },
      { label: "Security", path: "/settings/accounts/security", hideCreate: true },
      { label: "Privacy Center", path: "/settings/accounts/privacy-center", hideCreate: true },
      { label: "Apps", path: "/settings/accounts/apps", hideCreate: true },
      { label: "Activity Timeline", path: "/settings/accounts/activity-timeline", hideCreate: true },
      { label: "Insights Settings", path: "/settings/accounts/insights-settings", hideCreate: true },
      { label: "Notification Preferences", path: "/settings/accounts/notification-preferences", hideCreate: true },
      { label: "Attributes List", path: "/settings/accounts/attributes-list", hideCreate: true },
      { label: "Users List", path: "/settings/accounts/users-list", hideCreate: true },
    ],
  },
  { label: "Campaigns", path: "/settings/campaigns", icon: Layers, hideCreate: true },
  {
    label: "Subscription & Invoices",
    path: "/settings/subscription",
    icon: FileText,
    items: [
      { label: "Plan", path: "/settings/subscription/plan", hideCreate: true },
      { label: "Invoices", path: "/settings/subscription/invoices", hideCreate: true },
      { label: "Billing details", path: "/settings/subscription/billing", hideCreate: true },
    ],
  },
  { label: "Profile details", path: "/settings/profile-details", icon: Contact, hideCreate: true },
  { label: "Workspaces", path: "/settings/workspaces", icon: Building2, hideCreate: true },
];

/**
 * Websites and Apps drill-in — real nav from product.
 * Site rows are stubs; Replace with live property data later.
 */
const WNA = "/websites-and-apps";
const wnaSite = (label: string): NavLeaf => ({
  label,
  path: `${WNA}/sites/${slugify(label)}`,
  hideCreate: true,
  icon: AppWindow,
});

export const WEBSITES_AND_APPS_NAV: DrillInNavItem[] = [
  { label: "Introduction", path: `${WNA}/introduction`, hideCreate: true },
  {
    label: "Websites and Apps",
    path: `${WNA}/sites`,
    alwaysOpen: true,
    items: [
      wnaSite("Jatinm Wingified"),
      wnaSite("Help Vwo"),
      wnaSite("Wingified"),
      wnaSite("Cro Vwo"),
      wnaSite("VWO"),
      wnaSite("Wingify"),
      wnaSite("Sahil1610 Github"),
      wnaSite("Ecommerce Tryvwo"),
      wnaSite("Jatinm Wingifie1d"),
      wnaSite("Lp Vwo"),
      wnaSite("Dash Partnerstack"),
      wnaSite("Tryvwo"),
      wnaSite("Developers Vwo"),
      wnaSite("Help Wingify"),
      {
        label: "Add new",
        path: `${WNA}/sites/add-new`,
        hideCreate: true,
        action: true,
        icon: CirclePlus,
      },
    ],
  },
  {
    label: "Content Security Policy (CSP)",
    path: `${WNA}/csp`,
    hideCreate: true,
  },
  { label: "Debugger", path: `${WNA}/debugger`, hideCreate: true },
];

/**
 * Pages library — flat searchable list. Labels truncated in UI; stubs for now.
 */
const PAGES = "/pages-library";
export const PAGES_NAV: DrillInNavItem[] = [
  "Summarize Button Test URL...",
  "Eco-friendly Blog Pages",
  "Product and soln pages wi...",
  "VWO Insights for Mobile A...",
  "Non-form content pages",
].map((label) => ({
  label,
  path: `${PAGES}/${slugify(label)}`,
  hideCreate: true,
}));

/**
 * Assets Hub — flat icon + count list.
 */
const ASSETS = "/assets-hub";
export const ASSETS_HUB_NAV: DrillInNavItem[] = [
  { label: "Images", path: `${ASSETS}/images`, icon: Image, count: 208, hideCreate: true },
  { label: "Widgets", path: `${ASSETS}/widgets`, icon: Component, count: 34, hideCreate: true },
  { label: "Themes", path: `${ASSETS}/themes`, icon: Palette, count: 12, hideCreate: true },
  {
    label: "Code Snippets",
    path: `${ASSETS}/code-snippets`,
    icon: CodeXml,
    count: 1,
    hideCreate: true,
  },
];

/** Drill-in shells reachable from the Profile (JD) flyout. */
export const PROFILE_MODES: ProfileMode[] = [
  { id: "settings", label: "Settings", path: "/settings", nav: SETTINGS_NAV },
  {
    id: "websites-and-apps",
    label: "Websites and Apps",
    path: "/websites-and-apps",
    nav: WEBSITES_AND_APPS_NAV,
  },
  {
    id: "integrations",
    label: "Integrations",
    path: "/integrations",
    nav: dummyNav("/integrations", [
      { title: "Connected", children: ["Active", "Needs attention"] },
      { title: "Browse", children: ["Analytics", "CRM", "Advertising"] },
      { title: "Developer" },
    ]),
  },
  {
    id: "pages",
    label: "Pages",
    path: "/pages-library",
    nav: PAGES_NAV,
    searchPlaceholder: "Search Pages",
  },
  {
    id: "assets-hub",
    label: "Assets Hub",
    path: "/assets-hub",
    nav: ASSETS_HUB_NAV,
  },
];

/** Signed-in user shown on the avatar row and in the profile menu header. */
export const CURRENT_USER = {
  name: "John Doe",
  email: "john.doe@wingify.com",
  initials: "JD",
};

/** Profile menu header target — rendered as the user card, not a list row. */
export const PROFILE_DETAILS_PATH = "/settings/profile-details";
export const LOGOUT_PATH = "/logout";

const MODE_ICONS: Record<string, LucideIcon> = {
  "websites-and-apps": AppWindow,
  integrations: Blocks,
  pages: FileText,
  "assets-hub": Images,
  settings: Settings,
};

const modeLeaf = (id: string): NavLeaf => {
  const mode = PROFILE_MODES.find((m) => m.id === id)!;
  return {
    label: mode.label,
    path: mode.path,
    hideCreate: true,
    icon: MODE_ICONS[id],
  };
};

// Profile is its own flyout entry but lands inside the Settings shell.
const profileFlyoutSections: NavSection[] = [
  {
    items: [
      { label: "Profile", path: PROFILE_DETAILS_PATH, hideCreate: true, icon: Contact },
    ],
  },
  { items: [modeLeaf("websites-and-apps"), modeLeaf("integrations")] },
  { items: [modeLeaf("pages"), modeLeaf("assets-hub")] },
  { items: [modeLeaf("settings")] },
  {
    items: [{ label: "Logout", path: LOGOUT_PATH, hideCreate: true, icon: LogOut }],
  },
];

const profileItem = NAV.find((i) => i.path === "/profile");
if (profileItem) {
  profileItem.label = CURRENT_USER.name;
  profileItem.initials = CURRENT_USER.initials;
  profileItem.sections = profileFlyoutSections;
}

export const PINNABLE_PATHS = NAV.filter((i) => i.pinnable).map((i) => i.path);

export function findProfileMode(pathname: string): ProfileMode | undefined {
  // Longest prefix wins so nested paths resolve correctly.
  return PROFILE_MODES.filter(
    (m) => pathname === m.path || pathname.startsWith(m.path + "/")
  ).sort((a, b) => b.path.length - a.path.length)[0];
}

export function firstModePath(mode: ProfileMode): string {
  const first = mode.nav[0];
  return first?.items?.[0]?.path ?? first?.path ?? mode.path;
}

export function modeLeaves(mode: ProfileMode): NavLeaf[] {
  return mode.nav.flatMap((item) =>
    item.items?.length
      ? item.items
      : [{ label: item.label, path: item.path, hideCreate: true }]
  );
}

/** @deprecated use firstModePath(findProfileMode(...)) — kept for Settings gear. */
export function firstSettingsPath(): string {
  return firstModePath(PROFILE_MODES[0]);
}
