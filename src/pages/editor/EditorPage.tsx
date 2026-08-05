import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Pencil, Sparkles } from "lucide-react";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import {
  EditorVariationBar,
  type CodeScopeId,
  type VariationId,
} from "@/components/editor/EditorVariationBar";
import { EditorToolRail } from "@/components/editor/EditorToolRail";
import {
  EditorCanvas,
  EDITOR_PREVIEW_SRC,
  type EditorMode,
} from "@/components/editor/EditorCanvas";
import { EditorNavigateBar } from "@/components/editor/EditorNavigateBar";
import { EditorCodeWorkspace } from "@/components/editor/EditorCodeWorkspace";
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
import { useVisibleCampaigns } from "@/store/rows";

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

const CODE_SCOPE_LABEL: Record<CodeScopeId, string> = {
  campaign: "Campaign code",
  control: "Control",
  v1: "Variation 01",
  v2: "Variation 02",
};

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

  const campaigns = useVisibleCampaigns();
  const campaign = campaigns.find((c) => c.id === entityId);

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
  const [editorMode, setEditorMode] = useState<EditorMode>("design");
  const [previewSrc, setPreviewSrc] = useState(EDITOR_PREVIEW_SRC);
  const [previewUrlLabel, setPreviewUrlLabel] = useState(EDITOR_PREVIEW_SRC);
  const [navHistory, setNavHistory] = useState<string[]>([EDITOR_PREVIEW_SRC]);
  const [navIndex, setNavIndex] = useState(0);
  const [activeVariationId, setActiveVariationId] =
    useState<VariationId>("v1");
  const [codeScope, setCodeScope] = useState<CodeScopeId>("v1");

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
      setLeftTool(null);
    }
  }, [activeVariationId]);

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

  const openSidePanel = useCallback((id: EditorSidePanelId) => {
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
      next[id] = { ...next[id], open: true };
      return next;
    });
    setActiveTab(id);
  }, []);

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
      className="flex h-screen flex-col overflow-hidden bg-background text-foreground"
      data-campaign-id={entityId}
      data-variation-id={variationId}
      data-scenario={scenarioId}
      data-editor-shell
    >
      <EditorTopBar
        campaignName={campaign?.name}
        status={campaign?.status}
        scenarioId={scenarioId}
        onScenarioChange={applyScenario}
        mode={editorMode}
        onModeChange={handleModeChange}
      />
      <div className="flex min-h-0 flex-1">
        <EditorToolRail activeTool={leftTool} onSelect={toggleLeftTool} />
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <EditorVariationBar
            layoutMode={layoutMode}
            device={device}
            onDeviceChange={(d) => {
              setDevice(d);
              setShowDimensionsBar(d !== "desktop");
            }}
            activeVariationId={activeVariationId}
            onVariationChange={setActiveVariationId}
            codeMode={editorMode === "code"}
            codeScope={codeScope}
            onCodeScopeChange={setCodeScope}
          />
          {editorMode === "navigate" && (
            <EditorNavigateBar
              url={previewUrlLabel}
              canGoBack={navIndex > 0}
              canGoForward={navIndex < navHistory.length - 1}
              onUrlChange={setPreviewUrlLabel}
              onGo={(url) =>
                navigatePreview(resolvePreviewSrc(url, previewSrc))
              }
              onBack={goBack}
              onForward={goForward}
              onRefresh={refreshPreview}
              onSwitchToDesign={() => setEditorMode("design")}
            />
          )}
          <div className="relative min-h-0 flex-1 overflow-hidden">
            {leftPanel && leftTool && (
              <div className="absolute inset-y-0 left-0 z-20 flex">
                <EditorLeftOverlay
                  key={leftTool}
                  defaultWidth={
                    leftTool === "add" || leftTool === "metrics" ? 440 : 300
                  }
                >
                  {leftPanel}
                </EditorLeftOverlay>
              </div>
            )}
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              {editorMode === "code" ? (
                <EditorCodeWorkspace
                  scopeLabel={CODE_SCOPE_LABEL[codeScope]}
                  onDone={() => setEditorMode("design")}
                />
              ) : (
                <EditorCanvas
                  src={previewSrc}
                  device={device}
                  mode={editorMode}
                  showDimensionsBar={
                    showDimensionsBar && editorMode === "design"
                  }
                  selection={selection}
                  onSelect={setSelection}
                  onClearSelection={() => setSelection(null)}
                  onOpenEdition={() => openSidePanel("edition")}
                  onOpenCopilot={() => openSidePanel("copilot")}
                  showSubtestPopover={
                    showSubtestPopover && editorMode === "design"
                  }
                  onDismissSubtest={() => setShowSubtestPopover(false)}
                  onLocationChange={handleLocationChange}
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 bg-background shadow-none">
          {dockedIds.map((id) => renderPanel(id, false))}
          <EditorUtilityRail activeIds={openIds} onToggle={toggleSidePanel} />
        </div>
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
      </div>
    </div>
  );
}
