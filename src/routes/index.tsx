import type { ComponentType } from "react";
import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import { NAV } from "../config/navigation";
import { firstChildPath } from "../lib/nav";
import AppLayout from "../components/layout/AppLayout";
import DetailShell from "../components/layout/DetailShell";
import PlaceholderPage from "../pages/PlaceholderPage";
import WebExperimentation from "../pages/WebExperimentation";
import WebsitesAndApps from "../pages/WebsitesAndApps";
import ConfigPage from "../pages/config/ConfigPage";
import ReportsPage from "../pages/reports/ReportsPage";

// Built pages, keyed by leaf path. Everything else falls back to PlaceholderPage.
const PAGES: Partial<Record<string, ComponentType>> = {
  "/web-experiment": WebExperimentation,
  "/profile/websites-and-apps": WebsitesAndApps,
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
  if (item.sections) {
    const leaves = item.sections.flatMap((section) => section.items);
    pageRoutes.push({
      path: item.path,
      children: [
        { index: true, element: <Navigate to={firstChildPath(item)} replace /> },
        ...leaves.map((leaf) => ({
          path: leaf.path,
          element: leafElement(leaf.path),
        })),
      ],
    });
    leaves.forEach((leaf) => addDetailRoute(leaf.path));
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

export const router = createBrowserRouter([
  ...detailRoutes,
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Navigate to="/home/dashboard" replace /> },
      ...pageRoutes,
      { path: "*", element: <PlaceholderPage /> },
    ],
  },
]);
