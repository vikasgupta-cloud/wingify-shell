/*
 * Change summary: Configuration is now a group-3 rail item above Activity (reuses the existing
 * Settings2 icon and /configuration drill-in) and is removed from the profile flyout; the
 * drill-in mode switcher (jdSwitcherGroups) still lists it.
 */
import type { LucideIcon } from "@/components/icons/protoLucide";
import {
  Home,
  ShoppingCart,
  BarChart3,
  Activity,
  Headphones,
  UserCircle,
  Settings,
  Settings2,
  Layers,
  FileText,
  Contact,
  UserRound,
  Invoice,
  Receipt,
  CreditCard,
  SlidersHorizontal,
  Building2,
  Archive,
  // Circle, // reserved for dummyNav placeholder sidebars
  AppWindow,
  // CirclePlus, // @undo — Add new site row removed from WNA nav
  // Image, // @undo — Assets Hub leaf icons removed
  Images,
  // Component, // @undo — Assets Hub leaf icons removed
  // Palette, // @undo — Assets Hub leaf icons removed
  // CodeXml, // @undo — Assets Hub leaf icons removed
  Blocks,
  LogOut,
  Zap,
  BookOpen,
  Shirt,
  Crosshair,
  LayoutGrid,
  Award,
  Search,
  Puzzle,
  Eye,
  Lightbulb,
  Sparkles,
} from "@/components/icons/protoLucide";
import {
  ShellAnalyticsCustomFillIcon,
  ShellAnalyticsCustomIcon,
} from "@/components/icons/shell/AnalyticsCustomIcons";
import {
  ShellCalendarBlankFillIcon,
  ShellCalendarBlankIcon,
} from "@/components/icons/shell/CalendarBlankIcons";
import {
  ShellFlaskFillIcon,
  ShellFlaskIcon,
} from "@/components/icons/shell/FlaskIcons";
import {
  ShellHardDrivesFillIcon,
  ShellHardDrivesIcon,
} from "@/components/icons/shell/HardDrivesIcons";
import {
  ShellInsightsFillIcon,
  ShellInsightsIcon,
} from "@/components/icons/shell/InsightsIcons";
import {
  ShellMegaphoneFillIcon,
  ShellMegaphoneIcon,
} from "@/components/icons/shell/MegaphoneIcons";
import {
  ShellRocketLaunchFillIcon,
  ShellRocketLaunchIcon,
} from "@/components/icons/shell/RocketLaunchIcons";
import {
  ShellSparkleFillIcon,
  ShellSparkleIcon,
} from "@/components/icons/shell/SparkleIcons";
import {
  ShellUserFocusFillIcon,
  ShellUserFocusIcon,
} from "@/components/icons/shell/UserFocusIcons";
import {
  ShellUserSoundFillIcon,
  ShellUserSoundIcon,
} from "@/components/icons/shell/UserSoundIcons";
import { UPGRADE_ADDONS_PATH, UPGRADE_SECTIONS } from "./upgradeNav";

/** Page-orientation helpers shown after the last breadcrumb (replaces title-adjacent chrome). */
export type PageGuide = {
  /** Play-tutorial control. */
  tutorial?: { label?: string };
  /** Help submenu (docs / optional video). */
  help?: {
    title: string;
    body: string;
    href?: string;
    /** Optional tutorial video card inside the popover. */
    video?: { title: string; duration: string; poster: string };
  };
  /** About-this-page blurb under the menu divider. */
  info?: { body: string; href?: string };
};

export type NavLeaf = {
  label: string;
  path: string;
  hideCreate?: boolean;
  /** Optional glyph for drill-in section children (e.g. website rows). */
  icon?: LucideIcon;
  /** Nested accordion children in product sub-nav (e.g. Commerce Recommendations). */
  items?: NavLeaf[];
  /** Muted action row (e.g. Add new) — still navigates to a stub page. */
  action?: boolean;
  /** Optional count pill on the right (e.g. Assets Hub). */
  count?: number;
  /** Premium marker (e.g. Commerce Search crown). */
  badge?: "premium";
  /** Show external-link affordance; still routes in-app unless opened via the icon. */
  external?: boolean;
  pageGuide?: PageGuide;
};
export type NavSection = { heading?: string; items: NavLeaf[] };
export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  /** When set, used on the rail while this item is active (instead of library fill). */
  activeIcon?: LucideIcon;
  group: 1 | 2 | 3;
  pinnable?: boolean;
  /** Rendered as a circular avatar with these initials instead of the icon. */
  initials?: string;
  /** Tooltip only: no navigation on click, no sub-nav flyout on hover. */
  flyoutOnly?: boolean;
  hideCreate?: boolean;
  sections?: NavSection[];
  pageGuide?: PageGuide;
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
  /**
   * When true with `items`, the section root path itself is a landable page
   * (breadcrumb / sidebar land on `path` instead of the first child).
   */
  landRoot?: boolean;
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

