/** Home → Get Started — nav tree, task lists, and detail cards (product screenshots). */

export type GetStartedTaskStatus = "completed" | "pending" | "active";

export type GetStartedTask = {
  id: string;
  label: string;
  status: GetStartedTaskStatus;
  duration?: string;
  restricted?: boolean;
};

export type GetStartedDetailAction = {
  label: string;
  variant: "default" | "outline";
  external?: boolean;
};

export type GetStartedDetail = {
  taskTitle: string;
  description: string;
  linkLabel?: string;
  videoTitle: string;
  videoDuration: string;
  durationLabel?: string;
  cardDuration?: string;
  completed?: boolean;
  headerIcon: "check" | "target" | "grid" | "flask";
  actions: GetStartedDetailAction[];
};

export type GetStartedNavLeaf = {
  id: string;
  label: string;
  groupId: string;
  completed?: boolean;
  detail?: GetStartedDetail;
};

export type GetStartedNavGroup = {
  id: string;
  label: string;
  icon: "grid" | "layers" | "shield";
  items: GetStartedNavLeaf[];
};

export type GetStartedTopLink = {
  id: string;
  label: string;
  icon: "zap" | "plug";
  view: "task-list" | "detail";
  durationLabel?: string;
  tasks?: GetStartedTask[];
  detail?: GetStartedDetail;
  groupId: string;
};

export const GET_STARTED_PROGRESS = 59;

export const BASIC_SETUP_TASKS: GetStartedTask[] = [
  { id: "review-data-center", label: "Review Data Center", status: "completed" },
  { id: "review-products", label: "Review Products", status: "completed" },
  {
    id: "connect-website",
    label: "Connect Your First Website",
    status: "completed",
  },
  { id: "enable-heatmap", label: "Enable Heatmap", status: "completed" },
  {
    id: "account-verified",
    label: "Account Verified",
    status: "completed",
    restricted: true,
  },
  { id: "invite-team", label: "Invite your team", status: "completed" },
  {
    id: "chrome-extension",
    label: "Add Wingify Chrome Extension",
    status: "completed",
  },
  {
    id: "session-recordings",
    label: "Enable Session Recordings",
    status: "pending",
    duration: "2 min",
  },
  {
    id: "app-session-recordings",
    label: "Enable App Session Recordings",
    status: "pending",
    duration: "2 min",
  },
  {
    id: "currency-timezone",
    label: "Review Currency and Timezone Settings",
    status: "pending",
    duration: "2 min",
  },
  { id: "debug-website", label: "Debug your website", status: "active" },
];

const dataDetail = (
  id: string,
  label: string,
  taskTitle: string,
  description: string,
  linkLabel: string,
  videoTitle: string,
  videoDuration: string,
  actionLabel: string,
  completed = true
): GetStartedNavLeaf => ({
  id,
  label,
  groupId: "manage-data",
  completed,
  detail: {
    taskTitle,
    description,
    linkLabel,
    videoTitle,
    videoDuration,
    durationLabel: "Takes about 2 min",
    completed,
    headerIcon: id === "metrics" ? "target" : "check",
    actions: [{ label: actionLabel, variant: "default", external: true }],
  },
});

export const GET_STARTED_TOP_LINKS: GetStartedTopLink[] = [
  {
    id: "basic-setup",
    label: "Basic Setup",
    icon: "zap",
    view: "task-list",
    groupId: "top",
    durationLabel: "Takes about 23 min",
    tasks: BASIC_SETUP_TASKS,
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: "plug",
    view: "detail",
    groupId: "top",
    detail: {
      taskTitle: "Connect your first integration",
      description:
        "Send experiment and visitor data to analytics, CRM, and messaging tools your team already uses.",
      linkLabel: "Browse integration catalog",
      videoTitle: "Wingify Integrations overview",
      videoDuration: "4 mins",
      durationLabel: "Takes about 5 min",
      headerIcon: "grid",
      actions: [
        { label: "Browse integrations", variant: "default", external: true },
      ],
    },
  },
];

