import { useLocation } from "react-router-dom";
import WandzPanel from "@/components/wandz/WandzPanel";
import { hasInlineWandzHost } from "@/lib/nav";
import { useWandzStore } from "@/store/wandz";

/** Fixed Wandz dock for listing pages that do not mount WandzPanel inline. */
export default function GlobalWandzDock() {
  const { pathname } = useLocation();
  const wandzOpen = useWandzStore((s) => s.open);

  if (!wandzOpen || hasInlineWandzHost(pathname)) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 top-14 z-40 flex p-6 pl-0">
      <div className="pointer-events-auto flex h-full max-h-full min-h-0 flex-col">
        <WandzPanel fillHeight className="min-h-0 max-h-full" />
      </div>
    </div>
  );
}
