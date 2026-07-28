import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Bot,
  MessageSquare,
  Reply,
  SendHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "../../lib/utils";
import {
  CURRENT_USER,
  formatTimelineStamp,
  kindLabel,
  useActivityTimelineStore,
  useCampaignTimeline,
  type TimelineEntry,
  type TimelineFilter,
  type TimelineKind,
} from "../../store/activityTimeline";

const FILTERS: {
  id: TimelineFilter;
  label: string;
  icon?: typeof Activity;
}[] = [
  { id: "all", label: "All" },
  { id: "bot", label: "Automation", icon: Bot },
  { id: "comment", label: "Comments", icon: MessageSquare },
  { id: "activity", label: "Activity", icon: Activity },
];

function KindGlyph({ kind }: { kind: TimelineKind }) {
  const Icon =
    kind === "comment" ? MessageSquare : kind === "bot" ? Bot : Activity;
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm ring-4 ring-background"
      aria-hidden
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

function RichBody({ text }: { text: string }) {
  const parts = text.split(/(@[\w.-]+|#[\w-]+)/g);
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
      {parts.map((part, i) => {
        if (part.startsWith("@") || part.startsWith("#")) {
          return (
            <span
              key={i}
              className="rounded-sm bg-muted px-0.5 font-medium text-foreground"
            >
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

function Composer({
  value,
  onChange,
  placeholder,
  onSubmit,
  autoFocus,
  compact,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onSubmit: (body: string) => void;
  autoFocus?: boolean;
  compact?: boolean;
}) {
  const send = () => {
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
  };

  return (
    <div className={cn("flex gap-3", compact && "pl-11")}>
      {!compact ? (
        <Avatar className="h-9 w-9 shrink-0 border border-border">
          <AvatarFallback className="bg-foreground text-xs font-medium text-background">
            {CURRENT_USER.initials}
          </AvatarFallback>
        </Avatar>
      ) : null}
      <div className="min-w-0 flex-1">
        <Textarea
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={placeholder}
          rows={compact ? 2 : 3}
          className={cn(
            "resize-none border-border bg-background shadow-none",
            "placeholder:text-muted-foreground/80",
            "focus-visible:ring-1 focus-visible:ring-foreground/20"
          )}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            Enter to post · Shift+Enter for a new line
          </p>
          <Button
            type="button"
            size="sm"
            disabled={!value.trim()}
            onClick={send}
            className="h-7 gap-1.5 px-2.5"
          >
            <SendHorizontal className="h-3.5 w-3.5" aria-hidden />
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  campaignId,
  entry,
  replies,
}: {
  campaignId: string;
  entry: TimelineEntry;
  replies: TimelineEntry[];
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const addComment = useActivityTimelineStore((s) => s.addComment);
  const canReply = entry.kind === "comment" || entry.kind === "activity";

  return (
    <li className="relative flex gap-3 pb-8 last:pb-2">
      <div className="relative z-[1] flex flex-col items-center">
        <KindGlyph kind={entry.kind} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {entry.author.name}
          </span>
          {entry.author.role ? (
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {entry.author.role}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatTimelineStamp(entry.at)}
          <span className="mx-1.5 text-border">|</span>
          {kindLabel(entry.kind)}
        </p>
        <div className="mt-2.5">
          <RichBody text={entry.body} />
        </div>

        {canReply ? (
          <button
            type="button"
            onClick={() => setReplyOpen((o) => !o)}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-foreground/70 underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            <Reply className="h-3 w-3" aria-hidden />
            {replyOpen ? "Cancel" : "Reply"}
          </button>
        ) : null}

        {replies.length > 0 ? (
          <ul className="mt-4 space-y-4 border-l border-border pl-4">
            {replies.map((reply) => (
              <li key={reply.id} className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Avatar className="h-6 w-6 border border-border">
                    <AvatarFallback className="bg-muted text-[10px] font-medium text-foreground">
                      {reply.author.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">
                    {reply.author.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimelineStamp(reply.at)}
                  </span>
                </div>
                <div className="mt-1.5 pl-8">
                  <RichBody text={reply.body} />
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {replyOpen ? (
          <div className="mt-3">
            <Composer
              compact
              autoFocus
              value={replyDraft}
              onChange={setReplyDraft}
              placeholder={`Reply to ${entry.author.name}…`}
              onSubmit={(body) => {
                addComment(campaignId, body, entry.id);
                setReplyDraft("");
                setReplyOpen(false);
              }}
            />
          </div>
        ) : null}
      </div>
    </li>
  );
}

export default function ActivityTimeline({
  campaignId,
  initialFilter,
}: {
  campaignId: string;
  /** When opening from Chat / Activity rail, land on the matching tab. */
  initialFilter?: TimelineFilter;
}) {
  // Seed this campaign's timeline once (idempotent) before reading.
  useActivityTimelineStore.getState().ensureCampaign(campaignId);

  const slice = useCampaignTimeline(campaignId);
  const setFilter = useActivityTimelineStore((s) => s.setFilter);
  const setDraft = useActivityTimelineStore((s) => s.setDraft);
  const addComment = useActivityTimelineStore((s) => s.addComment);
  const lastInitial = useRef<string | undefined>(undefined);

  // Apply rail default when open source changes (Chat → Comments, Activity → All).
  useEffect(() => {
    if (!initialFilter) return;
    const token = `${campaignId}:${initialFilter}`;
    if (lastInitial.current === token) return;
    lastInitial.current = token;
    setFilter(campaignId, initialFilter);
  }, [campaignId, initialFilter, setFilter]);

  const roots = useMemo(() => {
    const top = slice.entries.filter((e) => !e.parentId);
    const visible =
      slice.filter === "all"
        ? top
        : top.filter((e) => e.kind === slice.filter);
    return visible.sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
    );
  }, [slice.entries, slice.filter]);

  const repliesFor = (id: string) =>
    slice.entries
      .filter((e) => e.parentId === id)
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-4 border-b border-border px-4 py-4">
        <Composer
          value={slice.draft}
          onChange={(v) => setDraft(campaignId, v)}
          placeholder="Comment or use @ to tag others and # for variations and metrics."
          onSubmit={(body) => addComment(campaignId, body)}
        />

        <div className="flex justify-center">
          <div
            role="tablist"
            aria-label="Timeline filter"
            className="inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/60 p-1"
          >
            {FILTERS.map(({ id, label, icon: Icon }) => {
              const active = slice.filter === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(campaignId, id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {roots.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </p>
        ) : (
          <ul className="relative">
            <span
              className="absolute bottom-2 left-4 top-2 w-px bg-border"
              aria-hidden
            />
            {roots.map((entry) => (
              <TimelineItem
                key={entry.id}
                campaignId={campaignId}
                entry={entry}
                replies={repliesFor(entry.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
