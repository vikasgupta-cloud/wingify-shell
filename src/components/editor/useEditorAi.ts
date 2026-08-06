import { useCallback, useEffect, useRef, useState } from "react";
import {
  createAiThread,
  draftAiReply,
  titleFromPrompt,
  type AiThread,
} from "@/config/editorAi";

export function useEditorAi() {
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

  const activeThread =
    threads.find((t) => t.id === activeThreadId) ?? threads[0]!;

  const startThread = useCallback(() => {
    const next = createAiThread();
    setThreads((prev) => [next, ...prev]);
    setActiveThreadId(next.id);
  }, []);

  const sendPrompt = useCallback(
    (prompt: string, selector?: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || busy) return false;

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
    [activeThreadId, busy]
  );

  return {
    threads,
    activeThread,
    activeThreadId,
    setActiveThreadId,
    startThread,
    sendPrompt,
    busy,
  };
}
