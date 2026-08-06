import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { History, Languages, Layers, ListTree, Pencil, Sparkles } from "lucide-react";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { EditorVersionBanner } from "@/components/editor/EditorVersionBanner";
import { EditorScenarioFloat } from "@/components/editor/EditorScenarioFloat";
import { EditorBottomDock } from "@/components/editor/EditorBottomDock";
import {
  DEFAULT_VARIATIONS,
  type CodeScopeId,
  type EditorVariationTab,
  type VariationId,
} from "@/components/editor/EditorVariationBar";
import {
  EditorCanvas,
  EDITOR_PREVIEW_SRC,
  type EditorMode,
} from "@/components/editor/EditorCanvas";
import { EditorCodeWorkspace } from "@/components/editor/EditorCodeWorkspace";
import { EditorCopilotPanel } from "@/components/editor/EditorCopilotPanel";
import { useEditorAi } from "@/components/editor/useEditorAi";
import { EditorEditionPanel } from "@/components/editor/EditorEditionPanel";
import { EditorLayersPanel } from "@/components/editor/EditorLayersPanel";
import { EditorAddPanel } from "@/components/editor/EditorAddPanel";
import { EditorMetricsPanel } from "@/components/editor/EditorMetricsPanel";
import { EditorChangesPanel } from "@/components/editor/EditorChangesPanel";
import { EditorHistoryPanel } from "@/components/editor/EditorHistoryPanel";
import { EditorTranslatePanel } from "@/components/editor/EditorTranslatePanel";
import { EditorBottomSheet } from "@/components/editor/EditorBottomSheet";
import { EditorVariationsPanel } from "@/components/editor/EditorVariationsPanel";
import {
  EditorFloatingPanelGroup,
  useFloatingGroupDrag,
  type EditorPanelChrome,
} from "@/components/editor/EditorFloatablePanel";
import {
  EDITOR_SIDE_PANEL_ORDER,
  EditorUtilityRail,
  type EditorSidePanelId,
} from "@/components/editor/EditorUtilityRail";
import {
  DEFAULT_SCENARIO,
  EDITOR_SCENARIOS,
  type EditorDevice,
  type EditorLayoutMode,
  type EditorLeftTool,
  type EditorScenarioId,
  type EditorSelection,
} from "@/config/editorScenarios";
import { useVisibleCampaigns } from "@/store/rows";
import { useEditorPanelsStore } from "@/store/editorPanels";
import { useEditorSavesStore, selectActiveVersion } from "@/store/editorSaves";

const PANEL_ORDER = EDITOR_SIDE_PANEL_ORDER;

const PANEL_META: Record<
  EditorSidePanelId,
  { label: string; shortLabel: string; Icon: typeof Sparkles }
> = {
  layers: { label: "Layers", shortLabel: "Layers", Icon: Layers },
  copilot: { label: "AI thread", shortLabel: "AI", Icon: Sparkles },
  edition: { label: "Edition", shortLabel: "Edition", Icon: Pencil },
  translate: { label: "Translate", shortLabel: "Translate", Icon: Languages },
  changes: { label: "Changes", shortLabel: "Changes", Icon: ListTree },
  history: {
    label: "Version history",
    shortLabel: "History",
    Icon: History,
  },
};

function isDetached(mode: EditorPanelChrome["mode"]) {
  return mode === "floating" || mode === "minimized";
}

function displayPreviewUrl(href: string) {
  try {
    const u = new URL(href, window.location.origin);
    u.searchParams.delete("t");
    const q = u.searchParams.toString();
    return `${u.pathname}${q ? `?${q}` : ""}${u.hash}` || EDITOR_PREVIEW_SRC;
  } catch {
    return href;
  }
}

function resolvePreviewSrc(input: string, currentSrc: string) {
  const raw = input.trim();
  if (!raw) return currentSrc;
  if (raw.startsWith("#")) {
    const base = currentSrc.split("#")[0] ?? EDITOR_PREVIEW_SRC;
    return `${base}${raw}`;
  }
  if (raw.startsWith("/")) return raw;
  try {
    const u = new URL(raw, window.location.origin);
    if (u.origin === window.location.origin) {
      return `${u.pathname}${u.search}${u.hash}`;
    }
  } catch {
    /* fall through */
  }
  return raw.startsWith("http") ? raw : `/${raw.replace(/^\.?\/+/, "")}`;
}

