import type { ComponentType } from "react";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import {
  NAV,
  PROFILE_MODES,
  firstModePath,
  modeLeaves,
} from "../config/navigation";
import { firstChildPath, isProfileModePath } from "../lib/nav";
import AppLayout from "../components/layout/AppLayout";
import DetailShell from "../components/layout/DetailShell";
import DrillInShell from "../components/layout/DrillInShell";
import PlaceholderPage from "../pages/PlaceholderPage";
import WebExperimentation from "../pages/WebExperimentation";
import ConfigPage from "../pages/config/ConfigPage";
import ReportsPage from "../pages/reports/ReportsPage";
import EditorPage from "../pages/editor/EditorPage";
import SessionRecordingsPage from "../pages/insights/SessionRecordingsPage";
import HeatmapsPage from "../pages/insights/HeatmapsPage";
import SurveysPage from "../pages/pulse/SurveysPage";
import FeatureFlagsPage from "../pages/feature-management/FeatureFlagsPage";
import FlagRolloutPage from "../pages/feature-management/FlagRolloutPage";
import FlagTestingPage from "../pages/feature-management/FlagTestingPage";
import FlagMultivariatePage from "../pages/feature-management/FlagMultivariatePage";
import FlagPersonalizePage from "../pages/feature-management/FlagPersonalizePage";
import AttributesPage from "../pages/data-360/AttributesPage";
import EventsPage from "../pages/data-360/EventsPage";
import SegmentsPage from "../pages/data-360/SegmentsPage";
import MetricsPage from "../pages/data-360/MetricsPage";
import DashboardPage from "../pages/home/DashboardPage";

// Built pages, keyed by leaf path. Everything else falls back to PlaceholderPage.
const PAGES: Partial<Record<string, ComponentType>> = {
  "/home/dashboard": DashboardPage,
  "/web-experiment": WebExperimentation,
  "/insights/session-recordings": SessionRecordingsPage,
  "/insights/heatmaps": HeatmapsPage,
  "/pulse/surveys": SurveysPage,
  "/feature-management/feature-flags": FeatureFlagsPage,
  "/feature-management/flag-rollout": FlagRolloutPage,
  "/feature-management/flag-testing": FlagTestingPage,
  "/feature-management/flag-multivariate": FlagMultivariatePage,
  "/feature-management/flag-personalize": FlagPersonalizePage,
  "/data-360/attributes": AttributesPage,
  "/data-360/events": EventsPage,
  "/data-360/segments": SegmentsPage,
  "/data-360/metrics": MetricsPage,
};

// Level-1 page routes (inside AppLayout) and level-2 detail routes (outside —
// DetailShell brings its own chrome) are generated together: every leaf page
// gets a sibling detail route at `${leafPath}/c/:entityId`.
const pageRoutes: RouteObject[] = [];
const detailRoutes: RouteObject[] = [];

const addDetailRoute = (leafPath: string) => {
  // Only /web-experiment gets the ConfigPage body; every other detail route
  // keeps DetailShell's empty body.
  const body = leafPath === "/web-experiment" ? <ConfigPage /> : undefined;
  detailRoutes.push({
    path: `${leafPath}/c/:entityId`,
    element: <DetailShell basePath={leafPath}>{body}</DetailShell>,
  });
};

const leafElement = (leafPath: string) => {
  const Page = PAGES[leafPath] ?? PlaceholderPage;
  return <Page />;
};

for (const item of NAV) {
  // Profile flyout destinations live in DrillInShell via PROFILE_MODES — not AppLayout.
  if (item.path === "/profile") continue;

  if (item.sections) {
    const leaves = item.sections.flatMap((section) => section.items);
    const appLeaves = leaves.filter((leaf) => !isProfileModePath(leaf.path));
    pageRoutes.push({
      path: item.path,
      children: [
        {
          index: true,
          element: (
            <Navigate
              to={appLeaves[0]?.path ?? firstChildPath(item)}
              replace
            />
          ),
        },
        ...appLeaves.map((leaf) => ({
          path: leaf.path,
          element: leafElement(leaf.path),
        })),
      ],
    });
    appLeaves.forEach((leaf) => addDetailRoute(leaf.path));
  } else {
    pageRoutes.push({ path: item.path, element: leafElement(item.path) });
    addDetailRoute(item.path);
  }
}

// Reports view of the web-experiment detail surface — same shell, own URL.
detailRoutes.push({
  path: "/web-experiment/c/:entityId/reports",
  element: (
    <DetailShell basePath="/web-experiment">
      <ReportsPage />
    </DetailShell>
  ),
});

const profileModeRoutes: RouteObject[] = PROFILE_MODES.map((mode) => {
  const leaves = modeLeaves(mode);
  return {
    path: mode.path,
    element: <DrillInShell />,
    children: [
      { index: true, element: <Navigate to={firstModePath(mode)} replace /> },
      ...leaves.map((leaf) => ({
        path: leaf.path.slice(mode.path.length + 1),
        element: <PlaceholderPage />,
      })),
    ],
  };
});

export const router = createBrowserRouter([
  // Full-tab editor — outside AppLayout / DetailShell so it opens blank.
  {
    path: "/web-experiment/c/:entityId/editor/:variationId",
    element: <EditorPage />,
  },
  ...detailRoutes,
  ...profileModeRoutes,
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Navigate to="/home/dashboard" replace /> },
      ...pageRoutes,
      { path: "*", element: <PlaceholderPage /> },
    ],
  },
]);
