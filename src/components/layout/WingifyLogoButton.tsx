import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FLOW_MASCOT_IDS,
  MASCOT_ASSETS,
  MASCOT_IDS,
  MASCOT_LABELS,
  mascotForPath,
  type MascotId,
} from "../../config/mascots";
import { useMascotPreviewStore } from "../../store/mascotPreview";
import { cn } from "../../lib/utils";

/** Must stay longer than CROSSFADE_MS so swaps never overlap. */
const CYCLE_MS = 900;
const CROSSFADE_MS = 320;

/** Preload all poses so hover swaps don't flash empty. */
let mascotsPreloaded = false;
function preloadMascots() {
  if (mascotsPreloaded || typeof window === "undefined") return;
  mascotsPreloaded = true;
  for (const id of MASCOT_IDS) {
    const img = new Image();
    img.src = MASCOT_ASSETS[id];
  }
}

/**
 * Opacity-only crossfade. Queues the latest target if a fade is already running
 * so rapid product hovers don't thrash mid-transition.
 */
function MascotMark({ id, alt }: { id: MascotId; alt: string }) {
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
    <span className="relative block h-7 w-8">
      {back ? (
        <img
          src={MASCOT_ASSETS[back]}
          alt=""
          aria-hidden
          className={cn(
            imgClass,
            frontVisible ? "opacity-0" : "opacity-100"
          )}
          style={{ transitionDuration: `${CROSSFADE_MS}ms` }}
        />
      ) : null}
      <img
        src={MASCOT_ASSETS[front]}
        alt={alt}
        className={cn(imgClass, frontVisible ? "opacity-100" : "opacity-0")}
        style={{ transitionDuration: `${CROSSFADE_MS}ms` }}
      />
    </span>
  );
}

/**
 * Home button carrying the flow-aware Wingify mascot.
 * - Active route sets the pose
 * - Product-row hover previews that product's pose
 * - Logo hover auto-cycles through flow poses
 */
export default function WingifyLogoButton({
  className,
}: {
  className?: string;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const previewId = useMascotPreviewStore((s) => s.previewId);
  const routeId = mascotForPath(pathname);
  const [logoHover, setLogoHover] = useState(false);
  const [cycleId, setCycleId] = useState<MascotId | null>(null);
  const cycleIndexRef = useRef(0);

  useEffect(() => {
    preloadMascots();
  }, []);

  useEffect(() => {
    if (!logoHover) {
      setCycleId(null);
      return;
    }
    const base = previewId ?? routeId;
    let index = FLOW_MASCOT_IDS.findIndex((id) => id === base);
    if (index < 0) index = -1;
    cycleIndexRef.current = (index + 1) % FLOW_MASCOT_IDS.length;
    setCycleId(FLOW_MASCOT_IDS[cycleIndexRef.current]);

    const timer = window.setInterval(() => {
      cycleIndexRef.current =
        (cycleIndexRef.current + 1) % FLOW_MASCOT_IDS.length;
      setCycleId(FLOW_MASCOT_IDS[cycleIndexRef.current]);
    }, CYCLE_MS);

    return () => window.clearInterval(timer);
    // Only restart the cycle when hover begins — not when route/preview changes mid-hover.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [logoHover]);

  const mascotId = cycleId ?? previewId ?? routeId;
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
        "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg",
        className
      )}
    >
      <MascotMark id={mascotId} alt={`Wingify — ${pose}`} />
    </button>
  );
}