/** Placeholder sidebar until real nav is provided per mode.
 *  @undo Kept for Profile mode stubs — re-enable when pasting real section trees.
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
*/


export const NAV: NavItem[] = [
  { label: "Home", path: "/home", icon: Home, group: 1, sections: [
    { items: [
      { label: "Dashboard", path: "/home/dashboard", hideCreate: true },
      { label: "Get Started", path: "/home/get-started", hideCreate: true },
      { label: "Campaigns Overview", path: "/home/roi-dashboard", hideCreate: true },
      { label: "Impact Dashboard", path: "/home/account-overview", hideCreate: true },
    ]},
  ]},
  {
    label: "Wingz",
    path: "/wingz",
    icon: ShellSparkleIcon as LucideIcon,
    activeIcon: ShellSparkleFillIcon as LucideIcon,
    group: 1,
    hideCreate: true,
    sections: [
    { heading: "Assistant", items: [{ label: "Chat", path: "/wingz/chat", hideCreate: true }]},
    { heading: "Automation", items: [
      { label: "Agents", path: "/wingz/agents" },
      { label: "Workflows", path: "/wingz/workflows" },
      { label: "Synthetic A/B", path: "/wingz/synthetic-ab" },
    ]},
    // @undo — What's New removed from Wingz leaf nav
    // { heading: "Discover", items: [{ label: "What's New", path: "/wingz/whats-new", hideCreate: true }]},
  ]},
  {
    label: "Experimentation",
    path: "/experimentation",
    icon: ShellFlaskIcon as LucideIcon,
    activeIcon: ShellFlaskFillIcon as LucideIcon,
    group: 2,
    pinnable: true,
    sections: [
    { items: [
      { label: "Web Experimentation", path: "/web-experiment" },
      { label: "Web Rollout", path: "/web-rollouts", hideCreate: true },
      { label: "Mobile App A/B", path: "/mobile-app-ab", hideCreate: true },
    ]},
  ]},
  {
    label: "Web experimentation (Old)",
    path: "/web-experiment-old",
    icon: ShellFlaskIcon as LucideIcon,
    activeIcon: ShellFlaskFillIcon as LucideIcon,
    group: 2,
  },
  {
    label: "Web Personalization",
    path: "/personalize",
    icon: ShellUserFocusIcon as LucideIcon,
    activeIcon: ShellUserFocusFillIcon as LucideIcon,
    group: 2,
    pinnable: true,
  },
  {
    label: "Feature Management",
    path: "/feature-management",
    icon: ShellRocketLaunchIcon as LucideIcon,
    activeIcon: ShellRocketLaunchFillIcon as LucideIcon,
    group: 2,
    pinnable: true,
    sections: [
    { items: [
      { label: "Feature Flags", path: "/feature-management/feature-flags" },
    ]},
    { items: [
      { label: "Feature Rollout", path: "/feature-management/flag-rollout" },
      { label: "Feature Experimentation", path: "/feature-management/flag-testing" },
      { label: "Feature Multivariate", path: "/feature-management/flag-multivariate" },
      { label: "Feature Personalization", path: "/feature-management/flag-personalize" },
    ]},
    { items: [
      { label: "Holdouts", path: "/feature-management/holdout", hideCreate: true },
      { label: "Tech Debt", path: "/feature-management/tech-debt", hideCreate: true },
    ]},
  ]},
  { label: "Commerce", path: "/commerce", icon: ShoppingCart, group: 2, pinnable: true, sections: [
    { items: [
      { label: "Catalog", path: "/commerce/catalog", icon: BookOpen, hideCreate: true },
    ]},
    { items: [
      {
        label: "Recommendations",
        path: "/commerce/recommendations",
        icon: Shirt,
        items: [
          { label: "Strategies", path: "/commerce/recommendation", icon: Crosshair, hideCreate: true },
          { label: "Locations", path: "/commerce/recommendation/locations", icon: LayoutGrid, hideCreate: true },
          { label: "Reporting", path: "/commerce/recommendation/reporting", icon: BarChart3, hideCreate: true },
        ],
      },
      {
        label: "Merchandising",
        path: "/commerce/merchandising",
        icon: Award,
        items: [
          { label: "Strategies", path: "/commerce/merchandising/strategies", icon: Crosshair, hideCreate: true },
          { label: "Reporting", path: "/commerce/merchandising/reporting", icon: BarChart3, hideCreate: true },
        ],
      },
      { label: "Search", path: "/commerce/search", icon: Search, badge: "premium" },
    ]},
    { items: [
      {
        label: "Visuals",
        path: "/commerce/visuals",
        icon: Puzzle,
        hideCreate: true,
        items: [
          {
            label: "Product widgets",
            path: "/commerce/visuals/product-widgets",
            icon: Puzzle,
            hideCreate: true,
            external: true,
          },
          {
            label: "Templates",
            path: "/commerce/visuals/templates",
            icon: LayoutGrid,
            hideCreate: true,
          },
        ],
      },
    ]},
    { items: [
      { label: "Usage dashboard", path: "/commerce/usage-dashboard", icon: BarChart3, hideCreate: true },
      { label: "Health monitor", path: "/commerce/health-monitor", icon: Activity, hideCreate: true },
      { label: "Settings", path: "/commerce/settings", icon: Settings, hideCreate: true },
    ]},
  ]},
  {
    label: "Journey Analytics",
    path: "/analytics",
    icon: ShellAnalyticsCustomIcon as LucideIcon,
    activeIcon: ShellAnalyticsCustomFillIcon as LucideIcon,
    group: 2,
    pinnable: true,
    sections: [
      {
        items: [
          {
            label: "Overview",
            path: "/analytics/overview",
            icon: LayoutGrid,
          },
          {
            label: "Browse",
            path: "/analytics/browse",
            icon: Search,
          },
        ],
      },
    ],
  },
  {
    label: "Behavior Analytics",
    path: "/insights",
    icon: ShellInsightsIcon as LucideIcon,
    activeIcon: ShellInsightsFillIcon as LucideIcon,
    group: 2,
    pinnable: true,
    sections: [
    { items: [{ label: "Dashboard", path: "/insights/dashboard", hideCreate: true }]},
    { items: [
      { label: "Heatmaps", path: "/insights/heatmaps", hideCreate: true },
      {
        label: "Session Recordings",
        path: "/insights/session-recordings",
        hideCreate: true,
        pageGuide: {
          tutorial: { label: "Play tutorial" },
          help: {
            title: "Insight | Recordings",
            body: "View the recordings of your visitors' interactions on your webpage, such as scrolls, clicks, and mouse movements.",
            href: "#",
            video: {
              title: "Session Recordings | Dashboard",
              duration: "4 mins",
              poster: "/editor-preview/images/hero.jpg",
            },
          },
          info: {
            body: "Record and playback visitor sessions on your website.",
            href: "#",
          },
        },
      },
      { label: "Mobile Recordings", path: "/insights/mobile-recordings", hideCreate: true },
      { label: "Form Analytics", path: "/insights/forms" },
    ]},
    { heading: "Reports", items: [
      { label: "Metric Reports", path: "/insights/metric-reports" },
      { label: "Funnel Reports", path: "/insights/funnel-reports" },
    ]},
  ]},
  {
    label: "User Feedback",
    path: "/pulse",
    icon: ShellUserSoundIcon as LucideIcon,
    activeIcon: ShellUserSoundFillIcon as LucideIcon,
    group: 2,
    pinnable: true,
    sections: [
    { items: [
      { label: "Surveys", path: "/pulse/surveys" },
      { label: "Concept Test", path: "/pulse/concept-test" },
    ]},
    { items: [{ label: "Templates", path: "/pulse/templates", hideCreate: true }]},
    { items: [{ label: "Settings", path: "/pulse/settings", hideCreate: true }]},
  ]},
  {
    label: "Push notification",
    path: "/engage",
    icon: ShellMegaphoneIcon as LucideIcon,
    activeIcon: ShellMegaphoneFillIcon as LucideIcon,
    group: 2,
    pinnable: true,
  },

  {
    label: "Data Platform",
    path: "/data-360",
    icon: ShellHardDrivesIcon as LucideIcon,
    activeIcon: ShellHardDrivesFillIcon as LucideIcon,
    group: 2,
    pinnable: true,
    sections: [
    { items: [
      { label: "Introduction", path: "/data-360/introduction", hideCreate: true },
      { label: "Profiles", path: "/data-360/profiles" },
      { label: "Attributes", path: "/data-360/attributes" },
      { label: "Events", path: "/data-360/events" },
      { label: "Segments", path: "/data-360/segments" },
    ]},
    { items: [
      { label: "Triggers", path: "/data-360/triggers" },
      { label: "Audiences", path: "/data-360/audiences" },
      { label: "Metrics", path: "/data-360/metrics" },
      { label: "Funnels", path: "/data-360/funnels" },
    ]},
    { items: [
      { label: "Audit", path: "/data-360/audit", hideCreate: true },
    ]},
  ]},
  {
    label: "Plan",
    path: "/plan",
    icon: ShellCalendarBlankIcon as LucideIcon,
    activeIcon: ShellCalendarBlankFillIcon as LucideIcon,
    group: 2,
    pinnable: true,
    sections: [
      {
        items: [
          { label: "Observations", path: "/plan/observations", icon: Eye },
          { label: "Hypotheses", path: "/plan/hypotheses", icon: Lightbulb },
          { label: "Ideas", path: "/plan/ideas", icon: Sparkles },
        ],
      },
    ],
  },
  // Direct item; "/configuration" index redirects to the first Configuration leaf.
  { label: "Configuration", path: "/configuration", icon: Settings2, group: 3, hideCreate: true },
  { label: "Activity", path: "/activity-timeline", icon: Activity, group: 3, flyoutOnly: true, hideCreate: true },
  { label: "Need Help?", path: "/helpdesk", icon: Headphones, group: 3, flyoutOnly: true, hideCreate: true },
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
      // { label: "Usage", path: "/settings/accounts/usage", hideCreate: true }, // @undo
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
    icon: Invoice,
    items: [
      {
        label: "My Subscription",
        path: "/settings/subscription/my-subscription",
        hideCreate: true,
        icon: LayoutGrid,
      },
      {
        label: "Web Experimentation & Rollout",
        path: "/settings/subscription/web-experimentation-rollout",
        hideCreate: true,
      },
      {
        label: "Feature Management",
        path: "/settings/subscription/feature-management",
        hideCreate: true,
      },
      {
        label: "Behavior Analytics",
        path: "/settings/subscription/behavior-analytics",
        hideCreate: true,
      },
      {
        label: "Web Personalization",
        path: "/settings/subscription/web-personalization",
        hideCreate: true,
      },
      {
        label: "User Feedback",
        path: "/settings/subscription/user-feedback",
        hideCreate: true,
      },
      {
        label: "Wingz",
        path: "/settings/subscription/wingz",
        hideCreate: true,
      },
      {
        label: "Journey Analytics",
        path: "/settings/subscription/journey-analytics",
        hideCreate: true,
      },
      {
        label: "Invoice History",
        path: "/settings/subscription/invoice-history",
        hideCreate: true,
        icon: Receipt,
      },
      {
        label: "Visitor Allocation",
        path: "/settings/subscription/visitor-allocation",
        hideCreate: true,
        icon: SlidersHorizontal,
      },
      {
        label: "Billing Profile",
        path: "/settings/subscription/billing-profile",
        hideCreate: true,
        icon: CreditCard,
      },
      {
        label: "Inactive Subscriptions",
        path: "/settings/subscription/inactive",
        hideCreate: true,
        icon: Archive,
        items: [
          {
            label: "Wingify Testing – Mobile App",
            path: "/settings/subscription/inactive/wingify-testing-mobile-app",
            hideCreate: true,
          },
          {
            label: "Wingify Testing – Server Side",
            path: "/settings/subscription/inactive/wingify-testing-server-side",
            hideCreate: true,
          },
        ],
      },
    ],
  },
  { label: "Profile details", path: "/settings/profile-details", icon: UserRound, hideCreate: true },
  { label: "Workspaces", path: "/settings/workspaces", icon: Building2, hideCreate: true },
];

