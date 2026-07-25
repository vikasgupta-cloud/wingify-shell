import { create } from "zustand";
import { CAMPAIGNS, type Campaign } from "../data/campaigns";
import { greetingFor, replyFor } from "../data/wandzReplies";
import { useQuickViewStore } from "./quickView";
import { useRowsStore } from "./rows";

export type ChatRole = "user" | "assistant";
export type ChatMessage = { id: string; role: ChatRole; body: string; at: string /* ISO */ };

export type WandzContext =
  | { kind: "campaign"; campaignId: string }
  | { kind: "section"; campaignId: string; sectionLabel: string }
  | { kind: "general" };

// A stable per-context key so each conversation is kept separate.
export function contextKey(ctx: WandzContext): string {
  switch (ctx.kind) {
    case "campaign":
      return `campaign:${ctx.campaignId}`;
    case "section":
      return `section:${ctx.campaignId}:${ctx.sectionLabel}`;
    case "general":
      return "general";
  }
}

// Session-unique message id (no persistence, no need for crypto).
let idSeq = 0;
const uid = () => `msg-${(idSeq += 1)}`;

const assistantMsg = (body: string): ChatMessage => ({
  id: uid(),
  role: "assistant",
  body,
  at: new Date().toISOString(),
});

function resolveCampaign(campaignId: string): Campaign | null {
  const { added, archivedIds, deletedIds, statusOverrides } =
    useRowsStore.getState();
  const hidden = new Set([...archivedIds, ...deletedIds]);
  if (hidden.has(campaignId)) return null;
  const found =
    added.find((c) => c.id === campaignId) ??
    CAMPAIGNS.find((c) => c.id === campaignId) ??
    null;
  if (!found) return null;
  const status = statusOverrides[campaignId];
  return status ? { ...found, status } : found;
}

type WandzState = {
  open: boolean;
  /** Side panel vs full-screen preview overlay. */
  fullPreview: boolean;
  context: WandzContext | null;
  threads: Record<string /* contextKey */, ChatMessage[]>;
  pending: boolean;
  openWandz: (context: WandzContext) => void;
  /** Opens Wandz and immediately asks a question (e.g. campaign summary). */
  openWandzAndAsk: (context: WandzContext, prompt: string) => void;
  toggleWandz: (context: WandzContext) => void;
  closeWandz: () => void;
  setFullPreview: (fullPreview: boolean) => void;
  send: (body: string) => void;
  clearThread: (key: string) => void;
};

// NOTE: Replies are CANNED, not real AI — there are no API calls or keys. A
// scripted response is chosen deterministically from the message text (see
// wandzReplies) and revealed after a short, length-derived delay so it reads as
// if Wandz were thinking. Session-only: a reload clears every thread.
export const useWandzStore = create<WandzState>((set, get) => ({
  open: false,
  fullPreview: false,
  context: null,
  threads: {},
  pending: false,

  openWandz: (context) => {
    // Mutual exclusion: the two right-side panels never both render.
    useQuickViewStore.getState().close();
    const key = contextKey(context);
    set((s) => ({
      open: true,
      context,
      threads: s.threads[key]
        ? s.threads
        : { ...s.threads, [key]: [assistantMsg(greetingFor(context))] },
    }));
  },

  openWandzAndAsk: (context, prompt) => {
    get().openWandz(context);
    // Let the greeting paint, then send so the reply shows the thinking state.
    window.setTimeout(() => get().send(prompt), 80);
  },

  // Clicking the same context's Wandz icon again closes the panel.
  toggleWandz: (context) => {
    const s = get();
    if (s.open && s.context && contextKey(s.context) === contextKey(context)) {
      set({ open: false, fullPreview: false });
    } else {
      get().openWandz(context);
    }
  },

  closeWandz: () => set({ open: false, fullPreview: false }),

  setFullPreview: (fullPreview) => set({ fullPreview }),

  send: (body) => {
    const text = body.trim();
    const ctx = get().context;
    if (!text || !ctx || get().pending) return;
    const key = contextKey(ctx);
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      body: text,
      at: new Date().toISOString(),
    };
    set((s) => ({
      pending: true,
      threads: { ...s.threads, [key]: [...(s.threads[key] ?? []), userMsg] },
    }));

    const campaign =
      ctx.kind === "campaign" || ctx.kind === "section"
        ? resolveCampaign(ctx.campaignId)
        : null;

    // Deterministic "thinking" delay derived from message length (700–1100ms).
    const delay = 700 + (text.length % 5) * 100;
    setTimeout(() => {
      const reply = assistantMsg(replyFor(ctx, text, campaign));
      set((s) => ({
        pending: false,
        threads: { ...s.threads, [key]: [...(s.threads[key] ?? []), reply] },
      }));
    }, delay);
  },

  clearThread: (key) =>
    set((s) => {
      const ctx = s.context;
      // Reset to the greeting when clearing the active conversation.
      const seed = ctx && contextKey(ctx) === key ? [assistantMsg(greetingFor(ctx))] : [];
      return { threads: { ...s.threads, [key]: seed } };
    }),
}));
