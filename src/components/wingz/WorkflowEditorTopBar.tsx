/** Detail-style TopBar for Wingz workflow editor — crumbs + rename + CTAs. */
/* Change summary: workflow title span carries `data-crumb-fit` so the shared DetailCrumbOverflow
 * trail folds into ⋯ only when the title would truncate. The section crumb is icon-only
 * (LeafCrumb `iconOnly`), matching the detail header. */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import * as Popover from "@radix-ui/react-popover";
import {
  ArrowLeft,
  ChevronDown,
  GitBranch,
  History,
  Pencil,
  Play,
  Save,
  Search,
} from "@/components/icons/protoLucide";
import DetailCrumbOverflow from "@/components/layout/DetailCrumbOverflow";
import { LeafCrumb } from "@/components/layout/CrumbSwitchers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  WORKFLOW_EDITOR_ID,
  WORKFLOW_EDITOR_SCENARIOS,
  WORKFLOW_SCENES,
  WORKFLOW_SWITCHER_ITEMS,
  resolveWorkflowSwitcherItem,
  type WorkflowScene,
} from "@/data/wingzWorkflowEditor";
import { resolveBreadcrumb } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useIsGetStartedLocked } from "@/store/getStartedOnboarding";

const LIST_PATH = "/wingz/workflows";

export default function WorkflowEditorTopBar() {
  const { id = WORKFLOW_EDITOR_ID } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sceneParam = params.get("scene") as WorkflowScene | null;
  const scene: WorkflowScene = WORKFLOW_SCENES.includes(
    sceneParam as WorkflowScene
  )
    ? (sceneParam as WorkflowScene)
    : "draft";
  const scenario = WORKFLOW_EDITOR_SCENARIOS[scene];
  const { item, leaf, siblings } = resolveBreadcrumb(LIST_PATH);
  const navLocked = useIsGetStartedLocked();

  const switcherItem = resolveWorkflowSwitcherItem(id, scene);

  // Prefer the selected switcher row name so the crumb updates on change.
  const defaultName = switcherItem.name;
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [publish, setPublish] = useState(false);
  const [entityOpen, setEntityOpen] = useState(false);
  const [entitySearch, setEntitySearch] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const switcherClickTimer = useRef<number | undefined>(undefined);

  const title = nameOverride ?? defaultName;
  const badgeId = switcherItem.displayId;

  // Reset local rename when scene/id changes the default name.
  useEffect(() => {
    setNameOverride(null);
  }, [id, scene, defaultName]);

  useEffect(() => {
    return () => {
      window.clearTimeout(switcherClickTimer.current);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = entitySearch.trim().toLowerCase();
    if (!q) return WORKFLOW_SWITCHER_ITEMS;
    return WORKFLOW_SWITCHER_ITEMS.filter((w) =>
      w.name.toLowerCase().includes(q)
    );
  }, [entitySearch]);

  const startRename = () => {
    window.clearTimeout(switcherClickTimer.current);
    switcherClickTimer.current = undefined;
    setDraftName(title);
    setRenaming(true);
    setEntityOpen(false);
    requestAnimationFrame(() => nameInputRef.current?.select());
  };

  const commitRename = () => {
    const next = draftName.trim();
    setRenaming(false);
    if (!next || next === title) return;
    setNameOverride(next);
  };

  const cancelRename = () => {
    setRenaming(false);
    setDraftName(title);
  };

  return (
    <header
      data-slot="top-bar"
      className="relative z-10 flex h-[56px] max-h-[56px] shrink-0 items-center justify-between gap-4 border-b border-border bg-panel/95 px-4 text-panel-foreground backdrop-blur-sm"
    >
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
                <Link to={LIST_PATH}>
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Back to list</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex min-w-0 items-center gap-1 text-sm">
          <DetailCrumbOverflow product={leaf && item ? item : undefined} />
          <span className="shrink-0 text-muted-foreground" aria-hidden>
            /
          </span>
          {leaf ? (
            <LeafCrumb
              leaf={leaf}
              siblings={siblings}
              locked={navLocked}
              tone="muted"
              iconOnly
            />
          ) : (
            <Link
              to={LIST_PATH}
              title="Workflows"
              className="max-w-[10rem] shrink-0 truncate rounded-md px-1 py-0.5 font-normal text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted"
            >
              Workflows
            </Link>
          )}
          <span className="shrink-0 text-muted-foreground" aria-hidden>
            /
          </span>

          <Popover.Root
            open={entityOpen}
            onOpenChange={(o) => {
              if (renaming) return;
              if (!o) {
                window.clearTimeout(switcherClickTimer.current);
                switcherClickTimer.current = undefined;
                setEntityOpen(false);
                setEntitySearch("");
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
                  aria-label="Name"
                  className="h-8 min-w-[14rem] max-w-[28rem] px-2 text-sm font-semibold shadow-none"
                />
              ) : (
                <>
                  <Popover.Trigger asChild>
                    <button
                      type="button"
                      title={title}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startRename();
                      }}
                      className="flex min-w-0 max-w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    >
                      <span data-crumb-fit className="min-w-0 truncate text-sm font-semibold text-foreground">
                        {title}
                      </span>
                      <Badge
                        tone="neutral"
                        fill="light"
                        size="sm"
                        className="shrink-0 font-normal tabular-nums"
                      >
                        #{badgeId}
                      </Badge>
                      <ChevronDown
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    </button>
                  </Popover.Trigger>

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
                </>
              )}
            </div>

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
                    placeholder="Search…"
                    value={entitySearch}
                    onChange={(e) => setEntitySearch(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="mt-2 max-h-64 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <p className="px-2.5 py-3 text-center text-xs text-muted-foreground">
                      No workflows match.
                    </p>
                  ) : (
                    filtered.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        title={w.name}
                        onClick={() => {
                          navigate(w.href);
                          setEntityOpen(false);
                          setEntitySearch("");
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                          w.id === switcherItem.id && "bg-accent font-medium"
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">{w.name}</span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          #{w.displayId}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {scenario.headerActions === "edit" ? (
          <>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    asChild
                  >
                    <Link
                      to={`/wingz/workflows/${id}?scene=previous`}
                      aria-label="Version history"
                    >
                      <History className="size-4" strokeWidth={1.75} aria-hidden />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Version history</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <label className="mr-1 flex items-center gap-2 text-sm text-muted-foreground">
              Publish
              <Switch
                checked={publish}
                onCheckedChange={setPublish}
                aria-label="Publish workflow"
              />
            </label>
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              <Save className="size-3.5" aria-hidden />
              Save
            </Button>
            <Button type="button" size="sm" className="gap-1.5">
              <Play className="size-3.5" aria-hidden />
              Test
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" asChild>
              <Link to={LIST_PATH}>
                <GitBranch className="size-3.5" strokeWidth={1.75} aria-hidden />
                View all workflows
              </Link>
            </Button>
            <Button type="button" size="sm" asChild>
              <Link to={`/wingz/workflows/${WORKFLOW_EDITOR_ID}?scene=history`}>
                Back to run history
              </Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
