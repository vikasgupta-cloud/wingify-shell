import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import {
  Archive,
  ChevronDown,
  Clock,
  Copy,
  Download,
  Eraser,
  FileBarChart,
  MoreHorizontal,
  PenLine,
  Printer,
  Save,
  Search,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { getEntities, getFilters, isRealDataPath } from "../../config/entities";
import { mainNavCrumbPath, resolveBreadcrumb } from "../../lib/nav";
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
import type { Campaign } from "../../data/campaigns";
import PrimaryRail from "./PrimaryRail";

// The vertical icon rail on the left of a detail surface: Ask Wandz (stub),
// Configure, and Reports. Split out so DetailShell's body stays readable.
function IconRail({ basePath, entityId }: { basePath: string; entityId?: string }) {
  const { pathname } = useLocation();
  const configPath = `${basePath}/c/${entityId}`;
  const reportsPath = `${configPath}/reports`;
  const onReports = pathname.endsWith("/reports");
  const onConfigure = !onReports;
  const wandzOpen = useWandzStore((s) => s.open);
  const openWandz = useWandzStore((s) => s.openWandz);

  const railButton = (active: boolean) =>
    cn(
      "flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
      active && "bg-accent text-foreground"
    );

  return (
    <TooltipProvider delayDuration={200}>
      <nav className="flex w-14 shrink-0 flex-col items-center gap-4 border-r border-border bg-background pt-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Ask Wandz"
              onClick={() => openWandz({ kind: "campaign", campaignId: entityId ?? "" })}
              className={railButton(wandzOpen)}
            >
              <Sparkles className="h-[18px] w-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Ask Wandz</TooltipContent>
        </Tooltip>

        <div className="h-px w-6 bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={configPath} aria-label="Configure" className={railButton(onConfigure)}>
              <PenLine className="h-[18px] w-[18px]" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Configure</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={reportsPath} aria-label="Reports" className={railButton(onReports)}>
              <FileBarChart className="h-[18px] w-[18px]" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Reports</TooltipContent>
        </Tooltip>
      </nav>
    </TooltipProvider>
  );
}

// The Save button in the actions cluster — disabled until the config is dirty.
function SaveButton({ entityId }: { entityId?: string }) {
  const dirty = useIsConfigDirty(entityId ?? "");
  const save = useConfigStore((s) => s.save);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!dirty}
      onClick={() => entityId && save(entityId)}
      className="transition-opacity duration-200"
    >
      <Save className="h-4 w-4" />
      Save
    </Button>
  );
}

// Filter the real campaign list by the active chip + search text, mapping each
// down to the entity-switcher's {id, name} shape. "Recent" is a sort (10 most
// recently updated), not a status; the others match campaign.status.
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
  } else if (filter === "Running") {
    list = campaigns.filter((c) => c.status === "Running");
  } else if (filter === "Drafts") {
    list = campaigns.filter((c) => c.status === "Draft");
  } else if (filter === "Paused") {
    list = campaigns.filter((c) => c.status === "Paused");
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
/** Must match the duration-[180ms] classes on the overlay scrim and panel. */
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

  // Breadcrumb trail: main-nav label, plus the sub-nav label when basePath is a leaf.
  const { item, leaf, siblings } = resolveBreadcrumb(basePath);

  // /web-experiment resolves its entity switcher from the REAL campaign store so
  // the breadcrumb always agrees with the config page header. Every other
  // basePath keeps the dummy getEntities()/getFilters() lists unchanged.
  // TODO: migrate other sections to real data as they're built.
  const realData = isRealDataPath(basePath);
  const campaigns = useVisibleCampaigns();
  const [activeFilter, setActiveFilter] = useState("All");
  const [entitySearch, setEntitySearch] = useState("");

  const dummyEntities = getEntities(basePath);
  const filters = getFilters(basePath);

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
        <div className="flex min-w-0 items-center gap-2">
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
            <Popover.Root open={entityOpen} onOpenChange={setEntityOpen}>
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
                  {/* Real-data paths wire search + chips; others stay visual-only. */}
                  <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
                    <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search…"
                      value={realData ? entitySearch : undefined}
                      onChange={realData ? (e) => setEntitySearch(e.target.value) : undefined}
                      className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {filters.map((filter, i) => {
                      const chipActive = realData ? filter === activeFilter : i === 0;
                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => realData && setActiveFilter(filter)}
                          className={cn(
                            "rounded-full border border-input px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted",
                            chipActive &&
                              "border-transparent bg-secondary font-medium text-secondary-foreground"
                          )}
                        >
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex max-h-64 flex-col gap-0.5 overflow-y-auto">
                    {entities.map((entity) => (
                      <button
                        key={entity.id}
                        type="button"
                        onClick={() => {
                          navigate(`${basePath}/c/${entity.id}`);
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

        {/* Actions slot: Save, the full StatusMenu, and the kebab. Create lives on
            the list pages only. Status + kebab need a real campaign. */}
        <div className="flex shrink-0 items-center gap-2">
          <SaveButton entityId={entityId} />
          {campaign && <StatusMenu campaign={campaign} />}
          {campaign && <KebabMenu campaign={campaign} />}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <IconRail basePath={basePath} entityId={entityId} />
        <main className="flex-1 overflow-y-auto">{children}</main>
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
                "absolute inset-0 bg-foreground transition-opacity duration-[180ms] ease-out",
                navShown ? "opacity-20" : "opacity-0"
              )}
              onClick={() => setNavOpen(false)}
            />
            <div
              className={cn(
                "absolute inset-y-0 left-0 flex bg-background shadow-xl transition-transform duration-[180ms] ease-out motion-reduce:transition-none",
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
