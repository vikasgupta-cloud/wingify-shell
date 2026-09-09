import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createAiThread,
  draftAiReply,
  titleFromPrompt,
  type AiMessage,
  type AiThread,
} from "@/config/editorAi";
import {
  contextKey,
  useWingzStore,
  type ChatMessage,
} from "@/store/wingz";

function wingzToAiMessages(messages: ChatMessage[], pending: boolean): AiMessage[] {
  const mapped: AiMessage[] = messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.body,
    status: "done" as const,
  }));
  if (pending) {
    mapped.push({
      id: "pending-assistant",
      role: "assistant",
      content: "",
      status: "pending",
    });
  }
  return mapped;
}

/**
 * Editor AI hook. When `campaignId` is set (Wingz canvas), the thread is the
 * shared Wingz campaign conversation — same messages as the form Wingz panel.
 */
export function useEditorAi(campaignId?: string) {
  const campaignCtx = campaignId
    ? ({ kind: "campaign" as const, campaignId })
    : null;
  const campaignKey = campaignCtx ? contextKey(campaignCtx) : null;

  const wingzMessages = useWingzStore((s) =>
    campaignKey ? s.threads[campaignKey] ?? [] : null
  );
  const wingzPending = useWingzStore((s) => s.pending);
  const setContext = useWingzStore((s) => s.setContext);
  const wingzSend = useWingzStore((s) => s.send);

  const [threads, setThreads] = useState<AiThread[]>(() => [createAiThread()]);
  const [activeThreadId, setActiveThreadId] = useState(
    () => threads[0]!.id
  );
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const syncedThread = useMemo<AiThread | null>(() => {
    if (!campaignKey || wingzMessages == null) return null;
    return {
      id: campaignKey,
      title: "Campaign chat",
      messages: wingzToAiMessages(wingzMessages, wingzPending),
    };
  }, [campaignKey, wingzMessages, wingzPending]);

  const localActive =
    threads.find((t) => t.id === activeThreadId) ?? threads[0]!;

  const activeThread = syncedThread ?? localActive;
  const displayThreads = syncedThread ? [syncedThread] : threads;
  const displayActiveId = syncedThread ? syncedThread.id : activeThreadId;

  const startThread = useCallback(() => {
    if (campaignId) return; // shared campaign thread — no fork in canvas
    const next = createAiThread();
    setThreads((prev) => [next, ...prev]);
    setActiveThreadId(next.id);
  }, [campaignId]);

  const sendPrompt = useCallback(
    (prompt: string, selector?: string) => {
      const trimmed = prompt.trim();
      if (!trimmed) return false;

      if (campaignId && campaignCtx) {
        if (wingzPending) return false;
        setContext(campaignCtx);
        wingzSend(trimmed);
        return true;
      }

      if (busy) return false;

      const userId = `u-${Date.now()}`;
      const assistantId = `a-${Date.now()}`;

      setThreads((prev) => {
        const list = prev.length ? prev : [createAiThread()];
        const currentId = list.some((t) => t.id === activeThreadId)
          ? activeThreadId
          : list[0]!.id;
        return list.map((thread) => {
          if (thread.id !== currentId) return thread;
          const titled =
            thread.messages.length === 0
              ? titleFromPrompt(trimmed)
              : thread.title;
          return {
            ...thread,
            title: titled,
            messages: [
              ...thread.messages,
              {
                id: userId,
                role: "user" as const,
                content: trimmed,
                selector,
                status: "done" as const,
              },
              {
                id: assistantId,
                role: "assistant" as const,
                content: "",
                selector,
                status: "pending" as const,
              },
            ],
          };
        });
      });

      setBusy(true);
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setThreads((prev) =>
          prev.map((thread) => ({
            ...thread,
            messages: thread.messages.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    status: "done" as const,
                    content: draftAiReply(trimmed, selector),
                  }
                : msg
            ),
          }))
        );
        setBusy(false);
      }, 850);

      return true;
    },
    [
      activeThreadId,
      busy,
      campaignCtx,
      campaignId,
      setContext,
      wingzPending,
      wingzSend,
    ]
  );

  return {
    threads: displayThreads,
    activeThread,
    activeThreadId: displayActiveId,
    setActiveThreadId,
    startThread,
    sendPrompt,
    busy: campaignId ? wingzPending : busy,
  };
}
