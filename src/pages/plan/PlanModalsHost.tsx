/** Plan observation drawer + hypothesis dialogs (visual mocks; Close works). */
import {
  ChevronDown,
  EllipsisVertical,
  HelpCircle,
  MessageSquare,
  Pencil,
  PlusCircle,
  Search,
  Sparkles,
  Star,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  getPlanHypothesis,
  getPlanObservation,
} from "@/data/plan";
import { cn } from "@/lib/utils";
import { usePlanModalsStore } from "@/store/planModals";

function CommentsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <span className="relative inline-flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <MessageSquare className="size-7" strokeWidth={1.5} aria-hidden />
        <Search
          className="absolute bottom-1 right-1 size-4 rounded-full bg-background p-0.5"
          strokeWidth={2}
          aria-hidden
        />
      </span>
      <p className="text-sm font-medium text-foreground">No comments yet</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        Start the conversation by leaving a comment or tagging a teammate.
      </p>
    </div>
  );
}

function CommentComposer() {
  return (
    <div className="flex items-start gap-2">
      <span
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
        aria-hidden
      >
        V
      </span>
      <Input
        readOnly
        placeholder="Comment or use @ to tag others."
        className="h-9"
      />
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(5, value)) * 20;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground">
          {value} <span className="text-muted-foreground">/ 5</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground/70"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RatingRow({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label className="text-sm font-medium">{label}</Label>
        <HelpCircle className="size-3.5 text-muted-foreground" aria-hidden />
      </div>
      <div className="inline-flex overflow-hidden rounded-md border border-border">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled
            className={cn(
              "h-8 w-9 border-r border-border text-sm last:border-r-0",
              value === n
                ? "bg-muted font-medium text-foreground"
                : "bg-background text-muted-foreground"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function ObservationDrawer() {
  const id = usePlanModalsStore((s) => s.observationId);
  const close = usePlanModalsStore((s) => s.closeObservation);
  const row = id ? getPlanObservation(id) : undefined;

  return (
    <Sheet
      open={Boolean(id)}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md"
      >
        {row ? (
          <>
            <SheetHeader className="space-y-0 border-b border-border px-6 py-5 text-left">
              <div className="flex items-start justify-between gap-3 pr-8">
                <SheetTitle className="text-2xl font-semibold tracking-tight">
                  {row.displayId}
                </SheetTitle>
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled
                    aria-label={row.starred ? "Unstar" : "Star"}
                    className="size-8 text-muted-foreground"
                  >
                    <Star
                      className={cn(
                        "size-4",
                        row.starred && "fill-foreground text-foreground"
                      )}
                      strokeWidth={1.75}
                    />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled
                    aria-label="More actions"
                    className="size-8 text-muted-foreground"
                  >
                    <EllipsisVertical className="size-4" strokeWidth={1.75} />
                  </Button>
                </div>
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-8 px-6 py-6">
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">Description</p>
                <p className="text-sm text-foreground">{row.description}</p>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">Page URL</p>
                <a
                  href={row.pageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm text-[var(--info-fg)] underline-offset-2 hover:underline"
                >
                  {row.pageUrl}
                </a>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-foreground">Comments</p>
                <CommentComposer />
                <CommentsEmpty />
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function NewObservationDialog() {
  const open = usePlanModalsStore((s) => s.createObservation);
  const close = usePlanModalsStore((s) => s.closeCreateObservation);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent className="max-w-lg gap-0 p-0 sm:rounded-xl">
        <DialogHeader className="space-y-0 border-b border-border px-6 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            New Observation
            <Pencil className="size-3.5 text-muted-foreground" aria-hidden />
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="new-obs-description">Description</Label>
            <Textarea
              id="new-obs-description"
              readOnly
              placeholder="What did you notice?"
              className="min-h-[88px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-obs-url">Page URL</Label>
            <Input
              id="new-obs-url"
              readOnly
              placeholder="E.g. https://app.wingify.com"
            />
          </div>
        </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="button" onClick={close}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HypothesisDetailDialog() {
  const id = usePlanModalsStore((s) => s.hypothesisId);
  const close = usePlanModalsStore((s) => s.closeHypothesis);
  const row = id ? getPlanHypothesis(id) : undefined;

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        {row ? (
          <>
            <DialogHeader className="space-y-0 border-b border-border px-6 py-4 text-left">
              <div className="flex items-start justify-between gap-3 pr-8">
                <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Sparkles
                    className="size-4 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  {row.name}
                </DialogTitle>
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled
                    aria-label={row.starred ? "Unstar" : "Star"}
                    className="size-8 text-muted-foreground"
                  >
                    <Star
                      className={cn(
                        "size-4",
                        row.starred && "fill-foreground text-foreground"
                      )}
                      strokeWidth={1.75}
                    />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled
                    aria-label="More actions"
                    className="size-8 text-muted-foreground"
                  >
                    <EllipsisVertical className="size-4" strokeWidth={1.75} />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-[1fr_240px]">
              <div className="space-y-8 overflow-y-auto px-6 py-5">
                <div className="space-y-3 text-sm leading-relaxed text-foreground">
                  <p className="text-muted-foreground">
                    {row.description || "Based on observations -- ,"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">I expect that </span>
                    <span className="font-semibold">{row.expectThat}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">will address </span>
                    <span className="font-semibold">{row.willAddress}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Link Test</p>
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--info-fg)]"
                  >
                    <PlusCircle className="size-4" strokeWidth={1.75} />
                    Create a Test
                    <ChevronDown className="size-3.5 opacity-70" strokeWidth={1.75} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-foreground">Comments</p>
                  <CommentComposer />
                  <CommentsEmpty />
                </div>
              </div>

              <aside className="space-y-6 overflow-y-auto border-t border-border bg-muted/30 px-5 py-5 md:border-l md:border-t-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-semibold tabular-nums text-foreground">
                      {row.score}{" "}
                      <span className="text-base font-normal text-muted-foreground">
                        / 5
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Prioritization Score
                    </p>
                  </div>
                  <div className="space-y-3">
                    <ScoreBar label="Confidence" value={row.confidence || 0} />
                    <ScoreBar label="Importance" value={row.importance} />
                    <ScoreBar label="Ease" value={row.ease} />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <p className="text-sm text-foreground">{row.status}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Page URL</p>
                  <a
                    href={row.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-sm text-[var(--info-fg)] underline-offset-2 hover:underline"
                  >
                    {row.pageUrl}
                  </a>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Attachments
                  </p>
                  <p className="text-sm text-muted-foreground">
                    No attachments associated yet.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Labels</p>
                  <p className="text-sm text-muted-foreground">
                    {row.labels === "-" || !row.labels
                      ? "No labels associated yet."
                      : row.labels}
                  </p>
                </div>

                <p className="pt-2 text-xs text-muted-foreground">
                  Created on {row.createdOn} by {row.createdBy}
                </p>
              </aside>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function NewHypothesisDialog() {
  const open = usePlanModalsStore((s) => s.createHypothesis);
  const close = usePlanModalsStore((s) => s.closeCreateHypothesis);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <SheetHeader className="space-y-0 border-b border-border px-6 py-4 text-left">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
            New Hypothesis
            <Pencil className="size-3.5 text-muted-foreground" aria-hidden />
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label>Based on observation</Label>
            <Input readOnly placeholder="Type to search" />
          </div>

          <div className="space-y-2">
            <Label>I expect that</Label>
            <Textarea
              readOnly
              placeholder="What is the solution to the problem? E.g. Reduce number of form fields for Sign Up form."
              className="min-h-[88px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>will address</Label>
            <Textarea
              readOnly
              placeholder="What is the problem that you are trying to solve? E.g. visitors are not completing Sign Up form."
              className="min-h-[88px] resize-none"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <RatingRow label="Confidence" value={null} />
              <RatingRow label="Importance" value={null} />
              <RatingRow label="Ease" value={null} />
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label>Source</Label>
                  <HelpCircle
                    className="size-3.5 text-muted-foreground"
                    aria-hidden
                  />
                </div>
                <Input readOnly placeholder="E.g. https://app.wingify.com" />
              </div>
              <div className="space-y-2">
                <Label>Attachments</Label>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--info-fg)]"
                >
                  <PlusCircle className="size-4" strokeWidth={1.75} />
                  Upload files
                </button>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  File types supported png, jpeg, pdf, doc, docx, csv, xls, webp,
                  gif. Max file size supported: 5 MB. Total file size supported:
                  10 MB.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Labels</Label>
                <Input readOnly placeholder="E.g. Homepage" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="button" onClick={close}>
            Create
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Mount on Plan list pages so Create + row clicks share one store. */
export default function PlanModalsHost() {
  return (
    <>
      <ObservationDrawer />
      <NewObservationDialog />
      <HypothesisDetailDialog />
      <NewHypothesisDialog />
    </>
  );
}
