import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Pencil, Sparkles } from "lucide-react";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { EditorVariationBar } from "@/components/editor/EditorVariationBar";
import { EditorToolRail } from "@/components/editor/EditorToolRail";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { EditorCopilotPanel } from "@/components/editor/EditorCopilotPanel";
import { EditorEditionPanel } from "@/components/editor/EditorEditionPanel";
import { EditorLayersPanel } from "@/components/editor/EditorLayersPanel";
import { EditorAddPanel } from "@/components/editor/EditorAddPanel";
import { EditorMetricsPanel } from "@/components/editor/EditorMetricsPanel";
import { EditorChangesPanel } from "@/components/editor/EditorChangesPanel";
import { EditorTranslatePanel } from "@/components/editor/EditorTranslatePanel";
import { EditorLeftOverlay } from "@/components/editor/EditorLeftOverlay";
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
import {
  DEFAULT_SCENARIO,
  EDITOR_SCENARIOS,
  type EditionTabId,
  type EditorDevice,
  type EditorLayoutMode,
  type EditorLeftTool,
  type EditorScenarioId,
  type EditorSelection,
} from "@/config/editorScenarios";

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

function panelsFromOpen(rightOpen: EditorSidePanelId[]): Record<
  EditorSidePanelId,
  PanelState
> {
  return {
    copilot: {
      open: rightOpen.includes("copilot"),
      chrome: defaultPanelChrome(),
    },
    edition: {
      open: rightOpen.includes("edition"),
      chrome: defaultPanelChrome(),
    },
  };
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

  const [scenarioId, setScenarioId] = useState<EditorScenarioId>(
    DEFAULT_SCENARIO.id
  );
  const [layoutMode, setLayoutMode] = useState<EditorLayoutMode>(
    DEFAULT_SCENARIO.layoutMode
  );
  const [device, setDevice] = useState<EditorDevice>(DEFAULT_SCENARIO.device);
  const [leftTool, setLeftTool] = useState<EditorLeftTool | null>(
    DEFAULT_SCENARIO.leftTool
  );
  const [selection, setSelection] = useState<EditorSelection | null>(
    DEFAULT_SCENARIO.selection
  );
  const [editionTab, setEditionTab] = useState<EditionTabId>(
    DEFAULT_SCENARIO.editionTab
  );
  const [showSubtestPopover, setShowSubtestPopover] = useState(
    DEFAULT_SCENARIO.showSubtestPopover
  );
  const [showDimensionsBar, setShowDimensionsBar] = useState(
    DEFAULT_SCENARIO.showDimensionsBar
  );

  const [panels, setPanels] = useState<Record<EditorSidePanelId, PanelState>>(
    () => panelsFromOpen(DEFAULT_SCENARIO.rightOpen)
  );
  const [floatPos, setFloatPos] = useState(() => defaultFloatPos());
  const [activeTab, setActiveTab] = useState<EditorSidePanelId>(
    DEFAULT_SCENARIO.rightOpen[0] ?? "copilot"
  );
  const [shellMinimized, setShellMinimized] = useState(false);

  useEffect(() => {
    const previous = document.title;
    document.title = "Editor · Wingify";
    return () => {
      document.title = previous;
    };
  }, []);

  const applyScenario = useCallback((id: EditorScenarioId) => {
    const scenario = EDITOR_SCENARIOS.find((s) => s.id === id);
    if (!scenario) return;
    setScenarioId(scenario.id);
    setLayoutMode(scenario.layoutMode);
    setDevice(scenario.device);
    setLeftTool(scenario.leftTool);
    setSelection(scenario.selection);
    setEditionTab(scenario.editionTab);
    setShowSubtestPopover(scenario.showSubtestPopover);
    setShowDimensionsBar(scenario.showDimensionsBar);
    setPanels(panelsFromOpen(scenario.rightOpen));
    setActiveTab(scenario.rightOpen[0] ?? "copilot");
    setShellMinimized(false);
    setFloatPos(defaultFloatPos());
  }, []);

  const detachedIds = PANEL_ORDER.filter(
    (id) => panels[id].open && isDetached(panels[id].chrome.mode)
  );
  const dockedIds = PANEL_ORDER.filter(
    (id) => panels[id].open && panels[id].chrome.mode === "docked"
  );
  const openIds = PANEL_ORDER.filter((id) => panels[id].open);
  const tabbed = detachedIds.length > 1;

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

  const toggleLeftTool = (id: EditorLeftTool) => {
    setLeftTool((current) => (current === id ? null : id));
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
      <EditorCopilotPanel
        key={id}
        {...shared}
        selection={selection}
        onClearSelection={() => setSelection(null)}
      />
    ) : (
      <EditorEditionPanel
        key={id}
        {...shared}
        selection={selection}
        initialTab={editionTab}
      />
    );
  };

  const leftPanel =
    leftTool === "layers" ? (
      <EditorLayersPanel onClose={() => setLeftTool(null)} />
    ) : leftTool === "add" ? (
      <EditorAddPanel onClose={() => setLeftTool(null)} />
    ) : leftTool === "metrics" ? (
      <EditorMetricsPanel onClose={() => setLeftTool(null)} />
    ) : leftTool === "changes" ? (
      <EditorChangesPanel onClose={() => setLeftTool(null)} />
    ) : leftTool === "translate" ? (
      <EditorTranslatePanel onClose={() => setLeftTool(null)} />
    ) : null;

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-background"
      data-campaign-id={entityId}
      data-variation-id={variationId}
      data-scenario={scenarioId}
    >
      <EditorTopBar
        scenarioId={scenarioId}
        onScenarioChange={applyScenario}
      />
      <div className="flex min-h-0 flex-1">
        <EditorToolRail activeTool={leftTool} onSelect={toggleLeftTool} />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <EditorVariationBar
            layoutMode={layoutMode}
            device={device}
            onDeviceChange={(d) => {
              setDevice(d);
              setShowDimensionsBar(d !== "desktop");
            }}
          />
          <div className="relative min-h-0 flex-1">
            {leftPanel && (
              <div className="absolute inset-y-0 left-0 z-20 flex">
                <EditorLeftOverlay>{leftPanel}</EditorLeftOverlay>
              </div>
            )}
            <div className="absolute inset-0 flex flex-col">
              <EditorCanvas
                device={device}
                showDimensionsBar={showDimensionsBar}
                selection={selection}
                onSelect={setSelection}
                onClearSelection={() => setSelection(null)}
                showSubtestPopover={showSubtestPopover}
              />
            </div>
          </div>
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