/**
 * Configuration drill-in — clubs Websites and Apps, Integrations, Pages, Assets Hub.
 * WNA + Assets Hub are accordions; Integrations and Pages are leaf rows like Settings.
 */
const CONFIG = "/configuration";
const WNA = `${CONFIG}/websites-and-apps`;
const ASSETS = `${CONFIG}/assets-hub`;

export const CONFIGURATION_NAV: DrillInNavItem[] = [
  {
    label: "Websites and Apps",
    path: WNA,
    icon: AppWindow,
    items: [
      { label: "Introduction", path: `${WNA}/introduction`, hideCreate: true },
      { label: "Connected", path: `${WNA}/sites`, hideCreate: true },
      { label: "CSP", path: `${WNA}/csp`, hideCreate: true },
      { label: "Debugger", path: `${WNA}/debugger`, hideCreate: true },
      { label: "Privacy", path: `${WNA}/privacy`, hideCreate: true },
      { label: "Compliance", path: `${WNA}/compliance`, hideCreate: true },
      { label: "FAQs", path: `${WNA}/faqs`, hideCreate: true },
    ],
  },
  {
    label: "Integrations",
    path: `${CONFIG}/integrations`,
    icon: Blocks,
    hideCreate: true,
  },
  {
    label: "Pages",
    path: `${CONFIG}/pages`,
    icon: FileText,
    hideCreate: true,
  },
  {
    label: "Assets Hub",
    path: ASSETS,
    icon: Images,
    items: [
      // @undo — leaf icons removed (Image / Component / Palette / CodeXml)
      { label: "Images", path: `${ASSETS}/images`, count: 167, hideCreate: true },
      { label: "Widgets", path: `${ASSETS}/widgets`, count: 25, hideCreate: true },
      { label: "Themes", path: `${ASSETS}/themes`, count: 10, hideCreate: true },
      {
        label: "Code Snippets",
        path: `${ASSETS}/code-snippets`,
        count: 0,
        hideCreate: true,
      },
    ],
  },
];

