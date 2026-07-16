import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { PINNABLE_PATHS } from "../../config/navigation";
import { findItemByPath, RAIL_WIDTH } from "../../lib/nav";
import { useUIStore } from "../../store/ui";
import MorePanel from "./MorePanel";
import PrimaryRail from "./PrimaryRail";
import SubNavPanel from "./SubNavPanel";
import TopBar from "./TopBar";

export default function AppLayout() {
  const { pathname } = useLocation();
  const isDocked = useUIStore((s) => s.isDocked);
  const pinnedPaths = useUIStore((s) => s.pinnedPaths);
  // Local only (not persisted): whether the docked panel column shows the More panel.
  const [moreSelected, setMoreSelected] = useState(false);
  const activeItem = findItemByPath(pathname);
  const hasUnpinned = PINNABLE_PATHS.some((p) => !pinnedPaths.includes(p));
  const showMorePanel = isDocked && moreSelected && hasUnpinned;
  const showDockedPanel = !showMorePanel && isDocked && !!activeItem?.sections;

  return (
    <div
      className="grid h-screen bg-background text-foreground"
      style={{
        gridTemplateColumns:
          showMorePanel || showDockedPanel
            ? `${RAIL_WIDTH}px 248px minmax(0, 1fr)`
            : `${RAIL_WIDTH}px minmax(0, 1fr)`,
        gridTemplateRows: "minmax(0, 1fr)",
      }}
    >
      <PrimaryRail
        moreSelected={showMorePanel}
        onMoreSelectedChange={setMoreSelected}
      />
      {showMorePanel && <MorePanel />}
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
