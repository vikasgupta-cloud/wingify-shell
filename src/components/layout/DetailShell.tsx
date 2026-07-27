import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import {
  Archive,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Download,
  Eraser,
  FileBarChart,
  GalleryVerticalEnd,
  HelpCircle,
  ListFilter,
  MoreHorizontal,
  PenLine,
  Printer,
  Rows3,
  Save,
  Search,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { getEntities, getFilters, isRealDataPath } from "../../config/entities";
import { mainNavCrumbPath, UTILITY_RAIL_WIDTH, resolveBreadcrumb } from "../../lib/nav";
import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StatusMenu from "@/components/ui/StatusMenu";
import { useConfigStore, useIsConfigDirty } from "../../store/config";
import { useWandzStore } from "../../store/wandz";
import { useRowsStore, useVisibleCampaigns } from "../../store/rows";
import {
  campaignLandingPath,
  CAMPAIGN_STATUSES,
  type Campaign,
} from "../../data/campaigns";
import PrimaryRail from "./PrimaryRail";

// The utility rail on the RIGHT of a detail surface: Ask Wandz (stub) at the top
// and Help pinned to the bottom. Configure/Reports now live in the header tabs.
// On Reports, DetailShell positions this absolutely below the sticky tab bar so
// the tabs themselves stay edge-to-edge.
function UtilityRail({ entityId }: { entityId?: string }) {
  const wandzOpen = useWandzStore((s) => s.open);

  const railButton = (active: boolean) =>
    cn(
      "flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted",
      active && "bg-accent text-foreground"
    );

  // Always close when already open (even if context is a section), so the rail
  // icon acts as a true toggle for the panel.
  const handleAskWandz = () => {
    const { open, closeWandz, openWandz } = useWandzStore.getState();
    if (open) closeWandz();
    else openWandz({ kind: "campaign", campaignId: entityId ?? "" });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <nav
        className="flex h-full shrink-0 flex-col items-center gap-3 border-l border-border bg-rail py-4"
        style={{ width: UTILITY_RAIL_WIDTH }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Ask Wandz"
              aria-pressed={wandzOpen}
              onClick={handleAskWandz}
              className={railButton(wandzOpen)}
            >
              <Sparkles className="h-[18px] w-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Ask Wandz</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label="Help" className={cn(railButton(false), "mt-auto")}>
              <HelpCircle className="h-[18px] w-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Help</TooltipContent>
        </Tooltip>
      </nav>
    </TooltipProvider>
  );
}

// The Configure/Reports switcher, now horizontal underline tabs in the header
// centre. The Scroll/Guided view toggle rides just ahead of the Configure tab
// (config surface only, per showViewToggle).
function SurfaceTabs({
  basePath,
  entityId,
  showViewToggle,
}: {
  basePath: string;
  entityId?: string;
  showViewToggle: boolean;
}) {
  const { pathname } = useLocation();
  const configPath = `${basePath}/c/${entityId}`;
  const reportsPath = `${configPath}/reports`;
  const onReports = pathname.endsWith("/reports");
  const onConfigure = !onReports;

  // Own-row tabs: py keeps the underline close under the label, and -mb-px drops
  // the border-b-2 onto the row's baseline so the active indicator hugs the label
  // and sits on the row's bottom line at the same time.
  const tab = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 border-b-2 px-0.5 py-2 -mb-px text-sm font-medium transition-colors",
      active
        ? "border-foreground text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground"
    );

  return (
    <div className="flex items-stretch gap-4">
      {/* Reserve the toggle slot on every surface so the tabs never shift when
          switching Configure↔Reports; it's hidden (not unmounted) off-config. */}
      <div className={cn("flex items-center", !showViewToggle && "invisible")}>
        <ViewToggle />
      </div>
      <Link
        to={configPath}
        aria-label="Configure"
        aria-current={onConfigure ? "page" : undefined}
        className={tab(onConfigure)}
      >
        <PenLine className="h-4 w-4" />
        Configure
      </Link>
      <Link
        to={reportsPath}
        aria-label="Reports"
        aria-current={onReports ? "page" : undefined}
        className={tab(onReports)}
      >
        <FileBarChart className="h-4 w-4" />
        Reports
      </Link>
    </div>
  );
}

// Scroll/Guided view toggle for the config surface. A single icon that previews
// the view you'll switch TO (so the header stays compact); bound to the
// session-only viewMode. Grayscale — a muted ghost icon button.
function ViewToggle() {
  const viewMode = useConfigStore((s) => s.viewMode);
  const setViewMode = useConfigStore((s) => s.setViewMode);
  const target = viewMode === "scroll" ? "guided" : "scroll";
  const TargetIcon = target === "guided" ? GalleryVerticalEnd : Rows3;
  const label = target === "guided" ? "Switch to Guided view" : "Switch to Scroll view";
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            onClick={() => setViewMode(target)}
            className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <TargetIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// The Save button in the actions cluster — disabled until the config is dirty.
function SaveButton({ entityId }: { entityId?: string }) {
  const dirty = useIsConfigDirty(entityId ?? "");
  const save = useConfigStore((s) => s.save);
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={!dirty}
            aria-label="Save"
            onClick={() => entityId && save(entityId)}
            className="h-8 w-8 transition-opacity duration-200"
          >
            <Save className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Save</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Filter the real campaign list by the active filter + search text, mapping each
// down to the entity-switcher's {id, name} shape. "All" is everything, "Recent" is
// a sort (10 most recently updated); any other value is a CampaignStatus to match.
function filterCampaigns(
  campaigns: Campaign[],
  filter: string,
  search: string
): { id: string; name: string }[] {
  let list = campaigns;
  if (filter === "Recent") {
    list = [...campaigns]
      .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
      .slice(0, 10);
  } else if (filter !== "All") {
    list = campaigns.filter((c) => c.status === filter);
  }
  const q = search.trim().toLowerCase();
  if (q) list = list.filter((c) => c.name.toLowerCase().includes(q));
  return list.map((c) => ({ id: c.id, name: c.name }));
}

// The kebab in the level-2 action cluster. Flush Data and Archive are disabled
// on a Draft; Delete Permanently confirms, removes the row, and returns to the list.
function KebabMenu({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();
  const archive = useRowsStore((s) => s.archive);
  const remove = useRowsStore((s) => s.remove);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isDraft = campaign.status === "Draft";

  return (
    <>
      <DropdownMenuRoot modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More actions" className="h-9 w-9">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={() => { /* TODO — Clone modal is a deferred prompt */ }}>
            <Copy />
            Clone
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { /* TODO — Timeline drawer is a deferred prompt */ }}>
            <Clock />
            Timeline
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => { /* TODO */ }}>
            <Share2 />
            Share
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Download />
              Download CSV
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => { /* TODO */ }}>Summary</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { /* TODO */ }}>Detailed</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem onSelect={() => { /* TODO */ }}>
            <Printer />
            Print
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={isDraft} onSelect={() => { /* TODO */ }}>
            <Eraser />
            Flush Data
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isDraft} onSelect={() => archive([campaign.id])}>
            <Archive />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDeleteOpen(true)}>
            <Trash2 />
            Delete Permanently
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete campaign?</DialogTitle>
            <DialogDescription>This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                remove([campaign.id]);
                setDeleteOpen(false);
                navigate("/web-experiment");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const EDGE_OPEN_DELAY_MS = 240;