// @undo — flat WNA-only rail before Configuration club
// export const WEBSITES_AND_APPS_NAV: DrillInNavItem[] = [ ... ]

/**
 * Pages library — flat searchable list. Labels truncated in UI; stubs for now.
 * @undo Was its own Profile mode rail; Pages is now a Configuration leaf.
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
 * Assets Hub leaves — kept for reference; live copy lives under CONFIGURATION_NAV.
 * @undo Standalone Assets Hub Profile mode rail.
 */
export const ASSETS_HUB_NAV: DrillInNavItem[] = [
  { label: "Images", path: `${ASSETS}/images`, count: 167, hideCreate: true },
  { label: "Widgets", path: `${ASSETS}/widgets`, count: 25, hideCreate: true },
  { label: "Themes", path: `${ASSETS}/themes`, count: 10, hideCreate: true },
  {
    label: "Code Snippets",
    path: `${ASSETS}/code-snippets`,
    count: 0,
    hideCreate: true,
  },
];

/** Upgrade catalog — section headings + product leaves (rich UI in UpgradeNav). */
export const UPGRADE_NAV: DrillInNavItem[] = [
  ...UPGRADE_SECTIONS.map((section) => ({
    label: section.heading,
    path: section.items[0]?.path ?? "/upgrade",
    alwaysOpen: true as const,
    items: section.items.map((item) => ({
      label: item.label,
      path: item.path,
      icon: item.icon,
      hideCreate: true as const,
    })),
  })),
  {
    label: "Explore add-ons",
    path: UPGRADE_ADDONS_PATH,
    hideCreate: true,
  },
];

