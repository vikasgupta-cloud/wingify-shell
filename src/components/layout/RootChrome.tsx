import { Outlet } from "react-router-dom";
import FontController from "./FontController";
import PlaygroundBanner from "./PlaygroundBanner";

/**
 * Top-level chrome shared by every route. Keeps FontController inside the
 * router so links (e.g. chart gallery) can use React Router APIs.
 * Playground banner sits above all shells when Demo Workspace is selected.
 */
export default function RootChrome() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <PlaygroundBanner />
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
      <FontController />
    </div>
  );
}
