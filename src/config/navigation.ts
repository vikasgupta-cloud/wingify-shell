import type { LucideIcon } from "lucide-react";
import { Home, Wand2, FlaskConical, Target, Flag, ShoppingCart, BarChart3, HeartPulse, Megaphone, Database, Activity, LifeBuoy, UserCircle } from "lucide-react";
export type NavLeaf = { label: string; path: string; hideCreate?: boolean };
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
      { label: "Holdouts", path: "/feature-management/holdouts" },
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
  { label: "Profile", path: "/profile", icon: UserCircle, group: 3, initials: "JD", flyoutOnly: true, sections: [
    { heading: "Account", items: [{ label: "Profile", path: "/profile/profile", hideCreate: true }]},
    { heading: "Connections", items: [
      { label: "Websites and Apps", path: "/profile/websites-and-apps", hideCreate: true },
      { label: "Integrations", path: "/profile/integrations", hideCreate: true },
    ]},
    { heading: "Resources", items: [
      { label: "Pages", path: "/profile/pages", hideCreate: true },
      { label: "Assets Hub", path: "/profile/assets-hub", hideCreate: true },
    ]},
    { heading: "Preferences", items: [{ label: "Settings", path: "/profile/settings", hideCreate: true }]},
  ]},
];

export const PINNABLE_PATHS = NAV.filter((i) => i.pinnable).map((i) => i.path);
