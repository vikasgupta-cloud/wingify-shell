import { Outlet } from "react-router-dom";
import ExpandedNav from "./ExpandedNav";
import TopBar from "./TopBar";

export default function AppLayout() {
  // Docked = expanded labeled sidebar (accordion sub-nav); undocked = icon rail
  // with hover flyouts. One ExpandedNav morphs between both — icons stay put.
  // Flex (not grid) so the content column follows the sidebar's animated width
  // instead of relying on grid-template-columns interpolation.
  return (
    <div className="flex h-screen bg-background text-foreground">
      <ExpandedNav />
      {/* bg-panel matches --background by default; under a surface preset it
          fills the notch behind the body's rounded corners with nav chrome. */}
      <div className="flex min-w-0 flex-1 flex-col bg-panel">
        <TopBar />
        <main
          data-slot="app-body"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-canvas"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
