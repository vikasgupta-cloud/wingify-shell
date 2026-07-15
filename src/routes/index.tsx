import { createBrowserRouter, Navigate, type RouteObject } from "react-router-dom";
import { NAV } from "../config/navigation";
import { firstChildPath } from "../lib/nav";
import AppLayout from "../components/layout/AppLayout";
import DetailShell from "../components/layout/DetailShell";
import PlaceholderPage from "../pages/PlaceholderPage";

// Level-1 page routes (inside AppLayout) and level-2 detail routes (outside —
// DetailShell brings its own chrome) are generated together: every leaf page
// gets a sibling detail route at `${leafPath}/c/:entityId`.
const pageRoutes: RouteObject[] = [];
const detailRoutes: RouteObject[] = [];

const addDetailRoute = (leafPath: string) => {
  detailRoutes.push({
    path: `${leafPath}/c/:entityId`,
    element: <DetailShell basePath={leafPath} />,
  });
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
          element: <PlaceholderPage />,
        })),
      ],
    });
    leaves.forEach((leaf) => addDetailRoute(leaf.path));
  } else {
    pageRoutes.push({ path: item.path, element: <PlaceholderPage /> });
    addDetailRoute(item.path);
  }
}

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