function codeScopeLabel(
  scope: CodeScopeId,
  variations: EditorVariationTab[]
): string {
  if (scope === "campaign") return "Campaign code";
  return variations.find((v) => v.id === scope)?.label ?? scope;
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

  const campaigns = useVisibleCampaigns();
  const campaign = campaigns.find((c) => c.id === entityId);

  const [scenarioId, setScenarioId] = useState<EditorScenarioId>(
    DEFAULT_SCENARIO.id
  );
  const [, setLayoutMode] = useState<EditorLayoutMode>(
    DEFAULT_SCENARIO.layoutMode
  );
  const [device, setDevice] = useState<EditorDevice>(DEFAULT_SCENARIO.device);
  const previewWidthMode = useEditorPanelsStore((s) => s.previewWidthMode);
  const setPreviewWidthMode = useEditorPanelsStore((s) => s.setPreviewWidthMode);
  const leftTool = useEditorPanelsStore((s) => s.leftTool);
  const setLeftTool = useEditorPanelsStore((s) => s.setLeftTool);
  const [selection, setSelection] = useState<EditorSelection | null>(
    DEFAULT_SCENARIO.selection
  );
  const editionTab = useEditorPanelsStore((s) => s.editionTab);
  const setEditionTab = useEditorPanelsStore((s) => s.setEditionTab);
  const [showSubtestPopover, setShowSubtestPopover] = useState(
    DEFAULT_SCENARIO.showSubtestPopover
  );
  const [showDimensionsBar, setShowDimensionsBar] = useState(
    DEFAULT_SCENARIO.showDimensionsBar
  );
  const [reloadOnDeviceSwitch, setReloadOnDeviceSwitch] = useState(false);
  const [applyChangesToAllDevices, setApplyChangesToAllDevices] =
    useState(true);
  const [editorMode, setEditorMode] = useState<EditorMode>("design");
  const [previewSrc, setPreviewSrc] = useState(EDITOR_PREVIEW_SRC);
  const [previewUrlLabel, setPreviewUrlLabel] = useState(EDITOR_PREVIEW_SRC);
  const [navHistory, setNavHistory] = useState<string[]>([EDITOR_PREVIEW_SRC]);
  const [navIndex, setNavIndex] = useState(0);
  const [variations, setVariations] =
    useState<EditorVariationTab[]>(DEFAULT_VARIATIONS);
  const [activeVariationId, setActiveVariationId] =
    useState<VariationId>("v1");
  const [codeScope, setCodeScope] = useState<CodeScopeId>("v1");

  const panels = useEditorPanelsStore((s) => s.panels);
  const setPanels = useEditorPanelsStore((s) => s.setPanels);
  const bottomSheetHeight = useEditorPanelsStore((s) => s.bottomSheetHeight);
  const sideSheetWidth = useEditorPanelsStore((s) => s.sideSheetWidth);
  const dockPlacement = useEditorPanelsStore((s) => s.dockPlacement);
  const dockEdge =
    dockPlacement.mode === "edge" && dockPlacement.edge === "left"
      ? "left"
      : "bottom";
  const dockAlign =
    dockPlacement.mode === "edge" ? dockPlacement.align : "center";
  const setBottomSheetHeight = useEditorPanelsStore(
    (s) => s.setBottomSheetHeight
  );
  const setSideSheetWidth = useEditorPanelsStore((s) => s.setSideSheetWidth);
  const hydrateFromScenario = useEditorPanelsStore((s) => s.hydrateFromScenario);
  const floatPos = useEditorPanelsStore((s) => s.floatPos);
  const setFloatPos = useEditorPanelsStore((s) => s.setFloatPos);
  const floatSize = useEditorPanelsStore((s) => s.floatSize);
  const setFloatSize = useEditorPanelsStore((s) => s.setFloatSize);
  const activeTab = useEditorPanelsStore((s) => s.activeTab);
  const setActiveTab = useEditorPanelsStore((s) => s.setActiveTab);
  const shellMinimized = useEditorPanelsStore((s) => s.shellMinimized);
  const setShellMinimized = useEditorPanelsStore((s) => s.setShellMinimized);
  const activeSaveVersionId = useEditorSavesStore((s) => s.activeVersionId);
  const saveVersions = useEditorSavesStore((s) => s.versions);
  const activeSaveVersion = selectActiveVersion(
    saveVersions,
    activeSaveVersionId
  );
  const versionFoldKey = activeSaveVersion?.foldKey ?? "initial";
  const ai = useEditorAi();

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
    setSelection(scenario.selection);
    setShowSubtestPopover(scenario.showSubtestPopover);
    setShowDimensionsBar(scenario.showDimensionsBar);
    hydrateFromScenario({
      leftTool: scenario.leftTool,
      editionTab: scenario.editionTab,
      rightOpen: scenario.rightOpen,
    });
  }, [hydrateFromScenario]);

  const navigatePreview = useCallback((next: string) => {
    setPreviewSrc(next);
    setPreviewUrlLabel(displayPreviewUrl(next));
    setNavHistory((prev) => {
      const trimmed = prev.slice(0, navIndex + 1);
      if (trimmed[trimmed.length - 1] === next) {
        setNavIndex(trimmed.length - 1);
        return trimmed;
      }
      const stack = [...trimmed, next];
      setNavIndex(stack.length - 1);
      return stack;
    });
  }, [navIndex]);

  const handleLocationChange = useCallback((href: string) => {
    const path = displayPreviewUrl(href);
    setPreviewUrlLabel(path);
    setNavHistory((prev) => {
      if (prev[navIndex] === path || prev[navIndex] === href) return prev;
      const trimmed = prev.slice(0, navIndex + 1);
      const stack = [...trimmed, path];
      setNavIndex(stack.length - 1);
      return stack;
    });
  }, [navIndex]);

  const goBack = useCallback(() => {
    if (navIndex <= 0) return;
    const nextIndex = navIndex - 1;
    const next = navHistory[nextIndex];
    if (!next) return;
    setNavIndex(nextIndex);
    setPreviewSrc(next);
    setPreviewUrlLabel(displayPreviewUrl(next));
  }, [navHistory, navIndex]);

  const goForward = useCallback(() => {
    if (navIndex >= navHistory.length - 1) return;
    const nextIndex = navIndex + 1;
    const next = navHistory[nextIndex];
    if (!next) return;
    setNavIndex(nextIndex);
    setPreviewSrc(next);
    setPreviewUrlLabel(displayPreviewUrl(next));
  }, [navHistory, navIndex]);

  const refreshPreview = useCallback(() => {
    setPreviewSrc((src) => {
      const [withoutHash, hash = ""] = src.split("#");
      const base = (withoutHash ?? src).split("?")[0] ?? src;
      return `${base}?t=${Date.now()}${hash ? `#${hash}` : ""}`;
    });
  }, []);

  const handleModeChange = useCallback((mode: EditorMode) => {
    setEditorMode(mode);
    if (mode === "code") {
      setCodeScope(activeVariationId);
      setLeftTool((current) =>
        current === "add" || current === "metrics" ? null : current
      );
    } else if (mode === "navigate") {
      setLeftTool((current) =>
        current === "add" || current === "metrics" ? null : current
      );
    }
  }, [activeVariationId, setLeftTool]);

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
    setLeftTool(null);
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
  }, [setLeftTool, setPanels, setShellMinimized]);

  const openSidePanel = useCallback((id: EditorSidePanelId) => {
    setLeftTool(null);
    setPanels((prev) => {
      const detached = PANEL_ORDER.filter(
        (pid) => prev[pid].open && isDetached(prev[pid].chrome.mode)
      );
      const groupPos =
        detached[0] != null ? prev[detached[0]].chrome.pos : floatPos;

      if (detached.length > 0) {
        return {
          ...prev,
          [id]: {
            ...prev[id],
            open: true,
            chrome: {
              ...prev[id].chrome,
              mode: "floating" as const,
              pos: groupPos,
            },
          },
        };
      }

      const next = { ...prev };
      if (prev[id].chrome.mode === "docked") {
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
      next[id] = { ...next[id], open: true };
      return next;
    });
    setActiveTab(id);
    setShellMinimized(false);
  }, [floatPos, setActiveTab, setLeftTool, setPanels, setShellMinimized]);

  const toggleSidePanel = (id: EditorSidePanelId) => {
    const current = panels[id];
    const detached = PANEL_ORDER.filter(
      (pid) => panels[pid].open && isDetached(panels[pid].chrome.mode)
    );
    const hasDetached = detached.length > 0;
    const groupPos =
      detached[0] != null ? panels[detached[0]].chrome.pos : floatPos;

    setLeftTool(null);

    // Detached group already open — rail clicks focus / join that window.
    if (hasDetached) {
      if (current.open && isDetached(current.chrome.mode)) {
        setActiveTab(id);
        setShellMinimized(false);
        return;
      }
      setPanels((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          open: true,
          chrome: {
            ...prev[id].chrome,
            mode: "floating",
            pos: groupPos,
          },
        },
      }));
      setActiveTab(id);
      setShellMinimized(false);
      return;
    }

    if (current.open) {
      closePanel(id);
      return;
    }

    setPanels((prev) => {
      const next = { ...prev };
      if (prev[id].chrome.mode === "docked") {
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
      next[id] = { ...prev[id], open: true };
      return next;
    });
    setActiveTab(id);
  };

  const toggleLeftTool = (id: EditorLeftTool) => {
    setLeftTool((current) => {
      const next = current === id ? null : id;
      if (next === "add" || next === "metrics" || next === "variations") {
        setPanels((prev) => {
          const updated = { ...prev };
          for (const panelId of PANEL_ORDER) {
            if (
              updated[panelId].open &&
              updated[panelId].chrome.mode === "docked"
            ) {
              updated[panelId] = { ...updated[panelId], open: false };
            }
          }
          return updated;
        });
      }
      return next;
    });
  };

  const closeLeftTool = () => {
    setLeftTool(null);
  };

  const bottomSheetOpen =
    leftTool === "add" || leftTool === "metrics" || leftTool === "variations";
  const overlayDocked = previewWidthMode === "fixed";

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
    if (id === "layers") {
      return <EditorLayersPanel key={id} {...shared} />;
    }
    if (id === "copilot") {
      return (
        <EditorCopilotPanel
          key={id}
          {...shared}
          selection={selection}
          onClearSelection={() => setSelection(null)}
          threads={ai.threads}
          activeThread={ai.activeThread}
          activeThreadId={ai.activeThreadId}
          onSelectThread={ai.setActiveThreadId}
          onNewThread={ai.startThread}
          onSend={(prompt) => {
            ai.sendPrompt(prompt, selection?.selector);
          }}
          busy={ai.busy}
        />
      );
    }
    if (id === "edition") {
      return (
        <EditorEditionPanel
          key={id}
          {...shared}
          selection={selection}
          initialTab={editionTab}
          onTabChange={setEditionTab}
        />
      );
    }
    if (id === "translate") {
      return <EditorTranslatePanel key={id} {...shared} />;
    }
    if (id === "changes") {
      return <EditorChangesPanel key={id} {...shared} />;
    }
    return <EditorHistoryPanel key={id} {...shared} />;
  };

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground"
      data-campaign-id={entityId}
      data-variation-id={variationId}
      data-scenario={scenarioId}
      data-editor-shell
    >
      <EditorTopBar
        campaignName={campaign?.name}
        status={campaign?.status}
        backHref={
          entityId ? `/web-experiment/c/${entityId}` : "/web-experiment"
        }
        showPreviewChrome={editorMode !== "code"}
        mode={editorMode}
        device={device}
        onDeviceChange={(d) => {
          setDevice(d);
          if (reloadOnDeviceSwitch) {
            refreshPreview();
          }
        }}
        previewWidthMode={previewWidthMode}
        onPreviewWidthModeChange={setPreviewWidthMode}
        showViewportDimensions={showDimensionsBar}
        onShowViewportDimensionsChange={setShowDimensionsBar}
        reloadOnDeviceSwitch={reloadOnDeviceSwitch}
        onReloadOnDeviceSwitchChange={setReloadOnDeviceSwitch}
        applyChangesToAllDevices={applyChangesToAllDevices}
        onApplyChangesToAllDevicesChange={setApplyChangesToAllDevices}
        navigateUrl={previewUrlLabel}
        canGoBack={navIndex > 0}
        canGoForward={navIndex < navHistory.length - 1}
        onNavigateUrlChange={setPreviewUrlLabel}
        onNavigateGo={(url) =>
          navigatePreview(resolvePreviewSrc(url, previewSrc))
        }
        onNavigateBack={goBack}
        onNavigateForward={goForward}
        onNavigateRefresh={refreshPreview}
        onSwitchToDesign={() => setEditorMode("design")}
      />
      <EditorVersionBanner />
      <div className="relative flex min-h-0 flex-1">
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              {editorMode === "code" ? (
                <EditorCodeWorkspace
                  scopeLabel={codeScopeLabel(codeScope, variations)}
                  onDone={() => setEditorMode("design")}
                />
              ) : (
                <EditorCanvas
                  src={previewSrc}
                  device={device}
                  previewWidthMode={previewWidthMode}
                  mode={editorMode}
                  showDimensionsBar={
                    showDimensionsBar && editorMode === "design"
                  }
                  selection={selection}
                  onSelect={setSelection}
                  onClearSelection={() => setSelection(null)}
                  onOpenEdition={() => openSidePanel("edition")}
                  onOpenCopilot={() => openSidePanel("copilot")}
                  onAskAi={(prompt, sel) => {
                    ai.sendPrompt(prompt, sel.selector);
                  }}
                  showSubtestPopover={
                    showSubtestPopover && editorMode === "design"
                  }
                  onDismissSubtest={() => setShowSubtestPopover(false)}
                  onLocationChange={handleLocationChange}
                  variationId={activeVariationId}
                  versionFoldKey={versionFoldKey}
                />
              )}
            </div>
            {overlayDocked && dockedIds.length > 0 && (
              <div className="absolute inset-y-0 right-0 z-20 flex">
                {dockedIds.map((id) => renderPanel(id, false))}
              </div>
            )}
            <EditorScenarioFloat
              scenarioId={scenarioId}
              onScenarioChange={applyScenario}
            />
            <EditorBottomSheet
              open={bottomSheetOpen}
              onClose={closeLeftTool}
              defaultHeight={bottomSheetHeight}
              onHeightChange={setBottomSheetHeight}
              defaultWidth={sideSheetWidth}
              onWidthChange={setSideSheetWidth}
              dockEdge={dockEdge}
              dockAlign={dockAlign}
            >
              {leftTool === "metrics" ? (
                <EditorMetricsPanel
                  onClose={closeLeftTool}
                  compact={dockEdge === "left"}
                />
              ) : leftTool === "variations" ? (
                <EditorVariationsPanel
                  variations={variations}
                  activeVariationId={activeVariationId}
                  onSelect={(id) => {
                    setActiveVariationId(id);
                    setCodeScope(id);
                    closeLeftTool();
                  }}
                  onVariationsChange={setVariations}
                  versionFoldKey={versionFoldKey}
                  onClose={closeLeftTool}
                  compact={dockEdge === "left"}
                />
              ) : (
                <EditorAddPanel
                  onClose={closeLeftTool}
                  compact={dockEdge === "left"}
                />
              )}
            </EditorBottomSheet>
            <EditorBottomDock
              mode={editorMode}
              onModeChange={handleModeChange}
              leftTool={leftTool}
              onToggleLeftTool={toggleLeftTool}
            />
          </div>
        </div>
        <div className="relative flex shrink-0 bg-background shadow-none">
          {!overlayDocked &&
            dockedIds.map((id) => renderPanel(id, false))}
          <EditorUtilityRail
            activeIds={openIds}
            onToggle={toggleSidePanel}
          />
        </div>
        {detachedIds.length > 0 && (
          <EditorFloatingPanelGroup
            pos={floatPos}
            onPosChange={setFloatPosAndSync}
            size={floatSize}
            onSizeChange={setFloatSize}
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
      </div>
    </div>
  );
}