const OVERLAY_CLOSE_GRACE_MS = 250;
/** Must match the [transition-duration:180ms] classes on the overlay scrim and panel. */
const OVERLAY_ANIM_MS = 180;

type DetailShellProps = {
  /** The leaf page path this detail surface belongs to, e.g. "/feature-management/holdouts". Defaults to the URL before "/c/". */
  basePath?: string;
  /** Route-dependent body rendered below the top bar. */
  children?: ReactNode;
};

// Level-2 shell: renders its own chrome, outside AppLayout. Level-1 navigation
// is revealed by dwelling on the left viewport edge (or pressing "[").
export default function DetailShell({ basePath: basePathProp, children }: DetailShellProps) {
  const { entityId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  // Animation pair: the overlay stays mounted (navRendered) while it slides
  // out, and the "shown" styles (navShown) lag mount by a frame so the
  // slide-in transition actually plays.
  const [navRendered, setNavRendered] = useState(false);
  const [navShown, setNavShown] = useState(false);
  const [entityOpen, setEntityOpen] = useState(false);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);

  // Fallback from the URL guards against a stale element tree (e.g. mid-HMR)
  // rendering this component without the prop.
  const basePath = basePathProp ?? pathname.split("/c/")[0];
  const onReports = pathname.endsWith("/reports");

  // Breadcrumb trail: main-nav label, plus the sub-nav label when basePath is a leaf.
  const { item, leaf, siblings } = resolveBreadcrumb(basePath);

  // /web-experiment resolves its entity switcher from the REAL campaign store so
  // the breadcrumb always agrees with the config page header. Every other
  // basePath keeps the dummy getEntities()/getFilters() lists unchanged.
  // TODO: migrate other sections to real data as they're built.
  const realData = isRealDataPath(basePath);
  const campaigns = useVisibleCampaigns();
  const [activeFilter, setActiveFilter] = useState("All");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [entitySearch, setEntitySearch] = useState("");

  const dummyEntities = getEntities(basePath);
  // Real-data paths expose every status; dummy sections keep their small chip set.
  const filters = realData
    ? ["All", "Recent", ...CAMPAIGN_STATUSES]
    : getFilters(basePath);

  // The real campaign backing this detail surface (real-data paths only) — drives
  // the breadcrumb name, the StatusMenu, and the kebab actions.
  const campaign = realData
    ? campaigns.find((c) => c.id === entityId) ?? campaigns[0]
    : undefined;

  // Entities listed in the switcher popover.
  const entities = realData
    ? filterCampaigns(campaigns, activeFilter, entitySearch)
    : dummyEntities;

  // The selected row shown in the breadcrumb trigger.
  const selected = realData
    ? campaign && { id: campaign.id, name: campaign.name }
    : dummyEntities.find((e) => e.id === entityId) ?? dummyEntities[0];

  const cancelOpen = () => window.clearTimeout(openTimer.current);
  const cancelScheduledClose = () => window.clearTimeout(closeTimer.current);
  const scheduleEdgeOpen = () => {
    cancelScheduledClose();
    window.clearTimeout(openTimer.current);
    // Dwell delay so brushing the edge doesn't open the overlay.
    openTimer.current = window.setTimeout(
      () => setNavOpen(true),
      EDGE_OPEN_DELAY_MS
    );
  };
  const scheduleOverlayClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(
      () => setNavOpen(false),
      OVERLAY_CLOSE_GRACE_MS
    );
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === "Escape") setNavOpen(false);
      else if (e.key === "[" && tag !== "INPUT" && tag !== "TEXTAREA")
        setNavOpen((open) => !open);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (navOpen) {
      setNavRendered(true);
      // Double rAF: let the browser commit the off-screen styles before
      // switching to the shown ones, so the transition runs.
      let raf2: number | undefined;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setNavShown(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2 !== undefined) cancelAnimationFrame(raf2);
      };
    }
    setNavShown(false);
    const unmountTimer = window.setTimeout(
      () => setNavRendered(false),
      OVERLAY_ANIM_MS
    );
    return () => window.clearTimeout(unmountTimer);
  }, [navOpen]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            aria-label="Go to Home dashboard"
            onClick={() => navigate("/home/dashboard")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-rail-active text-sm font-bold text-rail-active-foreground"
          >
            W
          </button>

          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Link
              to={mainNavCrumbPath(basePath)}
              className="flex items-center gap-1.5 truncate rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item?.icon && (
                <item.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              )}
              {item?.label ?? basePath}
            </Link>
            {leaf && (
              <>
                <span className="text-muted-foreground">/</span>
                <DropdownMenu.Root modal={false}>
                  <DropdownMenu.Trigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span className="truncate">{leaf.label}</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="start"
                      sideOffset={6}
                      className="z-50 min-w-[220px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
                    >
                      {siblings.map((sibling) => (
                        <DropdownMenu.Item key={sibling.path} asChild>
                          {/* Plain-string className: Radix Slot can't merge NavLink's function form */}
                          <NavLink
                            to={sibling.path}
                            className={cn(
                              "block cursor-pointer rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-accent",
                              sibling.path === leaf.path && "bg-accent font-medium"
                            )}
                          >
                            {sibling.label}
                          </NavLink>
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </>
            )}
            <span className="text-muted-foreground">/</span>
            <Popover.Root
              open={entityOpen}
              onOpenChange={(o) => {
                setEntityOpen(o);
                if (!o) setFilterMenuOpen(false);
              }}
            >
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <span className="truncate">{selected?.name ?? "Untitled"}</span>
                  <span className="font-normal text-muted-foreground">
                    #{selected?.id}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  align="start"
                  sideOffset={6}
                  className="z-50 w-[300px] rounded-md border border-border bg-popover p-2 text-sm text-popover-foreground shadow-lg"
                >
                  {/* Real-data paths wire search + a status filter; others stay visual-only. */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
                      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search…"
                        value={realData ? entitySearch : undefined}
                        onChange={realData ? (e) => setEntitySearch(e.target.value) : undefined}
                        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                    {realData && (
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          title="Filter by status"
                          aria-label="Filter by status"
                          aria-expanded={filterMenuOpen}
                          onClick={() => setFilterMenuOpen((o) => !o)}
                          className={cn(
                            "flex items-center justify-center rounded-md border border-input p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                            activeFilter !== "All" &&
                              "border-transparent bg-secondary text-secondary-foreground"
                          )}
                        >
                          <ListFilter className="h-4 w-4" />
                        </button>
                        {filterMenuOpen && (
                          <div className="absolute right-0 top-full z-10 mt-1 max-h-64 w-44 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-lg">
                            {filters.map((filter) => (
                              <button
                                key={filter}
                                type="button"
                                onClick={() => {
                                  setActiveFilter(filter);
                                  setFilterMenuOpen(false);
                                }}
                                className={cn(
                                  "flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted",
                                  activeFilter === filter && "font-medium"
                                )}
                              >
                                {filter}
                                {activeFilter === filter && (
                                  <Check className="h-4 w-4 shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex max-h-64 flex-col gap-0.5 overflow-y-auto">
                    {entities.map((entity) => (
                      <button
                        key={entity.id}
                        type="button"
                        onClick={() => {
                          // Real campaigns land on Reports or Configuration by status;
                          // dummy sections keep their plain detail path.
                          const target = realData
                            ? campaignLandingPath({
                                id: entity.id,
                                status:
                                  campaigns.find((c) => c.id === entity.id)?.status ??
                                  "Draft",
                              })
                            : `${basePath}/c/${entity.id}`;
                          navigate(target);
                          setEntityOpen(false);
                        }}
                        className={cn(
                          "flex items-baseline gap-2 rounded-sm px-2.5 py-2 text-left transition-colors hover:bg-muted",
                          entity.id === selected?.id && "bg-accent font-medium"
                        )}
                      >
                        <span className="truncate">{entity.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          #{entity.id}
                        </span>
                      </button>
                    ))}
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

          </div>
        </div>

        {/* Center switcher: Configure/Reports tabs bottom-aligned to the bar so
            the active underline sits on the header's own bottom border. Middle
            column of the three-column bar → stays centered while the breadcrumb
            truncates in its own column. */}
        <div className="flex shrink-0 items-end justify-center self-stretch">
          <SurfaceTabs
            basePath={basePath}
            entityId={entityId}
            showViewToggle={Boolean(campaign) && !pathname.endsWith("/reports")}
          />
        </div>

        {/* Actions slot: Save, the full StatusMenu, and the kebab. Create lives on
            the list pages only. Status + kebab need a real campaign. */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <SaveButton entityId={entityId} />
          {campaign && <StatusMenu campaign={campaign} triggerVariant="button" />}
          {campaign && <KebabMenu campaign={campaign} />}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main
          className={cn(
            "min-h-0 flex-1",
            // Both branches make <main> a flex container so the inner flex-1
            // wrapper resolves to a real height. Without flex here the inner
            // flex-1 collapses to content height, which left full-height
            // children like Workflow Mode with no room to render.
            // Reports: relative so the utility rail can sit below the full-bleed
            // sticky tabs without shrinking the tab bar.
            onReports ? "relative overflow-hidden" : "flex flex-col overflow-y-auto"
          )}
        >
          <div
            className={cn(
              "min-h-0",
              onReports ? "h-full overflow-y-auto" : "flex-1"
            )}
          >
            {children}
          </div>
          {onReports ? (
            <div
              className="absolute bottom-0 right-0 top-14 z-30"
              style={{ width: UTILITY_RAIL_WIDTH }}
            >
              <UtilityRail entityId={entityId} />
            </div>
          ) : null}
        </main>
        {!onReports ? <UtilityRail entityId={entityId} /> : null}
      </div>

      {/* Edge-reveal hotzone: dwell on the left viewport edge to open the nav overlay. */}
      <div
        className="fixed inset-y-0 left-0 z-40 w-3"
        onMouseEnter={scheduleEdgeOpen}
        onMouseLeave={cancelOpen}
      />

      {navRendered &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 z-50",
              !navShown && "pointer-events-none"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-foreground transition-opacity [transition-duration:180ms] ease-out",
                navShown ? "opacity-20" : "opacity-0"
              )}
              onClick={() => setNavOpen(false)}
            />
            <div
              className={cn(
                "absolute inset-y-0 left-0 flex bg-background shadow-xl transition-transform [transition-duration:180ms] ease-out motion-reduce:transition-none",
                navShown ? "translate-x-0" : "-translate-x-full"
              )}
              onMouseEnter={cancelScheduledClose}
              onMouseLeave={scheduleOverlayClose}
              onClick={(e) => {
                // Any nav item click (rail button or sub-nav link) navigates, then closes.
                const target = e.target as HTMLElement;
                if (target.closest("a") || target.closest("nav button")) {
                  setNavOpen(false);
                }
              }}
            >
              <PrimaryRail forceFlyout />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
