import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Pencil, Sparkles } from "lucide-react";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { EditorVariationBar } from "@/components/editor/EditorVariationBar";
import { EditorToolRail } from "@/components/editor/EditorToolRail";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { EditorCopilotPanel } from "@/components/editor/EditorCopilotPanel";
import { EditorEditionPanel } from "@/components/editor/EditorEditionPanel";
import {
  defaultFloatPos,
  defaultPanelChrome,
  EditorFloatingPanelGroup,
  useFloatingGroupDrag,
  type EditorPanelChrome,
} from "@/components/editor/EditorFloatablePanel";
import {
  EditorUtilityRail,
  type EditorSidePanelId,
} from "@/components/editor/EditorUtilityRail";

type PanelState = {
  open: boolean;
  chrome: EditorPanelChrome;
};

const PANEL_ORDER: EditorSidePanelId[] = ["copilot", "edition"];

const PANEL_META: Record<
  EditorSidePanelId,
  { label: string; shortLabel: string; Icon: typeof Sparkles }
> = {
  copilot: { label: "Wandz Copilot", shortLabel: "Copilot", Icon: Sparkles },
  edition: { label: "Edition", shortLabel: "Edition", Icon: Pencil },
};

function isDetached(mode: EditorPanelChrome["mode"]) {
  return mode === "floating" || mode === "minimized";
}

/**
 * Full-tab visual editor — Global Layout / Default from Figma.
 * Opened from campaign config via Launch Editor.
 */
