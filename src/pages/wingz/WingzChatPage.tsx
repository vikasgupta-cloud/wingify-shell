// @summary Full-page Wingz chat + campaign canvas (editor/form) with shared AI thread.
// Canvas drops the right chat column and uses editor Copilot / form Wingz panel.
// Exit leaves a campaign artifact in main chat (status, name, URL, created).
// Top-right library popover lists campaign artifacts + uploaded files.
// Uses shadcn Button/Textarea/Separator/Avatar/Popover and dummy data from @/data/wingzChat.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  Files,
  FlaskConical,
  MessageSquare,
  Mic,
  PanelLeft,
  Plus,
  SendHorizontal,
  Sparkles,
} from "@/components/icons/protoLucide";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CURRENT_USER } from "@/config/navigation";
import {
  draftCampaignNameFromChat,
  extractUrlFromText,
  isCampaignEditIntent,
  WINGZ_CHAT_CTAS,
  WINGZ_COMPOSER_PLACEHOLDER,
  WINGZ_EMPTY_SUBTITLE,
  WINGZ_RECENT_ACTIVITY,
  WINGZ_SAVED_CHATS,
  WINGZ_TASKS,
  WINGZ_TIP,
  WINGZ_USER_FIRST_NAME,
  wingzAskForUrlMessage,
  wingzCampaignArtifactMessage,
  wingzCanvasOpenedMessage,
  wingzChatToStoreMessages,
  wingzNeedUrlAgainMessage,
  wingzReplyFor,
  wingzUserMessage,
  type WingzCampaignArtifact,
  type WingzChatMessage,
  type WingzChatUpload,
} from "@/data/wingzChat";
import { cn } from "@/lib/utils";
import ConfigPage from "@/pages/config/ConfigPage";
import EditorPage from "@/pages/editor/EditorPage";
import { useConfigStore } from "@/store/config";
import { useRowsStore, useVisibleCampaigns } from "@/store/rows";
import { useWingzStore } from "@/store/wingz";

const CTA_ICONS = {
  create: FlaskConical,
  analyze: Sparkles,
  friction: MessageSquare,
  ideas: Sparkles,
  explore: MessageSquare,
} as const;

