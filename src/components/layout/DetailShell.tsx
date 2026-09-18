import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import {
  Archive,
  ArrowLeft,
  Check,
  ChevronDown,
  CircleMinus,
  Copy,
  CopyPlus,
  Download,
  Eraser,
  FileBarChart,
  Flag,
  GalleryVerticalEnd,
  Globe,
  History,
  LayoutGrid,
  LineChart,
  Link2,
  ListFilter,
  MoreVertical,
  PenLine,
  Pencil,
  Plus,
  Printer,
  Rows3,
  // Save, // @undo — Save removed from WE detail header cluster
  Search,
  Share2,
  Sparkles,
  Star,
  Target,
  Trash2,
} from "@/components/icons/protoLucide";
import { TYPE_ICONS } from "@/components/icons/campaignTypeIcons";
import { getEntities, getFilters, isRealDataPath } from "../../config/entities";
import {
  ANALYTICS_BROWSE_BASE,
  ANALYTICS_ITEMS,
  ANALYTICS_OVERVIEW_BASE,
  ANALYTICS_RECENT,
  analyticsItemPath,
  analyticsListLabel,
  analyticsReportNavPath,
  getAnalyticsItem,
  getAnalyticsParentBoard,
  getReportsForBoard,
  isAnalyticsListBase,
  mapAnalyticsNameOverrides,
  withAnalyticsNameOverride,
} from "@/data/analyticsOverview";
import { useAnalyticsRowsStore } from "@/store/analyticsRows";
import { mainNavCrumbPath, UTILITY_RAIL_WIDTH, resolveBreadcrumb } from "../../lib/nav";
import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { useConfigStore } from "../../store/config";
// @undo — Save removed from WE detail header; useIsConfigDirty unused while Save is gone.
// import { useConfigStore, useIsConfigDirty } from "../../store/config";
import { useRowsStore, useVisibleCampaigns } from "../../store/rows";
import {
  usePersonalizeRowsStore,
  useVisiblePersonalizations,
} from "../../store/personalizeRows";
import {
  useRecommendationRowsStore,
  useVisibleRecommendations,
} from "../../store/recommendationRows";
import {
  useFlagRowsStore,
  useVisibleFeatureFlags,
} from "../../store/flagRows";
import {
  useSurveyRowsStore,
  useVisibleSurveys,
} from "../../store/surveyRows";
import {
  useConceptTestRowsStore,
  useVisibleConceptTests,
} from "../../store/conceptTestRows";
import { SURVEY_STATUSES } from "@/data/surveys";
import { CONCEPT_TEST_STATUSES } from "@/data/conceptTests";
import { FLAG_REPORT_ROWS } from "@/data/flagReports";
import {
  FLAG_REPORT_CONFIG,
  type FlagReportKind,
} from "@/config/flagReports";
import { useFlagReportRowsStore } from "@/store/flagReportRows";
import {
  entityNameKey,
  useEntityNameOverridesStore,
} from "@/store/entityNameOverrides";
import {
  campaignLandingPath,
  CAMPAIGN_STATUSES,
  type CampaignStatus,
  type CampaignType,
} from "../../data/campaigns";
import {
  personalizeLandingPath,
  PERSONALIZATION_STATUSES,
} from "../../data/personalizations";
import { recommendationLandingPath } from "../../data/recommendations";
import ExpandedNav from "./ExpandedNav";
import WingifyLogoButton from "./WingifyLogoButton";
import UtilityRail from "./UtilityRail";

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

const HEADER_ICON_BTN =
  "size-8 text-muted-foreground hover:bg-muted hover:text-foreground";
const HEADER_MENU_ITEM =
  "focus:bg-[var(--neutral-50)] data-[highlighted]:bg-[var(--neutral-50)]";

/** FM detail center tabs — Configuration + secondary (Rules / Reports). */
function FlagSurfaceTabs({
  basePath,
  entityId,
  secondary,
  withIcons = false,
}: {
  basePath: string;
  entityId?: string;
  /** Second tab — Rules for feature flags, Reports for flag rollout. */
  secondary: { label: string; suffix: "/rules" | "/reports" };
  /** Match WE Configure/Reports — PenLine + FileBarChart (Flag Rollout). */
  withIcons?: boolean;
}) {
  const { pathname } = useLocation();
  const configPath = `${basePath}/c/${entityId}`;
  const secondaryPath = `${configPath}${secondary.suffix}`;
  const onSecondary = pathname.endsWith(secondary.suffix);
  const onConfiguration = !onSecondary;

  const tab = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 border-b-2 px-0.5 py-2 -mb-px text-sm font-medium transition-colors",
      active
        ? "border-foreground text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground"
    );

  return (
    <div className="flex items-stretch gap-4">
      <Link
        to={configPath}
        aria-label="Configuration"
        aria-current={onConfiguration ? "page" : undefined}
        className={tab(onConfiguration)}
      >
        {withIcons ? <PenLine className="h-4 w-4" /> : null}
        Configuration
      </Link>
      <Link
        to={secondaryPath}
        aria-label={secondary.label}
        aria-current={onSecondary ? "page" : undefined}
        className={tab(onSecondary)}
      >
        {withIcons && secondary.suffix === "/reports" ? (
          <FileBarChart className="h-4 w-4" />
        ) : null}
        {secondary.label}
      </Link>
    </div>
  );
}