/** Drill-in shells reachable from the Profile (JD) flyout. */
export const PROFILE_MODES: ProfileMode[] = [
  { id: "settings", label: "Settings", path: "/settings", nav: SETTINGS_NAV },
  {
    id: "configuration",
    label: "Configuration",
    path: CONFIG,
    nav: CONFIGURATION_NAV,
  },
  { id: "upgrade", label: "Upgrade", path: "/upgrade", nav: UPGRADE_NAV },
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
  configuration: Settings2,
  settings: Settings,
  upgrade: Zap,
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
// Sections map 1:1 to flyout divider groups (user card is rendered separately).
const profileFlyoutSections: NavSection[] = [
  {
    items: [
      { label: "Profile", path: PROFILE_DETAILS_PATH, hideCreate: true, icon: Contact },
    ],
  },
  // Destinations — Settings / Upgrade (Configuration moved to the rail above Activity)
  {
    items: [
      // modeLeaf("configuration"), // @undo
      modeLeaf("settings"),
      modeLeaf("upgrade"),
    ],
  },
  // Session
  {
    items: [
      { label: "Logout", path: LOGOUT_PATH, hideCreate: true, icon: LogOut },
    ],
  },
];

const profileItem = NAV.find((i) => i.path === "/profile");
if (profileItem) {
  profileItem.label = CURRENT_USER.name;
  profileItem.initials = CURRENT_USER.initials;
  profileItem.sections = profileFlyoutSections;
}

/** JD flyout destinations for the drill-in mode breadcrumb (excludes Logout). */
export type JdSwitcherItem = {
  id: string;
  label: string;
  path: string;
  icon?: LucideIcon;
};

/** Same order/grouping as the Profile flyout, minus Logout and Profile (user card only). */
export function jdSwitcherGroups(): JdSwitcherItem[][] {
  // Configuration left the profile menu for the rail, but the drill-in switcher still lists it.
  const switcherSections = profileFlyoutSections.map((section) =>
    section.items.some((i) => i.path === "/settings")
      ? { ...section, items: [modeLeaf("configuration"), ...section.items] }
      : section
  );
  return switcherSections
    .map((section) =>
      section.items
        .filter(
          (item) =>
            item.path !== LOGOUT_PATH && item.path !== PROFILE_DETAILS_PATH
        )
        .map((item) => {
          const mode = PROFILE_MODES.find((m) => m.path === item.path);
          return {
            id: item.path,
            label: item.label,
            path: mode ? firstModePath(mode) : item.path,
            icon: item.icon,
          };
        })
    )
    .filter((group) => group.length > 0);
}

/** Flat list of JD switcher destinations. */
export function jdSwitcherItems(): JdSwitcherItem[] {
  return jdSwitcherGroups().flat();
}

/** Active JD switcher item for the current path (Profile wins over Settings). */
export function resolveJdSwitcherItem(pathname: string): JdSwitcherItem | undefined {
  const items = jdSwitcherItems();
  if (
    pathname === PROFILE_DETAILS_PATH ||
    pathname.startsWith(`${PROFILE_DETAILS_PATH}/`)
  ) {
    return items.find((item) => item.id === PROFILE_DETAILS_PATH);
  }
  const mode = findProfileMode(pathname);
  if (!mode) return undefined;
  return items.find((item) => item.id === mode.path);
}

export const PINNABLE_PATHS = NAV.filter((i) => i.pinnable).map((i) => i.path);

/**
 * Destinations in the TopBar product crumb switcher (Home + Wingz + group-2 products).
 * Order is intentional — matches the product switcher list, not rail grouping.
 */
export const PRODUCT_SWITCHER_PATHS = [
  "/home",
  "/wingz",
  "/experimentation",
  "/personalize",
  "/feature-management",
  "/commerce",
  "/analytics",
  "/insights",
  "/pulse",
  "/engage",
  "/data-360",
  "/plan",
] as const;

export function productSwitcherItems(): NavItem[] {
  return PRODUCT_SWITCHER_PATHS.map(
    (path) => NAV.find((item) => item.path === path)
  ).filter((item): item is NavItem => item !== undefined);
}

/** Theme-QA campaign flow — hidden from the rail; open via design controller. */
export const WEB_EXPERIMENT_OLD_PATH = "/web-experiment-old";

/** NAV without prototype-only items (e.g. Web experimentation Old). */
export function visibleNav(): NavItem[] {
  return NAV.filter((item) => item.path !== WEB_EXPERIMENT_OLD_PATH);
}

/** End leaves only (skip accordion parents that have children). */
export function flattenNavLeaves(sections: NavSection[]): NavLeaf[] {
  const out: NavLeaf[] = [];
  const walk = (leaves: NavLeaf[]) => {
    for (const leaf of leaves) {
      if (leaf.items?.length) walk(leaf.items);
      else out.push(leaf);
    }
  };
  for (const section of sections) walk(section.items);
  return out;
}

/** Stable hash so each path keeps the same tutorial/help/about mix. */
function pageGuideVariant(path: string): number {
  let h = 2166136261;
  for (let i = 0; i < path.length; i++) {
    h ^= path.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 7;
}

/** Dummy page-guide copy; which slots appear varies by path (0–6). */
function pageGuideFor(label: string, path: string): PageGuide {
  const v = pageGuideVariant(path);
  const guide: PageGuide = {};
  // 0 all · 1 tutorial+help · 2 tutorial+about · 3 help+about · 4 tutorial · 5 help · 6 about
  if (v === 0 || v === 1 || v === 2 || v === 4) {
    guide.tutorial = { label: "Play tutorial" };
  }
  if (v === 0 || v === 1 || v === 3 || v === 5) {
    guide.help = {
      title: label,
      body: `Get help with ${label}: setup tips, common workflows, and troubleshooting.`,
      href: "#",
      ...(v === 0 || v === 3
        ? {
            video: {
              title: `${label} overview`,
              duration: "3 mins",
              poster: "/editor-preview/images/hero.jpg",
            },
          }
        : {}),
    };
  }
  if (v === 0 || v === 2 || v === 3 || v === 6) {
    guide.info = {
      body: `${label} helps you run and measure experiences for your visitors.`,
      href: "#",
    };
  }
  return guide;
}

/** Attach randomized page guides to every product switcher end page (skip hand-authored). */
function attachMainFeaturePageGuides() {
  const productPaths = new Set<string>(PRODUCT_SWITCHER_PATHS);
  for (const item of NAV) {
    if (!productPaths.has(item.path)) continue;
    if (!item.sections?.length) {
      if (!item.pageGuide) item.pageGuide = pageGuideFor(item.label, item.path);
      continue;
    }
    for (const leaf of flattenNavLeaves(item.sections)) {
      if (!leaf.pageGuide) leaf.pageGuide = pageGuideFor(leaf.label, leaf.path);
    }
  }
}
attachMainFeaturePageGuides();

/** Land path for a leaf: first nested child when present, else own path. */
export function leafLandPath(leaf: NavLeaf): string {
  if (leaf.items?.length) return leafLandPath(leaf.items[0]);
  return leaf.path;
}

export function findProfileMode(pathname: string): ProfileMode | undefined {
  // Longest prefix wins so nested paths resolve correctly.
  return PROFILE_MODES.filter(
    (m) => pathname === m.path || pathname.startsWith(m.path + "/")
  ).sort((a, b) => b.path.length - a.path.length)[0];
}

/**
 * Where to land when jumping to a drill-in section from the breadcrumb / sidebar.
 * Root page when the section has no children or `landRoot`; otherwise first child.
 */
export function sectionLandPath(item: DrillInNavItem): string {
  if (!item.items?.length || item.landRoot) return item.path;
  return item.items[0].path;
}

export function firstModePath(mode: ProfileMode): string {
  const first = mode.nav[0];
  return first ? sectionLandPath(first) : mode.path;
}

function terminalLeaves(leaves: NavLeaf[]): NavLeaf[] {
  return leaves.flatMap((leaf) =>
    leaf.items?.length ? terminalLeaves(leaf.items) : [leaf]
  );
}

export function modeLeaves(mode: ProfileMode): NavLeaf[] {
  return mode.nav.flatMap((item) => {
    if (!item.items?.length) {
      return [{ label: item.label, path: item.path, hideCreate: item.hideCreate }];
    }
    const leaves = [...item.items];
    if (item.landRoot) {
      leaves.unshift({
        label: item.label,
        path: item.path,
        hideCreate: item.hideCreate ?? true,
      });
    }
    return terminalLeaves(leaves);
  });
}

/** Active top-level drill-in section for a pathname (longest matching path). */
export function findDrillInSection(
  pathname: string,
  mode: ProfileMode
): DrillInNavItem | undefined {
  return mode.nav
    .filter((s) => pathname === s.path || pathname.startsWith(s.path + "/"))
    .sort((a, b) => b.path.length - a.path.length)[0];
}

/** Active leaf under a section, when the section has nested items. */
export function findDrillInLeaf(
  pathname: string,
  section: DrillInNavItem
): NavLeaf | undefined {
  if (!section.items?.length) return undefined;
  const match = (leaves: NavLeaf[]): NavLeaf | undefined => {
    for (const leaf of leaves) {
      const nested = leaf.items?.length ? match(leaf.items) : undefined;
      if (nested) return nested;
      if (
        !leaf.items?.length &&
        (pathname === leaf.path || pathname.startsWith(leaf.path + "/"))
      ) {
        return leaf;
      }
    }
    return undefined;
  };
  return match(section.items);
}

/** @deprecated use firstModePath(findProfileMode(...)) — kept for Settings gear. */
export function firstSettingsPath(): string {
  return firstModePath(PROFILE_MODES[0]);
}