type CanvasSurface = "editor" | "form";
type CanvasState = {
  campaignId: string;
  pageUrl: string;
  surface: CanvasSurface;
} | null;

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function ChatLibraryPopover({
  artifacts,
  uploads,
  onOpenArtifact,
  onOpenUpload,
}: {
  artifacts: WingzCampaignArtifact[];
  uploads: WingzChatUpload[];
  onOpenArtifact: (artifact: WingzCampaignArtifact) => void;
  onOpenUpload: (file: WingzChatUpload) => void;
}) {
  const empty = artifacts.length === 0 && uploads.length === 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0 shadow-none"
          aria-label="Open chat library"
        >
          <Files className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">Library</p>
          <p className="text-xs text-muted-foreground">
            Campaigns and files from this chat
          </p>
        </div>
        {empty ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nothing here yet. Attach a file or create a campaign to see it in
            this library.
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto py-1">
            {artifacts.length > 0 ? (
              <div className="px-2 pb-1 pt-2">
                <p className="px-1 pb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                  Campaigns
                </p>
                <ul className="space-y-0.5">
                  {artifacts.map((a) => (
                    <li key={a.campaignId}>
                      <button
                        type="button"
                        className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-muted"
                        onClick={() => onOpenArtifact(a)}
                      >
                        <FlaskConical
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {a.name}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {a.status}
                            {a.url ? ` · ${a.url}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {uploads.length > 0 ? (
              <div className="px-2 pb-2 pt-2">
                {artifacts.length > 0 ? (
                  <Separator className="mb-2" />
                ) : null}
                <p className="px-1 pb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                  Files
                </p>
                <ul className="space-y-0.5">
                  {uploads.map((f) => (
                    <li key={f.id}>
                      <button
                        type="button"
                        className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-muted"
                        onClick={() => onOpenUpload(f)}
                      >
                        <FileText
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {f.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {formatBytes(f.size)}
                            {f.type ? ` · ${f.type}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function MessageBubble({
  message,
  onSuggest,
  onOpenArtifact,
}: {
  message: WingzChatMessage;
  onSuggest?: (text: string) => void;
  onOpenArtifact?: (artifact: NonNullable<WingzChatMessage["artifact"]>) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end gap-3">
        <div className="flex max-w-[min(100%,36rem)] flex-col items-end gap-1">
          <span className="px-1 text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
            You
          </span>
          <p className="text-right text-sm leading-relaxed text-foreground">
            {message.text}
          </p>
        </div>
        <Avatar className="mt-5 size-8 shrink-0">
          <AvatarFallback className="border border-border bg-muted text-[11px] font-medium text-foreground">
            {CURRENT_USER.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  const createdLabel = message.artifact
    ? new Date(message.artifact.createdOn).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="flex gap-3">
      <div className="mt-5 flex size-8 shrink-0 items-center justify-center rounded-full bg-highlight-bg">
        <Sparkles className="size-3.5 text-highlight-fg" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="px-1 text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
          Wingz
        </span>
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground">{message.text}</p>

          {message.artifact ? (
            <div className="overflow-hidden rounded-xl border border-border bg-panel">
              <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {message.artifact.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Web Experimentation · AB – Single Page
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                  {message.artifact.status}
                </span>
              </div>
              <dl className="space-y-2 px-4 py-3 text-xs">
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-muted-foreground">URL</dt>
                  <dd className="min-w-0 truncate font-medium text-foreground">
                    {message.artifact.url || "—"}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-muted-foreground">Created</dt>
                  <dd className="font-medium text-foreground">{createdLabel}</dd>
                </div>
              </dl>
              <div className="border-t border-border px-4 py-3">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 shadow-none"
                  onClick={() => onOpenArtifact?.(message.artifact!)}
                >
                  Open campaign
                </Button>
              </div>
            </div>
          ) : null}

          {message.reasoning ? (
            <details className="rounded-lg border border-border bg-background px-3 py-2">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                Reasoning
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {message.reasoning}
              </p>
            </details>
          ) : null}

          {message.bullets ? (
            <div>
              <p className="text-sm font-medium text-foreground">
                {message.bullets.title}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                {message.bullets.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {message.tables?.map((table) => (
            <div
              key={table.caption ?? table.columns.join("-")}
              className="overflow-x-auto rounded-lg border border-border"
            >
              {table.caption ? (
                <p className="border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                  {table.caption}
                </p>
              ) : null}
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {table.columns.map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 font-medium text-muted-foreground"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, i) => (
                    <tr
                      key={`${table.caption}-${i}`}
                      className="border-b border-border last:border-0"
                    >
                      {row.map((cell, j) => (
                        <td
                          key={`${i}-${j}`}
                          className="px-3 py-2 text-foreground"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {message.takeaway ? (
            <p className="text-sm leading-relaxed text-foreground">
              {message.takeaway}
            </p>
          ) : null}

          {message.suggestions?.length ? (
            <div className="flex flex-wrap gap-2">
              {message.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-border-hover hover:bg-muted hover:text-foreground"
                  onClick={() => onSuggest?.(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSend,
  onAttach,
  compact,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onAttach?: (files: FileList) => void;
  compact?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-background transition-[box-shadow,border-color] duration-200",
        "focus-within:border-[var(--semantic-border-focus)] focus-within:ring-2 focus-within:ring-[var(--semantic-border-focus)]/15"
      )}
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={compact ? 2 : 3}
        className={cn(
          "resize-none border-0 bg-transparent px-5 pt-4 text-[15px] leading-relaxed shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0",
          compact ? "min-h-[72px]" : "min-h-[96px]"
        )}
        placeholder={WINGZ_COMPOSER_PLACEHOLDER}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <div className="flex items-center justify-between gap-3 px-3.5 pb-3.5 pt-1">
        <div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            multiple
            onChange={(e) => {
              if (e.target.files?.length) onAttach?.(e.target.files);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label="Add attachment"
            onClick={() => fileRef.current?.click()}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Thinking
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label="Voice input"
          >
            <Mic className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            className="size-8 transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97]"
            aria-label="Send to Wingz"
            onClick={onSend}
            disabled={!value.trim()}
          >
            <SendHorizontal className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WingzChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<WingzChatMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [awaitingUrl, setAwaitingUrl] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [canvas, setCanvas] = useState<CanvasState>(null);
  const [uploads, setUploads] = useState<WingzChatUpload[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const createCampaign = useRowsStore((s) => s.createCampaign);
  const updateCampaign = useRowsStore((s) => s.updateCampaign);
  const campaigns = useVisibleCampaigns();
  const seedThread = useWingzStore((s) => s.seedThread);
  const openWingz = useWingzStore((s) => s.openWingz);
  const closeWingz = useWingzStore((s) => s.closeWingz);
  const setWingzContext = useWingzStore((s) => s.setContext);
  const configName = useConfigStore((s) =>
    canvas ? s.configs[canvas.campaignId]?.name : undefined
  );
  const configEditorUrl = useConfigStore((s) =>
    canvas ? s.configs[canvas.campaignId]?.editorUrl : undefined
  );

  const isEmpty = messages.length === 0;
  const inCanvas = canvas !== null;

  const libraryArtifacts = useMemo(() => {
    const seen = new Set<string>();
    const list: WingzCampaignArtifact[] = [];
    for (const m of messages) {
      if (!m.artifact) continue;
      if (seen.has(m.artifact.campaignId)) continue;
      seen.add(m.artifact.campaignId);
      list.push(m.artifact);
    }
    return list;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    return () => {
      for (const f of uploads) {
        if (f.objectUrl) URL.revokeObjectURL(f.objectUrl);
      }
    };
    // Only revoke on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Collapse Wingz sidebar when entering canvas; keep it available to expand.
  useEffect(() => {
    if (inCanvas) setSidebarOpen(false);
  }, [inCanvas]);

  // Sync form name / editor URL back onto the Web Exp list campaign.
  useEffect(() => {
    if (!canvas) return;
    const partial: { name?: string; url?: string } = {};
    if (configName) partial.name = configName;
    if (configEditorUrl !== undefined) partial.url = configEditorUrl;
    if (Object.keys(partial).length) {
      updateCampaign(canvas.campaignId, partial);
    }
  }, [canvas, configName, configEditorUrl, updateCampaign]);

  // Contextual AI: form → floating Wingz; editor → Copilot only (dock closed).
  useEffect(() => {
    if (!canvas) {
      closeWingz();
      return;
    }
    const ctx = { kind: "campaign" as const, campaignId: canvas.campaignId };
    setWingzContext(ctx);
    if (canvas.surface === "form") openWingz(ctx);
    else closeWingz();
  }, [canvas, closeWingz, openWingz, setWingzContext]);

  const applyCampaignAiSeed = (
    campaignId: string,
    threadSource: WingzChatMessage[]
  ) => {
    const ctx = { kind: "campaign" as const, campaignId };
    seedThread(ctx, wingzChatToStoreMessages(threadSource));
  };

  const openCanvas = (
    sourcePrompt: string,
    url: string,
    threadSource: WingzChatMessage[]
  ) => {
    const name = draftCampaignNameFromChat(sourcePrompt, url);
    const campaignId = createCampaign("A/B", { name, url });
    applyCampaignAiSeed(campaignId, threadSource);
    setCanvas({ campaignId, pageUrl: url, surface: "editor" });
    setAwaitingUrl(false);
    setPendingPrompt("");
    return wingzCanvasOpenedMessage(name, url);
  };

  const reopenFromArtifact = (artifact: WingzCampaignArtifact) => {
    setCanvas({
      campaignId: artifact.campaignId,
      pageUrl: artifact.url,
      surface: artifact.lastSurface,
    });
    setWingzContext({ kind: "campaign", campaignId: artifact.campaignId });
    if (artifact.lastSurface === "form") {
      openWingz({ kind: "campaign", campaignId: artifact.campaignId });
    } else {
      closeWingz();
    }
  };

  const exitCanvas = () => {
    if (!canvas) return;
    const campaign = campaigns.find((c) => c.id === canvas.campaignId);
    const artifact: WingzCampaignArtifact = {
      kind: "campaign",
      campaignId: canvas.campaignId,
      name: campaign?.name ?? configName ?? "Campaign",
      status: campaign?.status ?? "Draft",
      url: campaign?.url || canvas.pageUrl,
      createdOn: campaign?.createdOn ?? new Date().toISOString(),
      lastSurface: canvas.surface,
    };
    closeWingz();
    setCanvas(null);
    setMessages((prev) => [...prev, wingzCampaignArtifactMessage(artifact)]);
  };

  const send = (raw?: string) => {
    const text = (raw ?? prompt).trim();
    if (!text) return;
    // Canvas uses contextual AI panels — don't append to main thread.
    if (canvas) return;

    const user = wingzUserMessage(text);
    setPrompt("");
    if (!activeChatId) setActiveChatId("live");

    if (awaitingUrl) {
      const url = extractUrlFromText(text);
      if (url) {
        const source = pendingPrompt || text;
        const nextThread = [...messages, user];
        const opened = openCanvas(source, url, nextThread);
        setMessages((prev) => [...prev, user, opened]);
        return;
      }
      setMessages((prev) => [...prev, user, wingzNeedUrlAgainMessage()]);
      return;
    }

    if (isCampaignEditIntent(text)) {
      const url = extractUrlFromText(text);
      if (url) {
        const nextThread = [...messages, user];
        const opened = openCanvas(text, url, nextThread);
        setMessages((prev) => [...prev, user, opened]);
        return;
      }
      setAwaitingUrl(true);
      setPendingPrompt(text);
      setMessages((prev) => [...prev, user, wingzAskForUrlMessage()]);
      return;
    }

    const reply = wingzReplyFor(text);
    setMessages((prev) => [...prev, user, reply]);
  };

  const startNewChat = () => {
    for (const f of uploads) {
      if (f.objectUrl) URL.revokeObjectURL(f.objectUrl);
    }
    setUploads([]);
    setMessages([]);
    setPrompt("");
    setActiveChatId(null);
    setAwaitingUrl(false);
    setPendingPrompt("");
    setCanvas(null);
    closeWingz();
    setSidebarOpen(true);
  };

  const attachFiles = (list: FileList) => {
    const next: WingzChatUpload[] = Array.from(list).map((file, i) => ({
      id: `file-${Date.now()}-${i}`,
      name: file.name,
      size: file.size,
      type: file.type || "file",
      addedAt: new Date().toISOString(),
      objectUrl: URL.createObjectURL(file),
    }));
    setUploads((prev) => [...next, ...prev]);
    const names = next.map((f) => f.name).join(", ");
    setMessages((prev) => [
      ...prev,
      wingzUserMessage(
        next.length === 1
          ? `Attached ${names}`
          : `Attached ${next.length} files: ${names}`
      ),
    ]);
    if (!activeChatId) setActiveChatId("live");
  };

  const openUpload = (file: WingzChatUpload) => {
    if (file.objectUrl) {
      window.open(file.objectUrl, "_blank", "noopener,noreferrer");
    }
  };

  const setCanvasSurface = (surface: CanvasSurface) => {
    setCanvas((c) => (c ? { ...c, surface } : c));
  };

  const libraryButton = (
    <ChatLibraryPopover
      artifacts={libraryArtifacts}
      uploads={uploads}
      onOpenArtifact={reopenFromArtifact}
      onOpenUpload={openUpload}
    />
  );

  const mainChat = (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <div className="absolute right-4 top-3 z-10">{libraryButton}</div>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
          <div className="mx-auto w-full max-w-2xl">
            <header className="flex flex-col items-center text-center">
              <h1 className="relative font-heading text-[1.875rem] font-semibold leading-none tracking-tight text-foreground sm:text-[2rem]">
                <Sparkles
                  className="pointer-events-none absolute right-full top-[0.2em] mr-2.5 size-[0.9em] text-foreground"
                  aria-hidden
                />
                Hey there, {WINGZ_USER_FIRST_NAME}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {WINGZ_EMPTY_SUBTITLE}
              </p>
            </header>

            <div className="mt-8 space-y-4">
              <Composer
                value={prompt}
                onChange={setPrompt}
                onSend={() => send()}
                onAttach={attachFiles}
              />

              <div className="flex flex-wrap items-center justify-center gap-2">
                {WINGZ_CHAT_CTAS.map((cta) => {
                  const Icon = CTA_ICONS[cta.id];
                  return (
                    <Button
                      key={cta.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full shadow-none"
                      onClick={() => send(cta.prompt)}
                    >
                      <Icon aria-hidden />
                      {cta.label}
                    </Button>
                  );
                })}
              </div>

              <p className="pt-2 text-center text-xs text-muted-foreground">
                {WINGZ_TIP}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 pt-14">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  onSuggest={send}
                  onOpenArtifact={reopenFromArtifact}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
          <div className="shrink-0 bg-background px-6 py-4">
            <div className="mx-auto w-full max-w-2xl">
              <Composer
                value={prompt}
                onChange={setPrompt}
                onSend={() => send()}
                onAttach={attachFiles}
                compact
              />
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex h-full min-h-0">
      {/* Secondary Wingz sidebar — collapses in canvas mode but stays available. */}
      {sidebarOpen ? (
        <aside className="flex w-64 shrink-0 flex-col border-r border-panel-border bg-panel">
          <div className="flex items-center gap-2 px-3 py-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9 shrink-0 shadow-none"
              aria-label="Collapse chat sidebar"
              onClick={() => setSidebarOpen(false)}
            >
              <PanelLeft className="size-4" />
            </Button>
            <Button
              type="button"
              className="h-9 flex-1 justify-start gap-2 shadow-none"
              onClick={startNewChat}
            >
              <Plus className="size-4" />
              New Chat
            </Button>
          </div>

          <Separator />

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
            <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Tasks
            </p>
            <ul className="mb-4 space-y-0.5">
              {WINGZ_TASKS.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-muted"
                  >
                    {task.title}
                  </button>
                </li>
              ))}
            </ul>

            <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Recents
            </p>
            <ul className="mb-4 space-y-0.5">
              {WINGZ_RECENT_ACTIVITY.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-muted"
                    onClick={() => send(`Summarise the campaign: ${item.title}`)}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>

            <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Chats
            </p>
            <ul className="space-y-0.5">
              {WINGZ_SAVED_CHATS.map((chat) => (
                <li key={chat.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col rounded-md px-2 py-1.5 text-left hover:bg-muted",
                      activeChatId === chat.id && "bg-muted"
                    )}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setMessages([
                        wingzUserMessage(chat.preview),
                        wingzReplyFor(chat.preview),
                      ]);
                    }}
                  >
                    <span className="truncate text-sm font-medium text-foreground">
                      {chat.title}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {chat.preview}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="sticky bottom-0 shrink-0 border-t border-border bg-panel px-3 py-3">
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-start gap-2 shadow-none"
              disabled
              title="Coming soon"
            >
              <Sparkles className="size-4" />
              Wingz updates
            </Button>
          </div>
        </aside>
      ) : (
        <div className="flex w-12 shrink-0 flex-col items-center border-r border-panel-border bg-panel py-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shadow-none"
            aria-label="Expand chat sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeft className="size-4" />
          </Button>
        </div>
      )}

      {inCanvas && canvas ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-3">
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
              <Button
                type="button"
                variant={canvas.surface === "editor" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3 shadow-none"
                onClick={() => setCanvasSurface("editor")}
              >
                Editor
              </Button>
              <Button
                type="button"
                variant={canvas.surface === "form" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3 shadow-none"
                onClick={() => setCanvasSurface("form")}
              >
                Form
              </Button>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {canvas.pageUrl}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 shadow-none"
                onClick={exitCanvas}
              >
                <ArrowLeft className="size-3.5" />
                Exit canvas
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {canvas.surface === "editor" ? (
              <EditorPage
                entityId={canvas.campaignId}
                variationId="v1"
                onExit={exitCanvas}
              />
            ) : (
              <ConfigPage campaignId={canvas.campaignId} embedded />
            )}
          </div>
        </div>
      ) : (
        mainChat
      )}
    </div>
  );
}
