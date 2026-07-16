import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, Plus, Search } from "lucide-react";
import { getEntities, getFilters } from "../../config/entities";
import { mainNavCrumbPath, resolveBreadcrumb } from "../../lib/nav";
import { cn } from "../../lib/utils";
import PrimaryRail from "./PrimaryRail";

const EDGE_OPEN_DELAY_MS = 240;
const OVERLAY_CLOSE_GRACE_MS = 250;
/** Must match the duration-[180ms] classes on the overlay scrim and panel. */
const OVERLAY_ANIM_MS = 180;

type DetailShellProps = {
  /** The leaf page path this detail surface belongs to, e.g. "/feature-management/holdouts". Defaults to the URL before "/c/". */
  basePath?: string;
};

// Level-2 shell: renders its own chrome, outside AppLayout. Level-1 navigation
// is revealed by dwelling on the left viewport edge (or pressing "[").
export default function DetailShell({ basePath: basePathProp }: DetailShellProps) {
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
  const entities = getEntities(basePath);
  const filters = getFilters(basePath);
  // Seed selection from the URL, falling back to the first dummy entity.
  const selected = entities.find((e) => e.id === entityId) ?? entities[0];

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
                  {/* Search + filter chips are visual-only for now. */}
                  <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
                    <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search…"
                      className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {filters.map((filter, i) => (
                      <button
                        key={filter}
                        type="button"
                        className={cn(
                          "rounded-full border border-input px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted",
                          i === 0 &&
                            "border-transparent bg-secondary font-medium text-secondary-foreground"
                        )}
                      >
                        {filter}
                      </button>
                    ))}
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

        {/* Actions slot — global for now; swap per-page later. */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            Create
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <h1 className="pt-10 pl-12 text-3xl font-semibold tracking-tight text-foreground">
          {selected?.name ?? `Entity ${entityId}`}
        </h1>
      </main>

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
