import { useLocation } from "react-router-dom";
import WingzPanel from "@/components/wingz/WingzPanel";
import { hasInlineWingzHost } from "@/lib/nav";
import { useWingzStore } from "@/store/wingz";

/** Fixed Wingz dock for listing pages that do not mount WingzPanel inline. */
export default function GlobalWingzDock() {
  const { pathname } = useLocation();
  const wingzOpen = useWingzStore((s) => s.open);

  if (!wingzOpen || hasInlineWingzHost(pathname)) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 top-14 z-40 flex p-6 pl-0">
      <div className="pointer-events-auto flex h-full max-h-full min-h-0 flex-col">
        <WingzPanel fillHeight className="min-h-0 max-h-full" />
      </div>
    </div>
  );
}
