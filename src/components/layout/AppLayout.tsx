import { Outlet } from "react-router-dom";
import { RAIL_WIDTH } from "../../lib/nav";
import { useUIStore } from "../../store/ui";
import ExpandedNav, { EXPANDED_NAV_WIDTH } from "./ExpandedNav";
import PrimaryRail from "./PrimaryRail";
import TopBar from "./TopBar";

export default function AppLayout() {
  // Docked = expanded labeled sidebar (accordion sub-nav); undocked = icon rail
  // with hover flyouts.
  const isDocked = useUIStore((s) => s.isDocked);

  return (
    <div
      className="grid h-screen bg-background text-foreground"
      style={{
        gridTemplateColumns: `${
          isDocked ? EXPANDED_NAV_WIDTH : RAIL_WIDTH
        }px minmax(0, 1fr)`,
        gridTemplateRows: "minmax(0, 1fr)",
      }}
    >
      {isDocked ? <ExpandedNav /> : <PrimaryRail />}
      <div className="flex min-w-0 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-canvas">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
