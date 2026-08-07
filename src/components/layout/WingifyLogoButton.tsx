import { useEffect, useState } from "react";
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

const CYCLE_MS = 650;
const CROSSFADE_MS = 280;

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
 * Crossfading mascot mark — outgoing fades/scales out while incoming settles in.
 */
function MascotMark({ id, alt }: { id: MascotId; alt: string }) {
  const [current, setCurrent] = useState(id);
  const [outgoing, setOutgoing] = useState<MascotId | null>(null);
  const [outgoingOut, setOutgoingOut] = useState(false);
  const [incomingIn, setIncomingIn] = useState(true);

  useEffect(() => {
    if (id === current) return;
    setOutgoing(current);
    setOutgoingOut(false);
    setCurrent(id);
    setIncomingIn(false);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOutgoingOut(true);
        setIncomingIn(true);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [id, current]);

  useEffect(() => {
    if (!outgoing) return;
    const t = window.setTimeout(() => {
      setOutgoing(null);
      setOutgoingOut(false);
    }, CROSSFADE_MS);
    return () => window.clearTimeout(t);
  }, [outgoing]);

  const imgClass =
    "pointer-events-none absolute left-1/2 top-1/2 h-7 w-auto max-w-8 -translate-x-1/2 -translate-y-1/2 object-contain ease-out motion-reduce:transition-none motion-reduce:transform-none";

  return (
    <span className="relative block h-7 w-8">
      {outgoing ? (
        <img
          src={MASCOT_ASSETS[outgoing]}
          alt=""
          aria-hidden
          className={cn(
            imgClass,
            "transition-[opacity,transform]",
            outgoingOut ? "scale-90 opacity-0" : "scale-100 opacity-100"
          )}
          style={{ transitionDuration: `${CROSSFADE_MS}ms` }}
        />
      ) : null}
      <img
        src={MASCOT_ASSETS[current]}
        alt={alt}
        className={cn(
          imgClass,
          "transition-[opacity,transform]",
          incomingIn ? "scale-100 opacity-100" : "scale-90 opacity-0"
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
 * - Logo hover auto-cycles through all poses
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
    index = (index + 1) % FLOW_MASCOT_IDS.length;
    setCycleId(FLOW_MASCOT_IDS[index]);
    const timer = window.setInterval(() => {
      index = (index + 1) % FLOW_MASCOT_IDS.length;
      setCycleId(FLOW_MASCOT_IDS[index]);
    }, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [logoHover, previewId, routeId]);

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
        "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg transition-opacity hover:opacity-90",
        className
      )}
    >
      <MascotMark id={mascotId} alt={`Wingify — ${pose}`} />
    </button>
  );
}
