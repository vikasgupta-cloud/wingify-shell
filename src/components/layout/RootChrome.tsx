import { Outlet } from "react-router-dom";
import FontController from "./FontController";
import { GetStartedGate } from "./GetStartedGate";
import PlaygroundBanner from "./PlaygroundBanner";
import RebrandingIntroModal from "./RebrandingIntroModal";
import WorkspaceStatusBanner from "./WorkspaceStatusBanner";

/**
 * Top-level chrome shared by every route. Keeps FontController inside the
 * router so links (e.g. chart gallery) can use React Router APIs.
 * Playground + workspace status banners sit above all shells.
 */
export default function RootChrome() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <PlaygroundBanner />
      <WorkspaceStatusBanner />
      <GetStartedGate />
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
      <FontController />
      <RebrandingIntroModal />
    </div>
  );
}
