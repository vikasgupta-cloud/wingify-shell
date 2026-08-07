export type AiRole = "user" | "assistant";

export type AiMessage = {
  id: string;
  role: AiRole;
  content: string;
  selector?: string;
  status?: "pending" | "done";
};

export type AiThread = {
  id: string;
  title: string;
  messages: AiMessage[];
};

export function createAiThread(): AiThread {
  return {
    id: `thread-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "New chat",
    messages: [],
  };
}

export function titleFromPrompt(prompt: string) {
  const clean = prompt.replace(/\s+/g, " ").trim();
  if (clean.length <= 36) return clean;
  return `${clean.slice(0, 36).trimEnd()}…`;
}

export function draftAiReply(prompt: string, selector?: string) {
  const target = selector ? `\`${selector}\`` : "the selected element";
  const lower = prompt.toLowerCase();
  if (/(colou?r|background|contrast)/.test(lower)) {
    return `Updated ${target} color to match your request. Contrast stays readable in this variation.`;
  }
  if (/(larger|bigger|smaller|size|font)/.test(lower)) {
    return `Adjusted type size on ${target}. Check desktop and mobile so hierarchy still holds.`;
  }
  if (/(hide|remove|delete)/.test(lower)) {
    return `Hid ${target} in this variation. Restore it from Changes if you need it back.`;
  }
  if (/(copy|text|headline|cta|button)/.test(lower)) {
    return `Rewrote copy on ${target} to be clearer and more action-oriented.`;
  }
  if (/(move|align|spacing|padding|margin)/.test(lower)) {
    return `Shifted layout on ${target}. Spacing is tighter and aligned with nearby blocks.`;
  }
  return `Applied a draft change to ${target} for “${prompt.trim()}”. Review it on the canvas, then keep prompting for another pass.`;
}