export const GET_STARTED_GROUPS: GetStartedNavGroup[] = [
  {
    id: "manage-data",
    label: "Manage Data",
    icon: "grid",
    items: [
      dataDetail(
        "events",
        "Events",
        "Create Your First Event",
        "Configure events in Data360 to track specific user actions or behaviors tailored to your unique needs.",
        "More about custom events",
        "Wingify Data 360 | Events",
        "5 mins",
        "Manage Events"
      ),
      dataDetail(
        "metrics",
        "Metrics",
        "Create Your First Metric",
        "Configure metrics to track important user actions across campaigns and gain valuable insights into their behavior.",
        "More about configuring metrics",
        "Wingify Data360 | Metrics (Part 1)",
        "6 mins",
        "Manage Metrics"
      ),
      dataDetail(
        "pages",
        "Pages",
        "Define Your First Page",
        "Group URLs into pages so reports, heatmaps, and recordings roll up to the views you care about.",
        "More about page groups",
        "Wingify Data360 | Pages",
        "4 mins",
        "Manage Pages"
      ),
      dataDetail(
        "segments",
        "Segments",
        "Build Your First Segment",
        "Combine attributes and behaviors to target visitors consistently across tests and personalizations.",
        "More about segments",
        "Wingify Data360 | Segments",
        "5 mins",
        "Manage Segments"
      ),
      {
        id: "attributes",
        label: "Attributes",
        groupId: "manage-data",
        detail: {
          taskTitle: "Create Your First Attribute",
          description:
            "Capture visitor properties once and reuse them for targeting, reporting, and integrations.",
          linkLabel: "More about attributes",
          videoTitle: "Wingify Data360 | Attributes",
          videoDuration: "4 mins",
          durationLabel: "Takes about 2 min",
          headerIcon: "grid",
          actions: [
            { label: "Manage Attributes", variant: "default", external: true },
          ],
        },
      },
    ],
  },
  {
    id: "product-setup",
    label: "Product Setup",
    icon: "layers",
    items: [
      {
        id: "web-testing",
        label: "Web Testing",
        groupId: "product-setup",
        detail: {
          taskTitle: "Review Campaign Notifications",
          description:
            "Manage your notifications by selecting your preferred delivery channels: email, in-app, or Slack.",
          linkLabel: "More about notification preferences",
          videoTitle: "Account Settings Notifications & Locale Settings",
          videoDuration: "3 mins",
          durationLabel: "Takes about 2 min",
          cardDuration: "2 min",
          headerIcon: "flask",
          actions: [
            { label: "Mark as Reviewed", variant: "outline" },
            {
              label: "Review Notification Preferences",
              variant: "default",
              external: true,
            },
          ],
        },
      },
      {
        id: "web-insights",
        label: "Web Insights",
        groupId: "product-setup",
        detail: {
          taskTitle: "Enable session insights",
          description:
            "Turn on recordings and heatmaps so you can diagnose friction before you ship the next test.",
          linkLabel: "More about web insights",
          videoTitle: "Wingify Insights | Session recordings",
          videoDuration: "5 mins",
          durationLabel: "Takes about 3 min",
          headerIcon: "check",
          actions: [
            { label: "Open Insights settings", variant: "default", external: true },
          ],
        },
      },
      {
        id: "app-insights",
        label: "App Insights",
        groupId: "product-setup",
        detail: {
          taskTitle: "Connect your mobile app",
          description:
            "Add the SDK and verify the first session so funnels and recordings include native traffic.",
          linkLabel: "Mobile SDK guide",
          videoTitle: "Wingify Insights | Mobile sessions",
          videoDuration: "6 mins",
          durationLabel: "Takes about 4 min",
          headerIcon: "check",
          actions: [
            { label: "View SDK docs", variant: "default", external: true },
          ],
        },
      },
      {
        id: "feature-experimentation",
        label: "Feature Experimentation",
        groupId: "product-setup",
        detail: {
          taskTitle: "Create your first feature flag",
          description:
            "Roll out safely with flags, then attach experiments when you are ready to optimize in production.",
          linkLabel: "Feature flag best practices",
          videoTitle: "Wingify Feature Management | Getting started",
          videoDuration: "5 mins",
          durationLabel: "Takes about 3 min",
          headerIcon: "target",
          actions: [
            { label: "Open Feature Flags", variant: "default", external: true },
          ],
        },
      },
    ],
  },
  {
    id: "privacy-security",
    label: "Privacy & Security",
    icon: "shield",
    items: [
      {
        id: "cookie-consent",
        label: "Cookie consent",
        groupId: "privacy-security",
        detail: {
          taskTitle: "Configure cookie consent",
          description:
            "Collect consent before tracking so experiments stay compliant with your regional policies.",
          linkLabel: "Consent management overview",
          videoTitle: "Wingify Privacy | Cookie consent",
          videoDuration: "3 mins",
          durationLabel: "Takes about 2 min",
          headerIcon: "check",
          actions: [
            { label: "Manage consent", variant: "default", external: true },
          ],
        },
      },
      {
        id: "data-retention",
        label: "Data retention",
        groupId: "privacy-security",
        detail: {
          taskTitle: "Review retention settings",
          description:
            "Set how long visitor and session data is kept before it is purged from your account.",
          linkLabel: "Data retention policy",
          videoTitle: "Wingify Privacy | Retention",
          videoDuration: "2 mins",
          durationLabel: "Takes about 2 min",
          headerIcon: "grid",
          actions: [
            { label: "Review retention", variant: "default", external: true },
          ],
        },
      },
    ],
  },
];

export function getStartedGroupForItem(itemId: string): string | null {
  for (const group of GET_STARTED_GROUPS) {
    if (group.items.some((item) => item.id === itemId)) return group.id;
  }
  return null;
}

export function getStartedLeaf(itemId: string): GetStartedNavLeaf | undefined {
  for (const group of GET_STARTED_GROUPS) {
    const leaf = group.items.find((item) => item.id === itemId);
    if (leaf) return leaf;
  }
  return undefined;
}

export function getStartedTopLink(itemId: string): GetStartedTopLink | undefined {
  return GET_STARTED_TOP_LINKS.find((link) => link.id === itemId);
}

export function resolveGetStartedContent(itemId: string):
  | { kind: "task-list"; label: string; durationLabel?: string; tasks: GetStartedTask[] }
  | { kind: "detail"; label: string; detail: GetStartedDetail }
  | null {
  const top = getStartedTopLink(itemId);
  if (top?.view === "task-list" && top.tasks) {
    return {
      kind: "task-list",
      label: top.label,
      durationLabel: top.durationLabel,
      tasks: top.tasks,
    };
  }
  if (top?.view === "detail" && top.detail) {
    return { kind: "detail", label: top.label, detail: top.detail };
  }
  const leaf = getStartedLeaf(itemId);
  if (leaf?.detail) {
    return { kind: "detail", label: leaf.label, detail: leaf.detail };
  }
  return null;
}