/** FM detail right actions — History stub + More. */
function FeatureFlagsDetailActions({
  entityId,
  listPath,
  onRemove,
  deleteLabel = "flag",
}: {
  entityId: string;
  listPath: string;
  onRemove?: (ids: string[]) => void;
  deleteLabel?: string;
}) {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1.5">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="History"
                className={HEADER_ICON_BTN}
              >
                <History className="size-4" strokeWidth={1.75} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">History</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuRoot modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="More actions"
              className={HEADER_ICON_BTN}
            >
              <MoreVertical className="size-4" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              className={HEADER_MENU_ITEM}
              onSelect={() => {
                /* TODO */
              }}
            >
              <Share2 />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem
              className={HEADER_MENU_ITEM}
              onSelect={() => setDeleteOpen(true)}
            >
              <CircleMinus />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {deleteLabel}?</DialogTitle>
            <DialogDescription>This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onRemove?.([entityId]);
                setDeleteOpen(false);
                navigate(listPath);
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

/** Right-header actions for Journey Analytics boards/reports (visual stubs).
 *  Standalone report → “Add to board”
 *  Nested report → “Added to N board(s)” dropdown
 *  Board → “Add content”
 */
function AnalyticsDetailActions({
  entityId,
  listBase,
}: {
  entityId?: string;
  listBase: string;
}) {
  const nameOverrides = useAnalyticsRowsStore((s) => s.nameOverrides);
  const raw = entityId ? getAnalyticsItem(entityId) : undefined;
  const item = raw ? withAnalyticsNameOverride(raw, nameOverrides) : undefined;
  const starred = Boolean(item?.starred);
  const parentBoardRaw = getAnalyticsParentBoard(raw);
  const parentBoard = parentBoardRaw
    ? withAnalyticsNameOverride(parentBoardRaw, nameOverrides)
    : undefined;
  const standaloneReport =
    item?.kind === "report" && !item.parentBoardId;
  const nestedReport = item?.kind === "report" && Boolean(parentBoard);
  const boardCount = nestedReport ? 1 : 0;

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={starred ? "Unstar" : "Star"}
        className="size-8 text-muted-foreground hover:text-foreground"
      >
        <Star
          className={cn("size-4", starred && "fill-foreground text-foreground")}
          strokeWidth={1.75}
        />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Share"
        className="size-8 text-muted-foreground hover:text-foreground"
      >
        <Share2 className="size-4" strokeWidth={1.75} />
      </Button>
      {nestedReport && parentBoard ? (
        <DropdownMenuRoot modal={false}>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              <LayoutGrid className="size-3.5" strokeWidth={1.75} aria-hidden />
              Added to {boardCount} board{boardCount === 1 ? "" : "s"}
              <ChevronDown className="size-3.5 opacity-70" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[220px]">
            <DropdownMenuItem asChild>
              <NavLink to={analyticsItemPath(parentBoard.id, { basePath: listBase })}>
                {parentBoard.name}
              </NavLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      ) : (
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <Plus className="size-3.5" strokeWidth={1.75} aria-hidden />
          {standaloneReport ? "Add to board" : "Add content"}
        </Button>
      )}
      <Button type="button" variant="outline" size="sm" className="gap-1.5">
        <Sparkles className="size-3.5" strokeWidth={1.75} aria-hidden />
        Analyze
      </Button>
      <Button type="button" size="sm" disabled className="gap-1.5">
        Save
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="More actions"
        className="size-8 text-muted-foreground hover:text-foreground"
      >
        <MoreVertical className="size-4" strokeWidth={1.75} />
      </Button>
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

// @undo — Save was in the WE detail actions cluster; removed per header redesign.
// function SaveButton({ entityId }: { entityId?: string }) {
//   const dirty = useIsConfigDirty(entityId ?? "");
//   const save = useConfigStore((s) => s.save);
//   return (
//     <TooltipProvider delayDuration={200}>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <Button
//             variant="default"
//             size="icon"
//             disabled={!dirty}
//             aria-label="Save"
//             onClick={() => entityId && save(entityId)}
//             className="h-8 w-8 transition-opacity duration-200"
//           >
//             <Save className="h-4 w-4" />
//           </Button>
//         </TooltipTrigger>
//         <TooltipContent side="bottom">Save</TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   );
// }

// Filter real product rows for the entity switcher.
function filterCampaigns(
  campaigns: { id: string; name: string; status: string; lastUpdated: string }[],
  filter: string,
  search: string
): { id: string; name: string }[] {
  const q = search.trim().toLowerCase();
  // While searching, ignore status/recent filters and match across the full list.
  let list = campaigns;
  if (!q) {
    if (filter === "Recent") {
      list = [...campaigns]
        .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
        .slice(0, 10);
    } else if (filter !== "All") {
      list = campaigns.filter((c) => c.status === filter);
    }
  }
  if (q) list = list.filter((c) => c.name.toLowerCase().includes(q));
  return list.map((c) => ({ id: c.id, name: c.name }));
}

// Campaign detail header actions (Web Exp + Personalize): Status | divider |
// Clone · History · More. Flush Data / Archive disabled on Draft.
function CampaignDetailActions({
  campaign,
  listPath,
  onArchive,
  onRemove,
  onSetStatus,
}: {
  campaign: { id: string; status: CampaignStatus; name: string };
  listPath: string;
  onArchive: (ids: string[]) => void;
  onRemove: (ids: string[]) => void;
  onSetStatus?: (id: string, status: CampaignStatus) => void;
}) {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isDraft = campaign.status === "Draft";

  return (
    <>
      <div className="flex items-center gap-1.5">
        <StatusMenu
          campaign={campaign}
          triggerVariant="button"
          onSetStatus={onSetStatus}
        />
        <div className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden />
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Clone campaign"
                onClick={() => {
                  /* TODO — Clone modal is a deferred prompt */
                }}
                className={HEADER_ICON_BTN}
              >
                <CopyPlus className="size-4" strokeWidth={1.75} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Clone</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="History"
                className={HEADER_ICON_BTN}
              >
                <History className="size-4" strokeWidth={1.75} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">History</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuRoot modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="More actions"
              className={HEADER_ICON_BTN}
            >
              <MoreVertical className="size-4" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              className={HEADER_MENU_ITEM}
              onSelect={() => {
                /* TODO */
              }}
            >
              <Share2 />
              Share
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className={cn(
                  HEADER_MENU_ITEM,
                  "focus:bg-[var(--neutral-50)] data-[state=open]:bg-[var(--neutral-50)]"
                )}
              >
                <Download />
                Download CSV
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuItem disabled className={HEADER_MENU_ITEM}>
                  Coming soon
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem
              className={HEADER_MENU_ITEM}
              onSelect={() => {
                /* TODO */
              }}
            >
              <Printer />
              Print
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isDraft}
              className={HEADER_MENU_ITEM}
              onSelect={() => {
                /* TODO */
              }}
            >
              <Eraser />
              Flush Data
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isDraft}
              className={HEADER_MENU_ITEM}
              onSelect={() => onArchive([campaign.id])}
            >
              <Archive />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              className={HEADER_MENU_ITEM}
              onSelect={() => setDeleteOpen(true)}
            >
              <CircleMinus />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      </div>

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
                onRemove([campaign.id]);
                setDeleteOpen(false);
                navigate(listPath);
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

// Fallback kebab for non-campaign-cluster surfaces (currently unused when WE +
// Personalize both use CampaignDetailActions).
function KebabMenu({
  campaign,
  listPath,
  onArchive,
  onRemove,
}: {
  campaign: { id: string; status: CampaignStatus; name: string };
  listPath: string;
  onArchive: (ids: string[]) => void;
  onRemove: (ids: string[]) => void;
}) {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isDraft = campaign.status === "Draft";

  return (
    <>
      <DropdownMenuRoot modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="More actions"
            className={HEADER_ICON_BTN}
          >
            <MoreVertical className="size-4" strokeWidth={1.75} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            className={HEADER_MENU_ITEM}
            onSelect={() => {
              /* TODO — Clone modal is a deferred prompt */
            }}
          >
            <Copy />
            Clone
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={HEADER_MENU_ITEM}
            onSelect={() => {
              /* TODO */
            }}
          >
            <Share2 />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem
            className={HEADER_MENU_ITEM}
            onSelect={() => {
              /* TODO */
            }}
          >
            <Printer />
            Print
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isDraft}
            className={HEADER_MENU_ITEM}
            onSelect={() => {
              /* TODO */
            }}
          >
            <Eraser />
            Flush Data
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isDraft}
            className={HEADER_MENU_ITEM}
            onSelect={() => onArchive([campaign.id])}
          >
            <Archive />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem
            className={HEADER_MENU_ITEM}
            onSelect={() => setDeleteOpen(true)}
          >
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
                onRemove([campaign.id]);
                setDeleteOpen(false);
                navigate(listPath);
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

/** Neutral ID badge with copy — copies the number only (no #).
 *  Copy control is a span (not a button) so it can sit inside the switcher trigger. */
function CampaignIdBadge({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyId = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <Badge
      tone="neutral"
      fill="light"
      size="sm"
      className={cn("shrink-0 gap-1 font-normal tabular-nums", className)}
    >
      <span>#{id}</span>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              role="button"
              tabIndex={0}
              data-copy-id=""
              aria-label={copied ? "Copied" : "Copy campaign number"}
              onClick={copyId}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void copyId(e as unknown as MouseEvent);
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="inline-flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied ? (
                <Check className="size-2.5" strokeWidth={2.25} aria-hidden />
              ) : (
                <Copy className="size-2.5" strokeWidth={1.75} aria-hidden />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {copied ? "Copied" : "Copy number"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Badge>
  );
}

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
  const [searchParams] = useSearchParams();
  const [navOpen, setNavOpen] = useState(false);
  // Animation pair: the overlay stays mounted (navRendered) while it slides
  // out, and the "shown" styles (navShown) lag mount by a frame so the
  // slide-in transition actually plays.
  const [navRendered, setNavRendered] = useState(false);
  const [navShown, setNavShown] = useState(false);
  const [entityOpen, setEntityOpen] = useState(false);
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);
  const [boardSearch, setBoardSearch] = useState("");
  const [boardScope, setBoardScope] = useState<"all" | "recent" | "starred">("recent");
  const [listMenuOpen, setListMenuOpen] = useState(false);
  const [reportScope, setReportScope] = useState<
    "board" | "all" | "recent" | "starred"
  >("all");
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);

  // Fallback from the URL guards against a stale element tree (e.g. mid-HMR)
  // rendering this component without the prop.
  const basePath = basePathProp ?? pathname.split("/c/")[0];
  const onReports = pathname.endsWith("/reports");

  // Breadcrumb trail: main-nav label, plus the sub-nav label when basePath is a leaf.
  const { item, leaf, siblings } = resolveBreadcrumb(basePath);

  // Real-data paths: Web Exp, Personalize, or Commerce Recommendation.
  const realData = isRealDataPath(basePath);
  const isPersonalize = basePath === "/personalize";
  const isRecommendation = basePath === "/commerce/recommendation";
  const isFeatureFlags = basePath === "/feature-management/feature-flags";
  const isSurveyDetail = basePath === "/pulse/surveys";
  const isConceptTestDetail = basePath === "/pulse/concept-test";
  const flagReportKind = (
    {
      "/feature-management/flag-rollout": "rollout",
      "/feature-management/flag-testing": "testing",
      "/feature-management/flag-personalize": "personalize",
      "/feature-management/flag-multivariate": "multivariate",
    } as Partial<Record<string, FlagReportKind>>
  )[basePath];
  const isFlagReportDetail = Boolean(flagReportKind);
  const isFlagConfigReports =
    flagReportKind === "rollout" ||
    flagReportKind === "testing" ||
    flagReportKind === "personalize" ||
    flagReportKind === "multivariate";
  const isFmComingSoonDetail = isFeatureFlags || isFlagReportDetail;
  const isAnalytics = isAnalyticsListBase(basePath);
  const isPlanDetail =
    basePath === "/plan/observations" || basePath === "/plan/hypotheses";
  // Coming-soon bodies with breadcrumb chrome only (no center tabs / right cluster).
  // Surveys: detail header without Configure/Reports.
  const chromeOnlyDetail =
    isPlanDetail || isSurveyDetail || isConceptTestDetail;
  const analyticsListCrumb = analyticsListLabel(basePath);
  const analyticsNameOverrides = useAnalyticsRowsStore((s) => s.nameOverrides);
  const analyticsRename = useAnalyticsRowsStore((s) => s.rename);
  const analyticsItemRaw =
    isAnalytics && entityId ? getAnalyticsItem(entityId) : undefined;
  const analyticsItem = analyticsItemRaw
    ? withAnalyticsNameOverride(analyticsItemRaw, analyticsNameOverrides)
    : undefined;
  // Board crumb / “This Board” only when opened via a board (`?board=`), not
  // merely because the report has a parentBoardId in data.
  const boardContextId = searchParams.get("board");
  const contextBoardCandidate = boardContextId
    ? getAnalyticsItem(boardContextId)
    : undefined;
  const contextBoard = contextBoardCandidate?.kind === "board"
    ? withAnalyticsNameOverride(contextBoardCandidate, analyticsNameOverrides)
    : undefined;
  const isAnalyticsBoard = Boolean(analyticsItem && analyticsItem.kind === "board");
  const isAnalyticsBoardContext = Boolean(
    analyticsItem?.kind === "report" &&
      contextBoard &&
      analyticsItem.parentBoardId === contextBoard.id
  );
  const analyticsBoards = ANALYTICS_ITEMS.filter((row) => row.kind === "board");
  const recentBoardIds = new Set(
    ANALYTICS_RECENT.filter((row) => row.kind === "board").map((row) => row.id)
  );
  const boardSwitcherList = (() => {
    const q = boardSearch.trim().toLowerCase();
    // While searching, ignore All/Recent/Starred and match across all boards.
    let list = mapAnalyticsNameOverrides(analyticsBoards, analyticsNameOverrides);
    if (!q) {
      list =
        boardScope === "starred"
          ? list.filter((b) => b.starred)
          : boardScope === "recent"
            ? list.filter((b) => recentBoardIds.has(b.id))
            : list;
      // Fall back to all boards if recent set is empty so the menu isn't blank.
      if (boardScope === "recent" && list.length === 0) {
        list = mapAnalyticsNameOverrides(analyticsBoards, analyticsNameOverrides);
      }
    }
    if (q) list = list.filter((b) => b.name.toLowerCase().includes(q));
    return list;
  })();
  const webCampaigns = useVisibleCampaigns();
  const personalizations = useVisiblePersonalizations();
  const recommendations = useVisibleRecommendations();
  const featureFlags = useVisibleFeatureFlags();
  const renameFlag = useFlagRowsStore((s) => s.rename);
  const removeFlag = useFlagRowsStore((s) => s.remove);
  const surveys = useVisibleSurveys();
  const renameSurvey = useSurveyRowsStore((s) => s.rename);
  const conceptTests = useVisibleConceptTests();
  const renameConceptTest = useConceptTestRowsStore((s) => s.rename);
  const renameFlagReport = useFlagReportRowsStore((s) => s.rename);
  const flagReportNameOverrides = useFlagReportRowsStore((s) => s.nameOverrides);
  const entityNameOverrides = useEntityNameOverridesStore((s) => s.nameOverrides);
  const renameEntity = useEntityNameOverridesStore((s) => s.rename);
  const webArchive = useRowsStore((s) => s.archive);
  const webRemove = useRowsStore((s) => s.remove);
  const updateCampaign = useRowsStore((s) => s.updateCampaign);
  const persArchive = usePersonalizeRowsStore((s) => s.archive);
  const persRemove = usePersonalizeRowsStore((s) => s.remove);
  const persSetStatus = usePersonalizeRowsStore((s) => s.setStatus);
  const persRename = usePersonalizeRowsStore((s) => s.rename);
  const recUpdate = useRecommendationRowsStore((s) => s.update);
  const [activeFilter, setActiveFilter] = useState("All");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [entitySearch, setEntitySearch] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const switcherClickTimer = useRef<number | undefined>(undefined);

  const productRows = isPersonalize
    ? personalizations
    : isRecommendation
      ? recommendations.map((r) => ({
          id: r.id,
          name: r.name,
          status: r.status,
          lastUpdated: r.lastEdit ?? "",
        }))
      : webCampaigns;
  const statusList = isPersonalize
    ? PERSONALIZATION_STATUSES
    : isRecommendation
      ? CAMPAIGN_STATUSES
      : CAMPAIGN_STATUSES;

  const dummyEntities = getEntities(basePath);
  const filters = isAnalytics
    ? ["All", "Boards", "Reports"]
    : isSurveyDetail
      ? ["All", ...SURVEY_STATUSES]
      : isConceptTestDetail
        ? ["All", ...CONCEPT_TEST_STATUSES]
        : realData
          ? ["All", "Recent", ...statusList]
          : getFilters(basePath);

  const campaign = realData
    ? productRows.find((c) => c.id === entityId) ?? productRows[0]
    : undefined;

  const recentReportIds = new Set(
    ANALYTICS_RECENT.filter((row) => row.kind === "report").map((row) => row.id)
  );
  const allReports = ANALYTICS_ITEMS.filter((row) => row.kind === "report");
  const defaultReportScope = isAnalyticsBoardContext ? "board" : "all";
  const entities = isAnalytics
    ? (() => {
        // Board → boards only.
        // Report → This Board (board context only) / All / Recent / Starred.
        // While searching, ignore the scope and match across the full pool.
        let pool = ANALYTICS_ITEMS;
        if (analyticsItem?.kind === "board") {
          // Board → All / Recent / Starred (same tabs as report→board switcher).
          // While searching, ignore the scope and match across all boards.
          const q = entitySearch.trim();
          if (q) {
            pool = analyticsBoards;
          } else if (boardScope === "starred") {
            pool = analyticsBoards.filter((row) => row.starred);
          } else if (boardScope === "recent") {
            const recent = analyticsBoards.filter((row) =>
              recentBoardIds.has(row.id)
            );
            pool = recent.length > 0 ? recent : analyticsBoards;
          } else {
            pool = analyticsBoards;
          }
        } else if (analyticsItem?.kind === "report") {
          const q = entitySearch.trim();
          if (q) {
            pool = allReports;
          } else if (reportScope === "board" && contextBoard) {
            pool = getReportsForBoard(contextBoard.id);
          } else if (reportScope === "starred") {
            pool = allReports.filter((row) => row.starred);
          } else if (reportScope === "recent") {
            const recent = allReports.filter((row) => recentReportIds.has(row.id));
            pool = recent.length > 0 ? recent : allReports;
          } else {
            pool = allReports;
          }
        }
        const q = entitySearch.trim().toLowerCase();
        return mapAnalyticsNameOverrides(pool, analyticsNameOverrides)
          .filter((row) => !q || row.name.toLowerCase().includes(q))
          .map((row) => ({
            id: row.id,
            name: row.name,
            status: "Recent" as const,
            displayId: row.displayId,
            starred: row.starred,
          }));
      })()
    : realData
      ? filterCampaigns(productRows, activeFilter, entitySearch)
      : isFeatureFlags
        ? featureFlags
            .filter((f) => {
              const q = entitySearch.trim().toLowerCase();
              return !q || f.name.toLowerCase().includes(q) || f.id.includes(q);
            })
            .map((f) => ({
              id: f.id,
              name: f.name,
              status: "Recent" as const,
            }))
        : isSurveyDetail
          ? surveys
              .filter((s) => {
                const q = entitySearch.trim().toLowerCase();
                if (q) {
                  return (
                    s.name.toLowerCase().includes(q) || s.id.includes(q)
                  );
                }
                if (activeFilter !== "All" && s.status !== activeFilter) {
                  return false;
                }
                return true;
              })
              .map((s) => ({
                id: s.id,
                name: s.name,
                status: "Recent" as const,
              }))
        : isConceptTestDetail
          ? conceptTests
              .filter((s) => {
                const q = entitySearch.trim().toLowerCase();
                if (q) {
                  return (
                    s.name.toLowerCase().includes(q) || s.id.includes(q)
                  );
                }
                if (activeFilter !== "All" && s.status !== activeFilter) {
                  return false;
                }
                return true;
              })
              .map((s) => ({
                id: s.id,
                name: s.name,
                status: "Recent" as const,
              }))
        : isFlagReportDetail && flagReportKind
          ? FLAG_REPORT_ROWS[flagReportKind]
              .map((f) => {
                const overridden =
                  flagReportNameOverrides[flagReportKind]?.[f.id];
                return overridden ? { ...f, name: overridden } : f;
              })
              .filter((f) => {
                const q = entitySearch.trim().toLowerCase();
                return (
                  !q || f.name.toLowerCase().includes(q) || f.id.includes(q)
                );
              })
              .map((f) => ({
                id: f.id,
                name: f.name,
                status: "Recent" as const,
              }))
          : dummyEntities
              .map((e) => {
                const overridden =
                  entityNameOverrides[entityNameKey(basePath, e.id)];
                return overridden ? { ...e, name: overridden } : e;
              })
              .filter((e) => {
                const q = entitySearch.trim().toLowerCase();
                return (
                  !q || e.name.toLowerCase().includes(q) || e.id.includes(q)
                );
              });

  const selected = isAnalytics
    ? analyticsItem
      ? {
          id: analyticsItem.id,
          name: analyticsItem.name,
          displayId: analyticsItem.displayId,
        }
      : entities[0]
        ? {
            id: entities[0].id,
            name: entities[0].name,
            displayId: (entities[0] as { displayId?: string }).displayId,
          }
        : undefined
    : realData
      ? campaign && { id: campaign.id, name: campaign.name }
      : isFeatureFlags
        ? (() => {
            const flag =
              featureFlags.find((f) => f.id === entityId) ?? featureFlags[0];
            return flag ? { id: flag.id, name: flag.name } : undefined;
          })()
        : isSurveyDetail
          ? (() => {
              const row =
                surveys.find((s) => s.id === entityId) ?? surveys[0];
              return row ? { id: row.id, name: row.name } : undefined;
            })()
        : isConceptTestDetail
          ? (() => {
              const row =
                conceptTests.find((s) => s.id === entityId) ?? conceptTests[0];
              return row ? { id: row.id, name: row.name } : undefined;
            })()
        : isFlagReportDetail && flagReportKind
          ? (() => {
              const rows = FLAG_REPORT_ROWS[flagReportKind].map((f) => {
                const overridden =
                  flagReportNameOverrides[flagReportKind]?.[f.id];
                return overridden ? { ...f, name: overridden } : f;
              });
              const row = rows.find((f) => f.id === entityId) ?? rows[0];
              return row ? { id: row.id, name: row.name } : undefined;
            })()
          : (() => {
              const base =
                dummyEntities.find((e) => e.id === entityId) ??
                dummyEntities[0];
              if (!base) return undefined;
              const overridden =
                entityNameOverrides[entityNameKey(basePath, base.id)];
              return overridden ? { ...base, name: overridden } : base;
            })();

  const badgeId = isAnalytics
    ? String(
        (selected as { displayId?: string } | undefined)?.displayId ??
          selected?.id ??
          ""
      )
    : selected?.id != null
      ? String(selected.id)
      : "";

  const canRename =
    realData ||
    isAnalytics ||
    isFmComingSoonDetail ||
    isSurveyDetail ||
    isConceptTestDetail;

  const startRename = () => {
    if (!selected || !canRename) return;
    window.clearTimeout(switcherClickTimer.current);
    switcherClickTimer.current = undefined;
    setDraftName(selected.name);
    setRenaming(true);
    setEntityOpen(false);
    requestAnimationFrame(() => nameInputRef.current?.select());
  };

  const commitRename = () => {
    if (!selected || !canRename) {
      setRenaming(false);
      return;
    }
    const next = draftName.trim();
    setRenaming(false);
    if (!next || next === selected.name) return;
    if (isAnalytics) analyticsRename(selected.id, next);
    else if (isPersonalize) persRename(selected.id, next);
    else if (isRecommendation) recUpdate(selected.id, { name: next });
    else if (isFeatureFlags) renameFlag(selected.id, next);
    else if (isSurveyDetail) renameSurvey(selected.id, next);
    else if (isConceptTestDetail) renameConceptTest(selected.id, next);
    else if (isFlagReportDetail && flagReportKind)
      renameFlagReport(flagReportKind, selected.id, next);
    else if (isPlanDetail) renameEntity(basePath, selected.id, next);
    else updateCampaign(selected.id, { name: next });
  };

  const cancelRename = () => {
    setRenaming(false);
    setDraftName(selected?.name ?? "");
  };

  useEffect(() => {
    setRenaming(false);
    setDraftName(selected?.name ?? "");
  }, [selected?.id, selected?.name]);

  // Drop stale `?board=` when the report isn't on that board (or param is invalid).
  useEffect(() => {
    if (!isAnalytics || !entityId || !boardContextId) return;
    if (isAnalyticsBoardContext) return;
    navigate(analyticsItemPath(entityId, { basePath }), { replace: true });
  }, [
    isAnalytics,
    entityId,
    boardContextId,
    isAnalyticsBoardContext,
    basePath,
    navigate,
  ]);

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
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <WingifyLogoButton />

          {isAnalytics ? (
            /* Analytics: Overview › [Board] › item ▾ — report switcher is board-scoped. */
            <div className="flex min-w-0 items-center gap-0.5">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Back to list"
                      asChild
                    >
                      <Link
                        to={
                          isAnalyticsBoardContext && contextBoard
                            ? analyticsItemPath(contextBoard.id, { basePath })
                            : basePath
                        }
                      >
                        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isAnalyticsBoardContext ? "Back to board" : "Back to list"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex min-w-0 items-center gap-1.5 text-sm">
                <Popover.Root open={listMenuOpen} onOpenChange={setListMenuOpen}>
                  <Popover.Trigger asChild>
                    <button
                      type="button"
                      aria-label="Switch list"
                      className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    >
                      {analyticsListCrumb}
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      align="start"
                      sideOffset={6}
                      className="z-50 w-[180px] rounded-md border border-border bg-popover p-1 text-sm text-popover-foreground shadow-lg"
                    >
                      {(
                        [
                          [ANALYTICS_OVERVIEW_BASE, "Overview"],
                          [ANALYTICS_BROWSE_BASE, "Browse"],
                        ] as const
                      ).map(([path, label]) => (
                        <button
                          key={path}
                          type="button"
                          onClick={() => {
                            navigate(path);
                            setListMenuOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-left transition-colors hover:bg-muted",
                            path === basePath && "bg-accent font-medium"
                          )}
                        >
                          {label}
                          {path === basePath ? (
                            <Check className="size-3.5 shrink-0" strokeWidth={1.75} />
                          ) : null}
                        </button>
                      ))}
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
                {isAnalyticsBoardContext && contextBoard ? (
                  <>
                    <span className="shrink-0 text-muted-foreground">/</span>
                    <Popover.Root
                      open={boardMenuOpen}
                      onOpenChange={(o) => {
                        setBoardMenuOpen(o);
                        if (!o) {
                          setBoardSearch("");
                          setBoardScope("recent");
                        }
                      }}
                    >
                      <Popover.Trigger asChild>
                        <button
                          type="button"
                          title={contextBoard.name}
                          aria-label="Switch board"
                          className="flex min-w-0 max-w-[14rem] shrink items-center gap-1.5 rounded-md px-1.5 py-1 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none"
                        >
                          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] bg-[var(--info-bg)] text-[var(--info-fg)]">
                            <LayoutGrid className="size-3" strokeWidth={1.75} aria-hidden />
                          </span>
                          <span className="truncate text-sm">
                            {contextBoard.name}
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          align="start"
                          sideOffset={6}
                          className="z-50 w-[300px] rounded-md border border-border bg-popover p-2 text-sm text-popover-foreground shadow-lg"
                        >
                          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
                            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Search boards…"
                              value={boardSearch}
                              onChange={(e) => setBoardSearch(e.target.value)}
                              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                            />
                          </div>
                          {!boardSearch.trim() ? (
                            <div
                              role="tablist"
                              aria-label="Board filters"
                              className="mt-2 flex gap-1 rounded-md border border-border bg-background p-0.5"
                            >
                              {(
                                [
                                  ["all", "All"],
                                  ["recent", "Recent"],
                                  ["starred", "Starred"],
                                ] as const
                              ).map(([value, label]) => (
                                <button
                                  key={value}
                                  type="button"
                                  role="tab"
                                  aria-selected={boardScope === value}
                                  onClick={() => setBoardScope(value)}
                                  className={cn(
                                    "flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors",
                                    boardScope === value
                                      ? "bg-muted text-foreground"
                                      : "text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  {value === "starred" ? (
                                    <Star className="size-3" strokeWidth={1.75} aria-hidden />
                                  ) : null}
                                  {label}
                                </button>
                              ))}
                            </div>
                          ) : null}
                          <div className="mt-2 flex max-h-56 flex-col gap-0.5 overflow-y-auto">
                            {boardSwitcherList.length === 0 ? (
                              <p className="px-2.5 py-3 text-center text-xs text-muted-foreground">
                                No boards in this view.
                              </p>
                            ) : (
                              boardSwitcherList.map((board) => (
                                <button
                                  key={board.id}
                                  type="button"
                                  onClick={() => {
                                    navigate(
                                      analyticsItemPath(board.id, { basePath })
                                    );
                                    setBoardMenuOpen(false);
                                  }}
                                  className={cn(
                                    "flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                                    board.id === contextBoard.id &&
                                      "bg-accent font-medium"
                                  )}
                                >
                                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] bg-[var(--info-bg)] text-[var(--info-fg)]">
                                    <LayoutGrid
                                      className="size-3"
                                      strokeWidth={1.75}
                                      aria-hidden
                                    />
                                  </span>
                                  <span className="min-w-0 flex-1 truncate">
                                    {board.name}
                                  </span>
                                  {board.starred ? (
                                    <Star
                                      className="size-3.5 shrink-0 fill-foreground text-foreground"
                                      strokeWidth={1.75}
                                      aria-label="Starred"
                                    />
                                  ) : null}
                                </button>
                              ))
                            )}
                          </div>
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </>
                ) : null}
                <span className="shrink-0 text-muted-foreground">/</span>
                <Popover.Root
                  open={entityOpen}
                  onOpenChange={(o) => {
                    if (renaming) return;
                    if (!o) {
                      window.clearTimeout(switcherClickTimer.current);
                      switcherClickTimer.current = undefined;
                      setEntityOpen(false);
                      setFilterMenuOpen(false);
                      setEntitySearch("");
                      setReportScope(defaultReportScope);
                      return;
                    }
                    // Delay open so double-click can enter rename instead.
                    window.clearTimeout(switcherClickTimer.current);
                    switcherClickTimer.current = window.setTimeout(() => {
                      switcherClickTimer.current = undefined;
                      setEntityOpen(true);
                      if (!isAnalyticsBoard) {
                        setReportScope(defaultReportScope);
                      }
                    }, 280);
                  }}
                >
                  <div className="group/entity flex min-w-0 items-center gap-0.5">
                    {renaming ? (
                      <Input
                        ref={nameInputRef}
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitRename();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            cancelRename();
                          }
                        }}
                        aria-label={
                          isAnalyticsBoard ? "Board name" : "Report name"
                        }
                        className="h-8 min-w-[14rem] max-w-[28rem] px-2 text-sm font-medium shadow-none"
                      />
                    ) : (
                      <>
                        <Popover.Trigger asChild>
                          <button
                            type="button"
                            title={selected?.name ?? "Untitled"}
                            onDoubleClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              startRename();
                            }}
                            className="flex min-w-0 max-w-full items-center gap-2 rounded-md px-1.5 py-1 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                          >
                            <span
                              className={cn(
                                "inline-flex size-5 shrink-0 items-center justify-center rounded-[4px]",
                                isAnalyticsBoard
                                  ? "bg-[var(--info-bg)] text-[var(--info-fg)]"
                                  : "bg-muted text-foreground"
                              )}
                            >
                              {isAnalyticsBoard ? (
                                <LayoutGrid
                                  className="size-3"
                                  strokeWidth={1.75}
                                  aria-hidden
                                />
                              ) : (
                                <LineChart
                                  className="size-3"
                                  strokeWidth={1.75}
                                  aria-hidden
                                />
                              )}
                            </span>
                            <span className="min-w-0 truncate text-sm font-medium text-foreground">
                              {selected?.name ?? "Untitled"}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          </button>
                        </Popover.Trigger>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={
                                  isAnalyticsBoard
                                    ? "Rename board"
                                    : "Rename report"
                                }
                                onClick={startRename}
                                className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/entity:opacity-100 focus-visible:opacity-100"
                              >
                                <Pencil
                                  className="h-3.5 w-3.5"
                                  strokeWidth={1.75}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Rename</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                  <Popover.Portal>
                    <Popover.Content
                      align="start"
                      sideOffset={6}
                      className="z-50 w-[320px] rounded-md border border-border bg-popover p-2 text-sm text-popover-foreground shadow-lg"
                    >
                      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
                        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder={
                            isAnalyticsBoard ? "Search boards…" : "Search reports…"
                          }
                          value={entitySearch}
                          onChange={(e) => setEntitySearch(e.target.value)}
                          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                      {!entitySearch.trim() ? (
                        isAnalyticsBoard ? (
                          <div
                            role="tablist"
                            aria-label="Board filters"
                            className="mt-2 flex gap-1 rounded-md border border-border bg-background p-0.5"
                          >
                            {(
                              [
                                ["all", "All"],
                                ["recent", "Recent"],
                                ["starred", "Starred"],
                              ] as const
                            ).map(([value, label]) => (
                              <button
                                key={value}
                                type="button"
                                role="tab"
                                aria-selected={boardScope === value}
                                onClick={() => setBoardScope(value)}
                                className={cn(
                                  "flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors",
                                  boardScope === value
                                    ? "bg-muted text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {value === "starred" ? (
                                  <Star
                                    className="size-3"
                                    strokeWidth={1.75}
                                    aria-hidden
                                  />
                                ) : null}
                                {label}
                              </button>
                            ))}
                          </div>
                        ) : (
                        <div
                          role="tablist"
                          aria-label="Report filters"
                          className="mt-2 flex flex-wrap gap-1 rounded-md border border-border bg-background p-0.5"
                        >
                          {(isAnalyticsBoardContext
                            ? ([
                                ["board", "This Board"],
                                ["all", "All Reports"],
                                ["recent", "Recent"],
                                ["starred", "Starred"],
                              ] as const)
                            : ([
                                ["all", "All Reports"],
                                ["recent", "Recent"],
                                ["starred", "Starred"],
                              ] as const)
                          ).map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              role="tab"
                              aria-selected={reportScope === value}
                              onClick={() => setReportScope(value)}
                              className={cn(
                                "flex flex-1 items-center justify-center gap-1 rounded px-1.5 py-1 text-[11px] font-medium transition-colors",
                                reportScope === value
                                  ? "bg-muted text-foreground"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {value === "starred" ? (
                                <Star className="size-3" strokeWidth={1.75} aria-hidden />
                              ) : null}
                              {label}
                            </button>
                          ))}
                        </div>
                        )
                      ) : null}
                      <div className="mt-2 flex max-h-64 flex-col gap-0.5 overflow-y-auto">
                        {entities.length === 0 ? (
                          <p className="px-2.5 py-3 text-center text-xs text-muted-foreground">
                            No {isAnalyticsBoard ? "boards" : "reports"} in this view.
                          </p>
                        ) : (
                          entities.map((entity) => (
                            <button
                              key={entity.id}
                              type="button"
                              onClick={() => {
                                navigate(
                                  analyticsReportNavPath(
                                    entity.id,
                                    contextBoard?.id,
                                    basePath
                                  )
                                );
                                setEntityOpen(false);
                              }}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                                entity.id === selected?.id && "bg-accent font-medium"
                              )}
                            >
                              <span className="min-w-0 flex-1 truncate">
                                {entity.name}
                              </span>
                              {"starred" in entity && entity.starred ? (
                                <Star
                                  className="size-3.5 shrink-0 fill-foreground text-foreground"
                                  strokeWidth={1.75}
                                  aria-label="Starred"
                                />
                              ) : null}
                            </button>
                          ))
                        )}
                      </div>
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>
            </div>
          ) : (
          <div className="flex min-w-0 items-center gap-0.5">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Back to list"
                    asChild
                  >
                    <Link to={mainNavCrumbPath(basePath)}>
                      <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Back to list</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex min-w-0 items-center gap-2 text-sm">
              {/* Deeper (campaign) crumb: leaf product name when present — e.g.
                  "Web Experimentation / Campaign", not "Experimentation / …". */}
              {leaf ? (
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    title={leaf.label}
                    className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none"
                  >
                    <span className="max-w-[10rem] truncate">{leaf.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
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
            ) : (
              <Link
                to={mainNavCrumbPath(basePath)}
                title={item?.label ?? basePath}
                className="flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none"
              >
                {item?.icon && (
                  <item.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <span className="hidden max-w-[10rem] truncate lg:inline">
                  {item?.label ?? basePath}
                </span>
              </Link>
            )}
            <span className="shrink-0 text-muted-foreground">/</span>
            <Popover.Root
              open={entityOpen}
              onOpenChange={(o) => {
                if (renaming) return;
                if (!o) {
                  window.clearTimeout(switcherClickTimer.current);
                  switcherClickTimer.current = undefined;
                  setEntityOpen(false);
                  setFilterMenuOpen(false);
                  return;
                }
                window.clearTimeout(switcherClickTimer.current);
                switcherClickTimer.current = window.setTimeout(() => {
                  switcherClickTimer.current = undefined;
                  setEntityOpen(true);
                }, 280);
              }}
            >
              <div className="group/entity flex min-w-0 items-center gap-0.5">
                {renaming && canRename ? (
                  <Input
                    ref={nameInputRef}
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitRename();
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        cancelRename();
                      }
                    }}
                    aria-label="Name"
                    className="h-8 min-w-[14rem] max-w-[28rem] px-2 text-sm font-semibold shadow-none"
                  />
                ) : (
                  <>
                    {/* One chip: name + ID badge + chevron. Single-click opens
                        switcher; double-click renames; pencil is the alt path. */}
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        title={selected?.name ?? "Untitled"}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startRename();
                        }}
                        className="flex min-w-0 max-w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                      >
                        <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                          {selected?.name ?? "Untitled"}
                        </span>
                        {!isAnalytics && !isPlanDetail && badgeId ? (
                          <CampaignIdBadge id={badgeId} />
                        ) : null}
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </button>
                    </Popover.Trigger>

                    {canRename && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Rename"
                              onClick={startRename}
                              className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/entity:opacity-100 focus-visible:opacity-100"
                            >
                              <Pencil
                                className="h-3.5 w-3.5"
                                strokeWidth={1.75}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">Rename</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </>
                )}
              </div>
              <Popover.Portal>
                <Popover.Content
                  align="start"
                  sideOffset={6}
                  className="z-50 w-[300px] rounded-md border border-border bg-popover p-2 text-sm text-popover-foreground shadow-lg"
                >
                  {/* Real-data paths wire search + a status filter; others stay visual-only.
                      While searching, hide filters and match across the full list. */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
                      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search…"
                        value={
                          realData ||
                          isAnalytics ||
                          isFmComingSoonDetail ||
                          isSurveyDetail ||
                          isConceptTestDetail
                            ? entitySearch
                            : undefined
                        }
                        onChange={
                          realData ||
                          isAnalytics ||
                          isFmComingSoonDetail ||
                          isSurveyDetail ||
                          isConceptTestDetail
                            ? (e) => setEntitySearch(e.target.value)
                            : undefined
                        }
                        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                    {(realData ||
                      (isAnalytics && !analyticsItem?.kind) ||
                      isSurveyDetail ||
                      isConceptTestDetail) &&
                    !entitySearch.trim() ? (
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          title={isAnalytics ? "Filter by type" : "Filter by status"}
                          aria-label={isAnalytics ? "Filter by type" : "Filter by status"}
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
                    ) : null}
                  </div>
                  <div className="mt-2 flex max-h-64 flex-col gap-0.5 overflow-y-auto">
                    {entities.map((entity) => {
                      // Same leading icons as the list/table views (campaign type, Target, etc).
                      const product = productRows.find((c) => c.id === entity.id) as
                        | { type?: CampaignType }
                        | undefined;
                      const ReportIcon =
                        flagReportKind
                          ? FLAG_REPORT_CONFIG[flagReportKind].icon
                          : null;
                      const TypeIcon = isAnalytics
                        ? getAnalyticsItem(entity.id)?.kind === "board"
                          ? GalleryVerticalEnd
                          : FileBarChart
                        : isFeatureFlags
                          ? Flag
                          : isSurveyDetail
                            ? Globe
                          : isConceptTestDetail
                            ? Link2
                          : isFlagReportDetail && ReportIcon
                            ? ReportIcon
                            : isPersonalize
                              ? Target
                              : isRecommendation
                                ? Sparkles
                                : TYPE_ICONS[product?.type ?? "A/B"];

                      return (
                      <div
                        key={entity.id}
                        className={cn(
                          "flex items-center gap-2 rounded-sm px-2.5 py-1.5 transition-colors hover:bg-[var(--neutral-50)]",
                          entity.id === selected?.id && "bg-[var(--neutral-50)]"
                        )}
                      >
                        {(realData ||
                          isAnalytics ||
                          isFmComingSoonDetail ||
                          isSurveyDetail ||
                          isConceptTestDetail) && (
                          <TypeIcon
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            // Real campaigns land on Reports or Configuration by status;
                            // analytics boards/reports share one detail path; dummy keep plain path.
                            const target = isAnalytics
                              ? analyticsItemPath(entity.id, { basePath })
                              : isPersonalize
                                ? personalizeLandingPath({ id: entity.id })
                                : isRecommendation
                                  ? recommendationLandingPath({ id: entity.id })
                                  : isFmComingSoonDetail ||
                                      isSurveyDetail ||
                                      isConceptTestDetail
                                    ? `${basePath}/c/${entity.id}`
                                    : realData
                                      ? campaignLandingPath({
                                          id: entity.id,
                                          status:
                                            (productRows.find((c) => c.id === entity.id)
                                              ?.status as CampaignStatus) ?? "Draft",
                                        })
                                      : `${basePath}/c/${entity.id}`;
                            navigate(target);
                            setEntityOpen(false);
                          }}
                          className={cn(
                            "min-w-0 flex-1 truncate text-left text-sm",
                            entity.id === selected?.id && "font-medium"
                          )}
                        >
                          {entity.name}
                        </button>
                        {!isAnalytics && !isPlanDetail ? (
                          <CampaignIdBadge id={String(entity.id)} />
                        ) : null}
                      </div>
                      );
                    })}
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

          </div>
          </div>
          )}
        </div>

        {/* Center switcher: Configure/Reports for campaigns; Configuration/Rules
            for Feature Flags; Configuration/Reports for Flag Rollout & Testing. */}
        <div className="flex shrink-0 items-end justify-center self-stretch">
          {isAnalytics || chromeOnlyDetail ? null : isFeatureFlags ? (
            <FlagSurfaceTabs
              basePath={basePath}
              entityId={entityId}
              secondary={{ label: "Rules", suffix: "/rules" }}
            />
          ) : isFlagConfigReports ? (
            <FlagSurfaceTabs
              basePath={basePath}
              entityId={entityId}
              secondary={{ label: "Reports", suffix: "/reports" }}
              withIcons
            />
          ) : (
            <SurfaceTabs
              basePath={basePath}
              entityId={entityId}
              showViewToggle={
                !isPersonalize &&
                !isRecommendation &&
                Boolean(campaign) &&
                !pathname.endsWith("/reports")
              }
            />
          )}
        </div>

        {/* Actions slot: analytics / WE+Personalize / Feature Flags & Flag Rollout/Testing. */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {isAnalytics ? (
            <AnalyticsDetailActions entityId={entityId} listBase={basePath} />
          ) : isFeatureFlags && selected ? (
            <FeatureFlagsDetailActions
              entityId={selected.id}
              listPath={basePath}
              onRemove={removeFlag}
              deleteLabel="flag"
            />
          ) : isFlagConfigReports && selected ? (
            <FeatureFlagsDetailActions
              entityId={selected.id}
              listPath={basePath}
              deleteLabel={
                flagReportKind === "testing"
                  ? "test"
                  : flagReportKind === "personalize"
                    ? "personalization"
                    : flagReportKind === "multivariate"
                      ? "multivariate"
                      : "rollout"
              }
            />
          ) : chromeOnlyDetail ? null : (basePath === "/web-experiment" ||
              isPersonalize) &&
            campaign ? (
            <CampaignDetailActions
              campaign={
                campaign as {
                  id: string;
                  status: CampaignStatus;
                  name: string;
                }
              }
              listPath={basePath}
              onArchive={isPersonalize ? persArchive : webArchive}
              onRemove={isPersonalize ? persRemove : webRemove}
              onSetStatus={isPersonalize ? persSetStatus : undefined}
            />
          ) : !isRecommendation && campaign ? (
            <>
              <StatusMenu
                campaign={campaign as { id: string; status: CampaignStatus }}
                triggerVariant="button"
              />
              <KebabMenu
                campaign={
                  campaign as {
                    id: string;
                    status: CampaignStatus;
                    name: string;
                  }
                }
                listPath={basePath}
                onArchive={webArchive}
                onRemove={webRemove}
              />
            </>
          ) : null}
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
            onReports ? "relative flex flex-col overflow-hidden" : "flex flex-col overflow-y-auto"
          )}
        >
          <div
            className={cn(
              "min-h-0",
              // Reports owns scroll below its tab bar so the metrics rail can
              // sit flush under the tabs with no canvas gap.
              onReports ? "min-h-0 flex-1 overflow-hidden" : "flex-1"
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
              <ExpandedNav forceCollapsed />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
