// Full-tab heatmap viewer — opens from Insights → Heatmaps → View Heatmap.
// The preview site renders in an iframe; each visualization paints its own
// overlay on top and swaps the toolbar's scope control and footer readout.

import { useMemo, useState, type ReactElement, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronsUpDown,
  Compass,
  Eye,
  FileText,
  FlaskConical,
  Flame,
  Funnel,
  Info,
  LayoutGrid,
  List,
  Monitor,
  MoreVertical,
  MousePointerClick,
  RefreshCw,
  Target,
  Wand2,
  ExternalLink,
  type LucideIcon,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { EDITOR_PREVIEW_SRC } from "@/components/editor/EditorCanvas";
import { DEFAULT_MASCOT_ID, mascotAsset } from "@/config/mascots";
import { useThemeStore } from "@/store/theme";
import {
  useHeatmapsStore,
  visibleClicks,
  visibleFriction,
  visibleHovers,
} from "@/store/heatmaps";
import {
  FRICTION_TYPE_IDS,
  FRICTION_TYPE_LABELS,
  METRIC_PRESETS,
} from "@/data/heatmapViewer";
import {
  CampaignDialog,
  ObservationPins,
  ClickScopePanel,
  FiltersPanel,
  FrictionScopePanel,
  HoverScopePanel,
  MetricsPanel,
  ObservationLayer,
  PagesDialog,
  SettingsPanel,
  WandzReportPanel,
} from "@/components/heatmap/HeatmapToolbarPanels";
import {
  ClickAreaOverlay,
  EditZonesLayer,
  ClickmapOverlay,
  ElementListOverlay,
  FrictionmapOverlay,
  HeatmapOverlay,
  HovermapOverlay,
  ScrollmapOverlay,
  ZonalmapOverlay,
} from "@/components/heatmap/HeatmapOverlays";

const HEATMAP_TYPES = [
  { id: "heatmap", label: "Heatmap", icon: Flame },
  { id: "clickmap", label: "Clickmap", icon: MousePointerClick },
  { id: "click-area", label: "Click area", icon: Target },
  { id: "hovermap", label: "Hovermap", icon: MousePointerClick, isNew: true },
  { id: "scrollmap", label: "Scrollmap", icon: ChevronsUpDown },
  { id: "zonalmap", label: "Zonalmap", icon: BarChart3 },
  { id: "element-list", label: "Element list", icon: List },
  { id: "frictionmap", label: "Frictionmap", icon: Activity },
] as const;

type HeatmapTypeId = (typeof HEATMAP_TYPES)[number]["id"];

const TYPE_IDS = new Set<string>(HEATMAP_TYPES.map((t) => t.id));

function parseType(value: string | null): HeatmapTypeId {
  if (value && TYPE_IDS.has(value)) return value as HeatmapTypeId;
  return "heatmap";
}

/** Which panel a scope control opens — each is a distinct popover body. */
type ScopePanelId = "clicks" | "hovers" | "friction" | "metrics";

type ScopeControl = {
  icon: LucideIcon;
  label: string;
  panel: ScopePanelId;
};

type ViewerConfig = {
  overlay: () => ReactElement;
  /** Second toolbar control — scrollmap has no scope to narrow. */
  scope?: ScopeControl;
  /** Extra controls only some visualizations expose. */
  extras?: ScopeControl[];
  /** What the footer readout counts for this visualization. */
  readout: "clicks" | "hovers" | "friction" | "views" | "none";
  editZones?: boolean;
  showInfo?: boolean;
};

const ALL_CLICKS: ScopeControl = {
  icon: Wand2,
  label: "All clicks",
  panel: "clicks",
};

const VIEWER_CONFIG: Record<HeatmapTypeId, ViewerConfig> = {
  heatmap: {
    overlay: HeatmapOverlay,
    scope: ALL_CLICKS,
    readout: "clicks",
  },
  clickmap: {
    overlay: ClickmapOverlay,
    scope: ALL_CLICKS,
    readout: "clicks",
  },
  "click-area": {
    overlay: ClickAreaOverlay,
    scope: ALL_CLICKS,
    readout: "clicks",
  },
  hovermap: {
    overlay: HovermapOverlay,
    scope: { icon: Target, label: "Hover scope", panel: "hovers" },
    readout: "hovers",
  },
  scrollmap: {
    overlay: ScrollmapOverlay,
    readout: "views",
  },
  zonalmap: {
    overlay: ZonalmapOverlay,
    scope: ALL_CLICKS,
    extras: [
      { icon: BarChart3, label: "Click distribution", panel: "metrics" },
    ],
    readout: "none",
    editZones: true,
    showInfo: true,
  },
  "element-list": {
    overlay: ElementListOverlay,
    scope: ALL_CLICKS,
    readout: "clicks",
  },
  frictionmap: {
    overlay: FrictionmapOverlay,
    scope: {
      icon: Wand2,
      label: "Rage, Dead, Error Clicks",
      panel: "friction",
    },
    readout: "friction",
  },
};

/** A scope pill shows what it's currently narrowed to, not a static label. */
function scopeLabel(
  control: ScopeControl,
  s: ReturnType<typeof useHeatmapsStore.getState>
): string {
  if (control.panel === "clicks") {
    return s.clickScope === "first"
      ? `First ${s.firstNClicks} click${s.firstNClicks === 1 ? "" : "s"}`
      : "All clicks";
  }
  if (control.panel === "friction") {
    if (s.frictionTypes.length === FRICTION_TYPE_IDS.length) {
      return "Rage, Dead, Error Clicks";
    }
    return s.frictionTypes.map((t) => FRICTION_TYPE_LABELS[t]).join(", ");
  }
  return control.label;
}

/** Shared pill styling — one place so every toolbar control matches. */
const PILL =
  "h-8 gap-1.5 rounded-[4px] px-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground";

const ICON_BUTTON =
  "size-8 rounded-[4px] text-foreground/80 transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground";

/** Popover body chrome — the panels themselves only supply content. */
const PANEL = "w-auto overflow-hidden rounded-[4px] p-0 shadow-2xl";

/**
 * Toolbar pill that opens a panel. Owns the open state so the panel's own
 * Cancel / Apply can dismiss it — a panel shouldn't have to know it's in a
 * popover, so it just receives `close`.
 */
function PanelPopover({
  icon: Icon,
  label,
  align = "start",
  render,
}: {
  icon: LucideIcon;
  label: string;
  align?: "start" | "center" | "end";
  render: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" className={PILL}>
          <Icon className="size-4" aria-hidden />
          <span className="max-w-[13rem] truncate">{label}</span>
          <ChevronDown
            className={cn(
              "size-3.5 opacity-60 transition-transform",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} side="top" sideOffset={10} className={PANEL}>
        {render(() => setOpen(false))}
      </PopoverContent>
    </Popover>
  );
}

/** Icon-only control with a tooltip, matching the product's bare toolbar. */
function ToolbarIconButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-pressed={active}
          onClick={onClick}
          className={cn(ICON_BUTTON, active && "bg-muted text-foreground")}
        >
          <Icon className="size-4" aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export default function HeatmapViewerPage() {
  const [params] = useSearchParams();
  const colorMode = useThemeStore((s) => s.colorMode);
  const heatmaps = useHeatmapsStore();
  // The URL wins on first load (a viewer opened in a new tab carries its own
  // selection); after that the toolbar drives the store.
  const [typeId, setTypeId] = useState<HeatmapTypeId>(() =>
    parseType(params.get("viz") ?? heatmaps.visualization)
  );
  const [typesOpen, setTypesOpen] = useState(true);
  const [tourOpen, setTourOpen] = useState(true);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [wandzOpen, setWandzOpen] = useState(false);
  const [observing, setObserving] = useState(false);
  const [editingZones, setEditingZones] = useState(false);
  /** Navigate mode drops the overlay so the page can be browsed underneath. */
  const [navigating, setNavigating] = useState(false);

  const activeType = useMemo(
    () => HEATMAP_TYPES.find((t) => t.id === typeId) ?? HEATMAP_TYPES[0],
    [typeId]
  );
  const config = VIEWER_CONFIG[typeId];
  const Overlay = config.overlay;
  const ActiveIcon = activeType.icon;

  const selectType = (id: HeatmapTypeId) => {
    setTypeId(id);
    heatmaps.setVisualization(id);
    setTypesOpen(false);
    setTourOpen(false);
    setEditingZones(false);
  };

  const readout = (() => {
    switch (config.readout) {
      case "clicks":
        return `Currently showing ${visibleClicks(heatmaps)} clicks`;
      case "hovers":
        return `Currently showing ${visibleHovers()} hover events`;
      case "friction":
        return `Currently showing ${visibleFriction(heatmaps)} clicks`;
      case "views":
        return "Total Views: 753";
      default:
        return "";
    }
  })();

  const scopePanel = (panel: ScopePanelId, close: () => void) => {
    if (panel === "hovers") return <HoverScopePanel onClose={close} />;
    if (panel === "friction") return <FrictionScopePanel onClose={close} />;
    if (panel === "metrics") return <MetricsPanel onClose={close} />;
    return <ClickScopePanel onClose={close} />;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative h-full w-full overflow-hidden bg-background">
        <iframe
          title="Website preview"
          // External URLs can't be framed, so anything the user typed falls
          // back to the bundled preview site — the same one the editor uses.
          src={heatmaps.url.startsWith("/") ? heatmaps.url : EDITOR_PREVIEW_SRC}
          className="absolute inset-0 h-full w-full border-0"
        />

        {/* Overlays own their own dimming — a clickmap reads on the live page,
            a density map needs the scrim. Keyed so state resets per type. */}
        {!navigating && !editingZones ? (
          <div className="absolute inset-x-0 bottom-14 top-0 z-10">
            <Overlay key={typeId} />
          </div>
        ) : null}

        {editingZones ? <EditZonesLayer /> : null}
        {!navigating ? <ObservationPins /> : null}
        {wandzOpen ? (
          <div className="absolute inset-x-0 bottom-14 top-0 z-30">
            <WandzReportPanel onClose={() => setWandzOpen(false)} />
          </div>
        ) : null}
        {/* Last so an observation being placed sits above the report panel. */}
        {observing ? (
          <ObservationLayer
            viz={activeType.label}
            onExit={() => setObserving(false)}
          />
        ) : null}

        <PagesDialog open={pagesOpen} onOpenChange={setPagesOpen} />
        <CampaignDialog open={campaignOpen} onOpenChange={setCampaignOpen} />

        <div className="absolute inset-x-0 bottom-0 z-40">
          {editingZones ? (
            <div className="flex items-center justify-between gap-4 border-t border-border bg-secondary px-5 py-2.5 text-sm text-secondary-foreground">
              <p>Edit mode: Hover and click over any part of the page to create zones.</p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  Reset
                </Button>
                <span className="text-border" aria-hidden>
                  |
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingZones(false)}
                >
                  Exit Edit Mode
                </Button>
                <span className="text-border" aria-hidden>
                  |
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingZones(false)}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : null}


          {tourOpen ? (
            <div className="absolute bottom-[calc(100%+52px)] left-[300px] w-[288px] rounded-xl border border-border bg-background p-4 shadow-2xl">
              <span
                className="absolute -left-1.5 top-8 size-3 rounded-full bg-warning-solid ring-4 ring-warning-bg"
                aria-hidden
              />
              <p className="text-sm font-semibold text-foreground">
                Heatmap Types
              </p>
              <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                Explore different visualizations to understand how users interact
                with your page.
              </p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-link hover:text-link-hover"
              >
                Learn more
                <ExternalLink className="size-3.5" aria-hidden />
              </button>
              <div className="mt-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-muted-foreground"
                  onClick={() => setTourOpen(false)}
                >
                  Skip
                </Button>
                <Button type="button" size="sm" onClick={() => setTourOpen(false)}>
                  Next
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex h-14 items-center gap-1 border-t border-border bg-background px-4 text-foreground">
            <img
              // The bar now matches the app surface, so the mark takes the
              // same-mode asset to stay legible.
              src={mascotAsset(DEFAULT_MASCOT_ID, colorMode)}
              alt="Wingify"
              className="mr-3 h-6 w-auto shrink-0"
            />

            <Popover open={typesOpen} onOpenChange={setTypesOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" className={PILL}>
                  <ActiveIcon className="size-4" aria-hidden />
                  {activeType.label}
                  <ChevronDown
                    className={cn(
                      "size-3.5 opacity-60 transition-transform",
                      typesOpen && "rotate-180"
                    )}
                    aria-hidden
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="top"
                sideOffset={10}
                className="w-[230px] overflow-hidden rounded-[4px] p-0 py-1.5 shadow-2xl"
              >
                {HEATMAP_TYPES.map((item) => {
                  const Icon = item.icon;
                  const selected = item.id === typeId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectType(item.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted",
                        selected && "bg-muted font-medium"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          selected ? "text-foreground" : "text-muted-foreground"
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">{item.label}</span>
                      {"isNew" in item && item.isNew ? (
                        <span className="rounded-md bg-success-bg px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-success-fg">
                          New
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </PopoverContent>
            </Popover>

            {config.scope ? (
              <PanelPopover
                icon={config.scope.icon}
                label={scopeLabel(config.scope, heatmaps)}
                render={(close) => scopePanel(config.scope!.panel, close)}
              />
            ) : null}
            {config.extras?.map((extra) => (
              <PanelPopover
                key={extra.label}
                icon={extra.icon}
                label={
                  extra.panel === "metrics"
                    ? METRIC_PRESETS.find((m) => m.id === heatmaps.metricId)
                        ?.label ?? extra.label
                    : extra.label
                }
                render={(close) => scopePanel(extra.panel, close)}
              />
            ))}
            {config.editZones ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingZones(true)}
                className={cn(PILL, editingZones && "bg-muted")}
              >
                <LayoutGrid className="size-4" aria-hidden />
                Edit zones
              </Button>
            ) : null}

            <PanelPopover
              icon={Funnel}
              label={
                heatmaps.dateLabel === "Last 30 days" &&
                heatmaps.segment === "All Visitors"
                  ? "Filters"
                  : `${heatmaps.dateLabel} · ${heatmaps.segment}`
              }
              align="center"
              render={(close) => <FiltersPanel onClose={close} />}
            />

            <Button
              type="button"
              variant="ghost"
              className={PILL}
              onClick={() => setPagesOpen(true)}
            >
              <FileText className="size-4" aria-hidden />
              {heatmaps.pageRule ? "Pages (1)" : "Pages"}
              <ChevronDown className="size-3.5 opacity-60" aria-hidden />
            </Button>

            <span className="mx-2 h-5 w-px shrink-0 bg-border" aria-hidden />

            <div className="hidden items-center gap-0.5 xl:flex">
              <ToolbarIconButton
                icon={FlaskConical}
                label="Campaign heatmaps"
                active={campaignOpen || heatmaps.campaignTypeId !== null}
                onClick={() => setCampaignOpen(true)}
              />
              <ToolbarIconButton
                icon={Compass}
                label="Navigate"
                active={navigating}
                onClick={() => setNavigating((v) => !v)}
              />
              <ToolbarIconButton icon={RefreshCw} label="Refresh" />
              <ToolbarIconButton
                icon={Eye}
                label="Observations"
                active={observing}
                onClick={() => setObserving((v) => !v)}
              />
              <ToolbarIconButton icon={Monitor} label="Device" />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setWandzOpen((v) => !v)}
                className={cn(PILL, wandzOpen && "bg-muted text-foreground")}
              >
                <Wand2 className="size-4" aria-hidden />
                Wandz
              </Button>
            </div>

            <p className="ml-auto shrink-0 pl-3 text-sm italic text-muted-foreground">
              {readout}
            </p>
            {config.showInfo ? (
              <ToolbarIconButton icon={Info} label="About zones" />
            ) : null}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Settings"
                  className={ICON_BUTTON}
                >
                  <MoreVertical className="size-4" aria-hidden />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                side="top"
                sideOffset={10}
                className={PANEL}
              >
                <SettingsPanel />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
