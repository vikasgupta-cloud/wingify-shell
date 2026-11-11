/*
 * New file: header-trail sizing helpers shared by WorkspaceSwitcher, DetailCrumbOverflow and
 * DetailShell, so crumbs give way in a set order without ever overlapping their neighbours.
 * - useShrinkFloor: a shrinkable element may squeeze its flexible text, never its icons/badges.
 * - useSqueezeCollapse: once the flexible parts are squeezed out, fold them away (icon-only).
 */
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

/** Tracks whichever element `ref` points at (it may swap between renders) with one observer. */
function useObserved(
  ref: RefObject<HTMLElement | null>,
  onResize: (el: HTMLElement) => void,
  alsoObserve?: (el: HTMLElement) => Element | null
) {
  const cb = useRef(onResize);
  cb.current = onResize;
  const observed = useRef<{ el: HTMLElement; ro: ResizeObserver } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el) cb.current(el);
    if (observed.current?.el === el) return;
    observed.current?.ro.disconnect();
    observed.current = null;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => cb.current(el));
    ro.observe(el);
    // Children can resize (e.g. a nested crumb folds) while `el` stays pinned at its min-width.
    Array.from(el.children).forEach((child) => ro.observe(child));
    const extra = alsoObserve?.(el);
    if (extra) ro.observe(extra);
    observed.current = { el, ro };
  });

  useEffect(
    () => () => {
      observed.current?.ro.disconnect();
      observed.current = null;
    },
    []
  );
}

/** Width the flex row's visible children need (not `scrollWidth`, which a min-width inflates). */
function contentWidth(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const kids: Element[] = [];
  const collect = (parent: Element) => {
    Array.from(parent.children).forEach((child) => {
      const display = getComputedStyle(child).display;
      if (display === "none") return;
      if (display === "contents") collect(child);
      else kids.push(child);
    });
  };
  collect(el);
  const gap = parseFloat(cs.columnGap) || 0;
  let width =
    (parseFloat(cs.paddingLeft) || 0) +
    (parseFloat(cs.paddingRight) || 0) +
    (parseFloat(cs.borderLeftWidth) || 0) +
    (parseFloat(cs.borderRightWidth) || 0) +
    gap * Math.max(0, kids.length - 1);
  kids.forEach((kid) => {
    const ks = getComputedStyle(kid);
    width +=
      kid.getBoundingClientRect().width +
      (parseFloat(ks.marginLeft) || 0) +
      (parseFloat(ks.marginRight) || 0);
  });
  return width;
}

/**
 * Sets `min-width` on `ref` to its content width minus its flexible parts (`selector` inside it),
 * plus `keep` × their full text width — so those parts shrink down to `keep` and no further.
 * With `tightEm`, writes `--shrink-floor` / `--shrink-floor-tight` (flexible parts kept to
 * `tightEm` × font size) instead, so CSS can switch floors without waiting for a re-measure.
 */
export function useShrinkFloor(
  ref: RefObject<HTMLElement | null>,
  {
    selector = "[data-shrink-flex]",
    keep = 0,
    tightEm,
  }: { selector?: string; keep?: number; tightEm?: number } = {}
) {
  useObserved(ref, (el) => {
    let shown = 0;
    let full = 0;
    let tight = 0;
    el.querySelectorAll<HTMLElement>(selector).forEach((part) => {
      shown += part.getBoundingClientRect().width;
      full += part.scrollWidth;
      if (tightEm !== undefined) {
        const em = parseFloat(getComputedStyle(part).fontSize) || 0;
        tight += Math.min(part.scrollWidth, tightEm * em);
      }
    });
    const fixed = contentWidth(el) - shown;
    const px = (n: number) => `${Math.max(0, Math.ceil(n))}px`;
    if (tightEm === undefined) {
      const next = px(fixed + keep * full);
      if (el.style.minWidth !== next) el.style.minWidth = next;
      return;
    }
    el.style.setProperty("--shrink-floor", px(fixed + keep * full));
    el.style.setProperty("--shrink-floor-tight", px(fixed + tight));
  });
}

/**
 * Marks `ref` with `data-squeezed` once its first flexible part (`[data-shrink-flex]`) is fully
 * hidden and the next one starts getting cut; children hide via `group-data-[squeezed]:hidden`.
 * Re-checks only when the surrounding header widens past the width it folded at (no flicker).
 * The fold width lives in the attribute value, so a re-created element starts unfolded; a new
 * `resetKey` (e.g. the route) also re-checks from unfolded.
 */
export function useSqueezeCollapse(ref: RefObject<HTMLElement | null>, resetKey?: string) {
  const lastKey = useRef(resetKey);

  useObserved(
    ref,
    (el) => {
      if (lastKey.current !== resetKey) {
        lastKey.current = resetKey;
        el.removeAttribute("data-squeezed");
      }
      const header = el.closest("header") ?? el.parentElement;
      const width = header ? header.getBoundingClientRect().width : 0;
      const isSqueezed = () => {
        const parts = Array.from(el.querySelectorAll<HTMLElement>("[data-shrink-flex]"));
        if (parts.length < 2) return false;
        const [first, ...rest] = parts;
        return (
          first.getBoundingClientRect().width < 1 &&
          rest.some((p) => p.clientWidth < p.scrollWidth - 1)
        );
      };

      const foldedAt = el.getAttribute("data-squeezed");
      if (foldedAt !== null) {
        if (width <= Number(foldedAt)) return;
        el.removeAttribute("data-squeezed");
      }
      if (isSqueezed()) el.setAttribute("data-squeezed", String(Math.round(width)));
    },
    (el) => el.closest("header")
  );
}
