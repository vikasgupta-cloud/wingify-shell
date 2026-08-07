import defaultUrl from "../assets/wingify-logo.png";
import listenUrl from "../assets/mascots/listen.png";
import chooseUrl from "../assets/mascots/choose.png";
import lookUrl from "../assets/mascots/look.png";
import actUrl from "../assets/mascots/act.png";
import questionUrl from "../assets/mascots/question.png";
import defaultDarkUrl from "../assets/mascots/dark/default.png";
import listenDarkUrl from "../assets/mascots/dark/listen.png";
import chooseDarkUrl from "../assets/mascots/dark/choose.png";
import lookDarkUrl from "../assets/mascots/dark/look.png";
import actDarkUrl from "../assets/mascots/dark/act.png";
import questionDarkUrl from "../assets/mascots/dark/question.png";
import type { ColorMode } from "./themes";

/**
 * Brand mascot poses — swap the rail mark by product flow
 * (Listen / Choose / Look / Act / Question). Unassigned products use `default`.
 */
export const FLOW_MASCOT_IDS = [
  "listen",
  "choose",
  "look",
  "act",
  "question",
] as const;

export type FlowMascotId = (typeof FLOW_MASCOT_IDS)[number];

export const MASCOT_IDS = ["default", ...FLOW_MASCOT_IDS] as const;

export type MascotId = (typeof MASCOT_IDS)[number];

/** Mark for Home and any product without an assigned pose. */
export const DEFAULT_MASCOT_ID: MascotId = "default";

/** Light mode: dark body, yellow eye. */
export const MASCOT_ASSETS: Record<MascotId, string> = {
  default: defaultUrl,
  listen: listenUrl,
  choose: chooseUrl,
  look: lookUrl,
  act: actUrl,
  question: questionUrl,
};

/** Dark mode: white body, yellow eye unchanged. */
export const MASCOT_ASSETS_DARK: Record<MascotId, string> = {
  default: defaultDarkUrl,
  listen: listenDarkUrl,
  choose: chooseDarkUrl,
  look: lookDarkUrl,
  act: actDarkUrl,
  question: questionDarkUrl,
};

export function mascotAsset(id: MascotId, colorMode: ColorMode): string {
  return colorMode === "dark" ? MASCOT_ASSETS_DARK[id] : MASCOT_ASSETS[id];
}

export const MASCOT_LABELS: Record<MascotId, string> = {
  default: "Wingify",
  listen: "Listen",
  choose: "Choose",
  look: "Look",
  act: "Act",
  question: "Question",
};

/**
 * Only products listed here get a flow pose.
 * Longest-prefix wins; everything else → DEFAULT_MASCOT_ID.
 */
const MASCOT_ROUTE_PREFIXES: { prefix: string; mascot: FlowMascotId }[] = [
  { prefix: "/pulse", mascot: "listen" },
  { prefix: "/personalize", mascot: "choose" },
  { prefix: "/commerce", mascot: "choose" },
  { prefix: "/insights", mascot: "look" },
  { prefix: "/web-experiment", mascot: "act" },
  { prefix: "/engage", mascot: "act" },
  { prefix: "/feature-management", mascot: "act" },
  { prefix: "/wandz", mascot: "question" },
  { prefix: "/helpdesk", mascot: "question" },
];

export function mascotForPath(pathname: string): MascotId {
  let best: { prefix: string; mascot: FlowMascotId } | null = null;
  for (const entry of MASCOT_ROUTE_PREFIXES) {
    const hit =
      pathname === entry.prefix || pathname.startsWith(entry.prefix + "/");
    if (!hit) continue;
    if (!best || entry.prefix.length > best.prefix.length) best = entry;
  }
  return best?.mascot ?? DEFAULT_MASCOT_ID;
}
