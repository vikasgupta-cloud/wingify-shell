import listenUrl from "../assets/mascots/listen.png";
import chooseUrl from "../assets/mascots/choose.png";
import lookUrl from "../assets/mascots/look.png";
import actUrl from "../assets/mascots/act.png";
import questionUrl from "../assets/mascots/question.png";

/**
 * Brand mascot poses — swap the rail mark by product flow
 * (see mascot variations: Listen / Choose / Look / Act / Question).
 */
export const MASCOT_IDS = [
  "listen",
  "choose",
  "look",
  "act",
  "question",
] as const;

export type MascotId = (typeof MASCOT_IDS)[number];

export const DEFAULT_MASCOT_ID: MascotId = "act";

export const MASCOT_ASSETS: Record<MascotId, string> = {
  listen: listenUrl,
  choose: chooseUrl,
  look: lookUrl,
  act: actUrl,
  question: questionUrl,
};

export const MASCOT_LABELS: Record<MascotId, string> = {
  listen: "Listen",
  choose: "Choose",
  look: "Look",
  act: "Act",
  question: "Question",
};

/** Longest-prefix wins. Unlisted paths fall back to Act (default brand mark). */
const MASCOT_ROUTE_PREFIXES: { prefix: string; mascot: MascotId }[] = [
  { prefix: "/pulse", mascot: "listen" },
  { prefix: "/personalize", mascot: "choose" },
  { prefix: "/commerce", mascot: "choose" },
  { prefix: "/insights", mascot: "look" },
  { prefix: "/web-experiment", mascot: "act" },
  { prefix: "/engage", mascot: "act" },
  { prefix: "/feature-management", mascot: "act" },
  { prefix: "/wandz", mascot: "question" },
  { prefix: "/helpdesk", mascot: "question" },
  { prefix: "/editor", mascot: "act" },
];

export function mascotForPath(pathname: string): MascotId {
  let best: { prefix: string; mascot: MascotId } | null = null;
  for (const entry of MASCOT_ROUTE_PREFIXES) {
    const hit =
      pathname === entry.prefix || pathname.startsWith(entry.prefix + "/");
    if (!hit) continue;
    if (!best || entry.prefix.length > best.prefix.length) best = entry;
  }
  return best?.mascot ?? DEFAULT_MASCOT_ID;
}
