import { Outlet } from "react-router-dom";
import ExpandedNav from "./ExpandedNav";
import TopBar from "./TopBar";

/** Shell chrome / page canvas honour Component colours → Background overrides. */
const chromeStyle = {
  backgroundColor:
    "hsl(var(--appearance-app-background-chrome, var(--background)))",
} as const;

const canvasStyle = {
  backgroundColor:
    "hsl(var(--appearance-app-background-canvas, var(--canvas)))",
} as const;

export default function AppLayout() {
  // Docked = expanded labeled sidebar (accordion sub-nav); undocked = icon rail
  // with hover flyouts. One ExpandedNav morphs between both — icons stay put.
  // Flex (not grid) so the content column follows the sidebar's animated width
  // instead of relying on grid-template-columns interpolation.
  return (
    <div className="flex h-full text-foreground" style={chromeStyle}>
      <ExpandedNav />
      <div className="flex min-w-0 flex-1 flex-col" style={chromeStyle}>
        <TopBar />
        <main className="flex-1 overflow-y-auto" style={canvasStyle}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
