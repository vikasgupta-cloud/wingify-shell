import { Outlet } from "react-router-dom";
import FontController from "./FontController";

/**
 * Top-level chrome shared by every route. Hosts the design controller as an
 * embedded right column (not an overlay) so the page stays interactive while
 * you tweak appearance. FontController stays inside the router so links
 * (e.g. chart gallery) can use React Router APIs.
 */
export default function RootChrome() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </div>
      <FontController />
    </div>
  );
}
