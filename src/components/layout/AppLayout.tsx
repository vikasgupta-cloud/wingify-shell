import { Outlet, useLocation } from "react-router-dom";
import { findItemByPath, RAIL_WIDTH } from "../../lib/nav";
import { useUIStore } from "../../store/ui";
import PrimaryRail from "./PrimaryRail";
import SubNavPanel from "./SubNavPanel";
import TopBar from "./TopBar";

export default function AppLayout() {
  const { pathname } = useLocation();
  const isDocked = useUIStore((s) => s.isDocked);
  const activeItem = findItemByPath(pathname);
  const showDockedPanel = isDocked && !!activeItem?.sections;

  return (
    <div
      className="grid h-screen bg-background text-foreground"
      style={{
        gridTemplateColumns: showDockedPanel
          ? `${RAIL_WIDTH}px 248px minmax(0, 1fr)`
          : `${RAIL_WIDTH}px minmax(0, 1fr)`,
        gridTemplateRows: "minmax(0, 1fr)",
      }}
    >
      <PrimaryRail />
      {showDockedPanel && activeItem && (
        <SubNavPanel item={activeItem} variant="docked" />
      )}
      <div className="flex min-w-0 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
