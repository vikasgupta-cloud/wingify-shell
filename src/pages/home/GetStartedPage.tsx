// Home → Get Started — onboarding checklist + detail cards (product screenshots, our theme).

import { useMemo, useState } from "react";
import {
  getStartedGroupForItem,
  resolveGetStartedContent,
} from "@/data/getStarted";
import GetStartedDetailPanel from "./get-started/GetStartedDetailPanel";
import GetStartedPageFooter from "./get-started/GetStartedPageFooter";
import GetStartedSidebar from "./get-started/GetStartedSidebar";
import GetStartedTaskPanel from "./get-started/GetStartedTaskPanel";
import GetStartedUnlockPanel from "./get-started/GetStartedUnlockPanel";
import { useIsGetStartedLocked } from "@/store/getStartedOnboarding";

export default function GetStartedPage() {
  const locked = useIsGetStartedLocked();
  const [activeItemId, setActiveItemId] = useState("basic-setup");
  const [activeTaskId, setActiveTaskId] = useState<string | null>("debug-website");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "manage-data": true,
    "product-setup": false,
    "privacy-security": false,
  });

  const content = useMemo(
    () => resolveGetStartedContent(activeItemId),
    [activeItemId]
  );

  const handleItemSelect = (itemId: string) => {
    setActiveItemId(itemId);
    const groupId = getStartedGroupForItem(itemId);
    if (groupId) {
      setOpenGroups((prev) => ({ ...prev, [groupId]: true }));
    }
  };

  const handleToggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 gap-10 px-12 pb-10 pt-10">
        <GetStartedSidebar
          activeItemId={activeItemId}
          openGroups={openGroups}
          onItemSelect={handleItemSelect}
          onToggleGroup={handleToggleGroup}
        />

        {locked ? (
          <GetStartedUnlockPanel />
        ) : content?.kind === "task-list" ? (
          <GetStartedTaskPanel
            label={content.label}
            durationLabel={content.durationLabel}
            tasks={content.tasks}
            activeTaskId={activeTaskId}
            onTaskSelect={setActiveTaskId}
          />
        ) : content?.kind === "detail" ? (
          <GetStartedDetailPanel label={content.label} detail={content.detail} />
        ) : null}
      </div>

      <GetStartedPageFooter />
    </div>
  );
}
