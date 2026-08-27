import type { ComponentType } from "react";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import {
  NAV,
  PROFILE_MODES,
  firstModePath,
  flattenNavLeaves,
  modeLeaves,
} from "../config/navigation";
import { firstChildPath, isProfileModePath } from "../lib/nav";
import AppLayout from "../components/layout/AppLayout";
import DetailShell from "../components/layout/DetailShell";
import DrillInShell from "../components/layout/DrillInShell";
import RootChrome from "../components/layout/RootChrome";
import PlaceholderPage from "../pages/PlaceholderPage";
import WebExperimentation from "../pages/WebExperimentation";
import ConfigPage from "../pages/config/ConfigPage";
import ReportsPage from "../pages/reports/ReportsPage";
import EditorPage from "../pages/editor/EditorPage";
import IntegrationsPage from "../pages/integrations/IntegrationsPage";
import AccountGeneralPage from "../pages/settings/AccountGeneralPage";
import AnalyticsChartsPage from "../pages/design/AnalyticsChartsPage";
import FormGalleryPage from "../pages/design/FormGalleryPage";
import DesignSystemPage from "../pages/design/DesignSystemPage";
import SessionRecordingsPage from "../pages/insights/SessionRecordingsPage";
import HeatmapsPage from "../pages/insights/HeatmapsPage";
import HeatmapViewerPage from "../pages/insights/HeatmapViewerPage";
import SessionRecordingPlayerPage from "../pages/insights/SessionRecordingPlayerPage";
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
import PersonalizePage from "../pages/personalize/PersonalizePage";
import PersonalizeComingSoonPage from "../pages/personalize/PersonalizeComingSoonPage";
import CatalogPage from "../pages/commerce/CatalogPage";
import RecommendationPage from "../pages/commerce/RecommendationPage";
import RecommendationDetailPage from "../pages/commerce/RecommendationDetailPage";
import RecommendationReportPage from "../pages/commerce/RecommendationReportPage";

// Built pages, keyed by leaf path. Everything else falls back to PlaceholderPage.
const PAGES: Partial<Record<string, ComponentType>> = {
  "/home/dashboard": DashboardPage,
  "/web-experiment": WebExperimentation,
  "/personalize": PersonalizePage,
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
  "/commerce/catalog": CatalogPage,
  "/commerce/recommendation": RecommendationPage,
};

// Level-1 page routes (inside AppLayout) and level-2 detail routes (outside —
// DetailShell brings its own chrome) are generated together: every leaf page
// gets a sibling detail route at `${leafPath}/c/:entityId`.
const pageRoutes: RouteObject[] = [];
const detailRoutes: RouteObject[] = [];

const addDetailRoute = (leafPath: string) => {
  // Recommendation editor has its own chrome (screenshot layout) — not DetailShell.
  if (leafPath === "/commerce/recommendation") {
    detailRoutes.push({
      path: `${leafPath}/c/:entityId`,
      element: <RecommendationDetailPage />,
    });
    return;
  }
  // Web Exp → ConfigPage; Personalize → Coming soon.
  const body =
    leafPath === "/web-experiment" ? (
      <ConfigPage />
    ) : leafPath === "/personalize" ? (
      <PersonalizeComingSoonPage />
    ) : undefined;
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
    const leaves = flattenNavLeaves(item.sections);
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

// Personalize reports tab — Coming soon until reports are built for this product.
detailRoutes.push({
  path: "/personalize/c/:entityId/reports",
  element: (
    <DetailShell basePath="/personalize">
      <PersonalizeComingSoonPage />
    </DetailShell>
  ),
});

// Commerce Recommendation reporting surface.
detailRoutes.push({
  path: "/commerce/recommendation/c/:entityId/reports",
  element: (
    <DetailShell basePath="/commerce/recommendation">
      <RecommendationReportPage />
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
        element:
          mode.id === "integrations" ? (
            <IntegrationsPage />
          ) : leaf.path === "/settings/accounts/general" ? (
            <AccountGeneralPage />
          ) : (
            <PlaceholderPage />
          ),
      })),
    ],
  };
});

export const router = createBrowserRouter([
  {
    element: <RootChrome />,
    children: [
      // Full-tab editor — outside AppLayout / DetailShell so it opens blank.
      {
        path: "/web-experiment/c/:entityId/editor/:variationId",
        element: <EditorPage />,
      },
      // Full-tab heatmap viewer — same reasoning: opens in its own tab with
      // no app chrome, so it lives outside AppLayout.
      {
        path: "/insights/heatmaps/viewer",
        element: <HeatmapViewerPage />,
      },
      {
        path: "/insights/session-recordings/player",
        element: <SessionRecordingPlayerPage />,
      },
      ...detailRoutes,
      ...profileModeRoutes,
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/home/dashboard" replace /> },
          { path: "/design/charts", element: <AnalyticsChartsPage /> },
          { path: "/design/forms", element: <FormGalleryPage /> },
          { path: "/design-system", element: <DesignSystemPage /> },
          ...pageRoutes,
          { path: "*", element: <PlaceholderPage /> },
        ],
      },
    ],
  },
]);
