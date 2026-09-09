// @summary Full-page Wingz chrome matching AppLayout: persistent rail + canvas sheet.
// Uses data-slot="app-body" so surface presets get the same top border, soft
// rail edge, and rounded top-left as Home. Overflow stays hidden for chat layout.
import { Outlet } from "react-router-dom";
import ExpandedNav from "@/components/layout/ExpandedNav";
import GlobalWingzDock from "@/components/layout/GlobalWingzDock";
import TopBar from "@/components/layout/TopBar";

export default function WingzChatShell() {
  return (
    <div className="flex h-full bg-background text-foreground">
      <ExpandedNav />
      <div className="flex min-w-0 flex-1 flex-col bg-panel">
        <TopBar />
        <main
          data-slot="app-body"
          className="flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas"
        >
          <Outlet />
        </main>
        <GlobalWingzDock />
      </div>
    </div>
  );
}
