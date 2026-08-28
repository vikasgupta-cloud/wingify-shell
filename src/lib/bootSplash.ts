const MIN_VISIBLE_MS = 2000;
const FADE_MS = 400;

let dismissStarted = false;

/** Fade out and remove the static `#boot-splash` from index.html. */
export function dismissBootSplash() {
  if (dismissStarted || typeof document === "undefined") return;
  dismissStarted = true;

  const el = document.getElementById("boot-splash");
  if (!el) return;

  const wait = Math.max(0, MIN_VISIBLE_MS - performance.now());

  window.setTimeout(() => {
    el.classList.add("boot-splash--exit");
    const remove = () => el.remove();
    el.addEventListener("transitionend", remove, { once: true });
    window.setTimeout(remove, FADE_MS + 80);
  }, wait);
}

if (typeof window !== "undefined") {
  window.dismissBootSplash = dismissBootSplash;
}

declare global {
  interface Window {
    dismissBootSplash?: () => void;
  }
}