export default function EditorPage() {
  const { entityId, variationId } = useParams<{
    entityId: string;
    variationId: string;
  }>();
  const [panels, setPanels] = useState<Record<EditorSidePanelId, PanelState>>(
    () => ({
      copilot: { open: true, chrome: defaultPanelChrome() },
      edition: { open: false, chrome: defaultPanelChrome() },
    })
  );
  const [floatPos, setFloatPos] = useState(() => defaultFloatPos());
  const [activeTab, setActiveTab] = useState<EditorSidePanelId>("copilot");
  const [shellMinimized, setShellMinimized] = useState(false);

  useEffect(() => {
    const previous = document.title;
    document.title = "Editor · Wingify";
    return () => {
      document.title = previous;
    };
  }, []);

  const detachedIds = PANEL_ORDER.filter(
    (id) => panels[id].open && isDetached(panels[id].chrome.mode)
  );
  const dockedIds = PANEL_ORDER.filter(
    (id) => panels[id].open && panels[id].chrome.mode === "docked"
  );
  const openIds = PANEL_ORDER.filter((id) => panels[id].open);
  const tabbed = detachedIds.length > 1;

  // Keep active tab valid for the detached set.
  const detachedKey = detachedIds.join(",");
  useEffect(() => {
    if (!detachedKey) return;
    const ids = detachedKey.split(",") as EditorSidePanelId[];
    if (!ids.includes(activeTab)) {
      setActiveTab(ids[0]!);
    }
  }, [activeTab, detachedKey]);

  const setFloatPosAndSync = useCallback(
    (pos: { x: number; y: number }) => {
      setFloatPos(pos);
      setPanels((prev) => {
        const next = { ...prev };
        for (const id of PANEL_ORDER) {
          if (next[id].open && isDetached(next[id].chrome.mode)) {
            next[id] = {
              ...next[id],
              chrome: { ...next[id].chrome, pos },
            };
          }
        }
        return next;
      });
    },
    []
  );

  const { drag: groupDrag, dragging: groupDragging } = useFloatingGroupDrag(
    floatPos,
    setFloatPosAndSync
  );

  const setChrome = useCallback(
    (id: EditorSidePanelId, chrome: EditorPanelChrome) => {
      setPanels((prev) => {
        const wasDetached = isDetached(prev[id].chrome.mode);
        const nowDetached = isDetached(chrome.mode);
        const otherDetached = PANEL_ORDER.some(
          (other) =>
            other !== id &&
            prev[other].open &&
            isDetached(prev[other].chrome.mode)
        );

        if (!wasDetached && nowDetached) {
          if (!otherDetached) {
            setFloatPos(chrome.pos);
          }
          setActiveTab(id);
          setShellMinimized(false);
          return {
            ...prev,
            [id]: {
              ...prev[id],
              chrome: {
                ...chrome,
                mode: "floating",
                pos: otherDetached
                  ? PANEL_ORDER.map((p) => prev[p])
                      .find(
                        (p) => p.open && isDetached(p.chrome.mode)
                      )?.chrome.pos ?? chrome.pos
                  : chrome.pos,
              },
            },
          };
        }

        return {
          ...prev,
          [id]: { ...prev[id], chrome },
        };
      });
    },
    []
  );

  const closePanel = useCallback((id: EditorSidePanelId) => {
    setPanels((prev) => ({
      ...prev,
      [id]: { ...prev[id], open: false },
    }));
  }, []);

  const claimDock = useCallback((id: EditorSidePanelId) => {
    setPanels((prev) => {
      const next = { ...prev };
      for (const other of PANEL_ORDER) {
        if (
          other !== id &&
          next[other].open &&
          next[other].chrome.mode === "docked"
        ) {
          next[other] = { ...next[other], open: false };
        }
      }
      next[id] = {
        ...next[id],
        open: true,
        chrome: { ...next[id].chrome, mode: "docked" },
      };
      return next;
    });
    setShellMinimized(false);
  }, []);

  const toggleSidePanel = (id: EditorSidePanelId) => {
    setPanels((prev) => {
      const current = prev[id];
      if (current.open) {
        return { ...prev, [id]: { ...current, open: false } };
      }

      const next = { ...prev };
      if (current.chrome.mode === "docked") {
        for (const other of PANEL_ORDER) {
          if (
            other !== id &&
            next[other].open &&
            next[other].chrome.mode === "docked"
          ) {
            next[other] = { ...next[other], open: false };
          }
        }
      }
      next[id] = { ...current, open: true };
      return next;
    });
  };

  const renderPanel = (id: EditorSidePanelId, inShell: boolean) => {
    const state = panels[id];
    const shared = {
      onClose: () => closePanel(id),
      chrome: inShell
        ? { ...state.chrome, mode: "floating" as const, pos: floatPos }
        : state.chrome,
      onChromeChange: (chrome: EditorPanelChrome) => setChrome(id, chrome),
      onReattach: () => claimDock(id),
      grouped: inShell || undefined,
      tabPane: inShell || undefined,
      groupDrag: inShell ? groupDrag : undefined,
    };
    return id === "copilot" ? (
      <EditorCopilotPanel key={id} {...shared} />
    ) : (
      <EditorEditionPanel key={id} {...shared} />
    );
  };

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-background"
      data-campaign-id={entityId}
      data-variation-id={variationId}
    >
      <EditorTopBar />
      <div className="flex min-h-0 flex-1">
        <EditorToolRail />
        <div className="flex min-w-0 flex-1 flex-col">
          <EditorVariationBar />
          <EditorCanvas />
        </div>
        {dockedIds.map((id) => renderPanel(id, false))}
        {detachedIds.length > 0 && (
          <EditorFloatingPanelGroup
            pos={floatPos}
            onPosChange={setFloatPosAndSync}
            tabs={detachedIds.map((id) => {
              const meta = PANEL_META[id];
              return {
                id,
                label: tabbed ? meta.shortLabel : meta.label,
                icon: (
                  <meta.Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                ),
              };
            })}
            activeId={activeTab}
            onActiveIdChange={(id) => setActiveTab(id as EditorSidePanelId)}
            minimized={shellMinimized}
            onMinimize={() => setShellMinimized(true)}
            onExpand={() => setShellMinimized(false)}
            onReattachActive={() => claimDock(activeTab)}
            onCloseActive={() => closePanel(activeTab)}
            drag={groupDrag}
            dragging={groupDragging}
          >
            {detachedIds.map((id) => (
              <div
                key={id}
                className={
                  id === activeTab
                    ? "flex min-h-0 flex-1 flex-col"
                    : "hidden"
                }
              >
                {renderPanel(id, true)}
              </div>
            ))}
          </EditorFloatingPanelGroup>
        )}
        <EditorUtilityRail activeIds={openIds} onToggle={toggleSidePanel} />
      </div>
    </div>
  );
}
