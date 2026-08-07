import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MASCOT_ASSETS,
  MASCOT_ASSETS_DARK,
  MASCOT_IDS,
  MASCOT_LABELS,
  mascotAsset,
  mascotForPath,
  type MascotId,
} from "../../config/mascots";
import { useMascotPreviewStore } from "../../store/mascotPreview";
import { useThemeStore } from "../../store/theme";
import { cn } from "../../lib/utils";
import type { ColorMode } from "../../config/themes";

const CROSSFADE_MS = 320;

/** Preload all poses (light + dark) so product previews don't flash empty. */
let mascotsPreloaded = false;
function preloadMascots() {
  if (mascotsPreloaded || typeof window === "undefined") return;
  mascotsPreloaded = true;
  for (const id of MASCOT_IDS) {
    const light = new Image();
    light.src = MASCOT_ASSETS[id];
    const dark = new Image();
    dark.src = MASCOT_ASSETS_DARK[id];
  }
}

/**
 * Opacity-only crossfade between product poses. Queues the latest target if a
 * fade is already running so rapid product-row hovers don't thrash mid-transition.
 */
function MascotMark({
  id,
  alt,
  colorMode,
  lively,
}: {
  id: MascotId;
  alt: string;
  colorMode: ColorMode;
  /** Subtle idle motion on the current mark — never swaps the asset. */
  lively: boolean;
}) {
  const [front, setFront] = useState(id);
  const [back, setBack] = useState<MascotId | null>(null);
  const [frontVisible, setFrontVisible] = useState(true);
  const busyRef = useRef(false);
  const pendingRef = useRef<MascotId | null>(null);
  const frontRef = useRef(id);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    frontRef.current = front;
  }, [front]);

  useEffect(() => {
    return () => {
      for (const t of timersRef.current) window.clearTimeout(t);
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (id === frontRef.current && !busyRef.current) return;

    const run = (next: MascotId) => {
      if (next === frontRef.current) {
        busyRef.current = false;
        const queued = pendingRef.current;
        pendingRef.current = null;
        if (queued && queued !== frontRef.current) run(queued);
        return;
      }

      busyRef.current = true;
      setBack(frontRef.current);
      setFront(next);
      frontRef.current = next;
      setFrontVisible(false);

      const fadeIn = requestAnimationFrame(() => {
        requestAnimationFrame(() => setFrontVisible(true));
      });

      const done = window.setTimeout(() => {
        cancelAnimationFrame(fadeIn);
        setBack(null);
        busyRef.current = false;
        const queued = pendingRef.current;
        pendingRef.current = null;
        if (queued && queued !== frontRef.current) run(queued);
      }, CROSSFADE_MS);

      timersRef.current = timersRef.current.filter((t) => {
        window.clearTimeout(t);
        return false;
      });
      timersRef.current.push(done);
    };

    if (busyRef.current) {
      pendingRef.current = id;
      return;
    }
    run(id);
  }, [id]);

  const imgClass =
    "pointer-events-none absolute inset-0 m-auto h-7 w-auto max-w-8 object-contain transition-opacity ease-out motion-reduce:transition-none";

  return (
    <span
      className={cn(
        "relative block h-7 w-8 origin-center",
        lively && "mascot-lively"
      )}
    >
      {back ? (
        <img
          src={mascotAsset(back, colorMode)}
          alt=""
          aria-hidden
          className={cn(
            imgClass,
            "mascot-lively-mark",
            frontVisible ? "opacity-0" : "opacity-100"
          )}
          style={{ transitionDuration: `${CROSSFADE_MS}ms` }}
        />
      ) : null}
      <img
        src={mascotAsset(front, colorMode)}
        alt={alt}
        className={cn(
          imgClass,
          "mascot-lively-mark",
          frontVisible ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: `${CROSSFADE_MS}ms` }}
      />
    </span>
  );
}

/**
 * Home button carrying the flow-aware Wingify mascot.
 * - Active route sets the pose
 * - Product-row hover previews that product's pose
 * - Logo hover keeps the same mark and plays a subtle quirky idle motion
 */
export default function WingifyLogoButton({
  className,
}: {
  className?: string;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const colorMode = useThemeStore((s) => s.colorMode);
  const previewId = useMascotPreviewStore((s) => s.previewId);
  const routeId = mascotForPath(pathname);
  const [logoHover, setLogoHover] = useState(false);

  useEffect(() => {
    preloadMascots();
  }, []);

  const mascotId = previewId ?? routeId;
  const pose = MASCOT_LABELS[mascotId];

  return (
    <button
      type="button"
      aria-label={`Go to Home dashboard (${pose})`}
      onClick={() => navigate("/home/dashboard")}
      onMouseEnter={() => setLogoHover(true)}
      onMouseLeave={() => setLogoHover(false)}
      onFocus={() => setLogoHover(true)}
      onBlur={() => setLogoHover(false)}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center overflow-visible rounded-lg",
        className
      )}
    >
      <MascotMark
        id={mascotId}
        alt={`Wingify — ${pose}`}
        colorMode={colorMode}
        lively={logoHover}
      />
    </button>
  );
}
