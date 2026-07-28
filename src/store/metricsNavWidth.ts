import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Width of the Results metrics left nav (Primary / Secondary / Guardrails). */
export const METRICS_NAV_WIDTH = {
  default: 248,
  min: 200,
  max: 420,
} as const;

function clampWidth(width: number): number {
  return Math.min(
    METRICS_NAV_WIDTH.max,
    Math.max(METRICS_NAV_WIDTH.min, Math.round(width))
  );
}

type MetricsNavWidthState = {
  width: number;
  setWidth: (width: number) => void;
};

export const useMetricsNavWidthStore = create<MetricsNavWidthState>()(
  persist(
    (set) => ({
      width: METRICS_NAV_WIDTH.default,
      setWidth: (width) => set({ width: clampWidth(width) }),
    }),
    {
      name: "wingify-metrics-nav-width",
      partialize: (s) => ({ width: s.width }),
      merge: (persisted, current) => {
        const raw =
          persisted && typeof persisted === "object" && "width" in persisted
            ? (persisted as { width: unknown }).width
            : undefined;
        return {
          ...current,
          width:
            typeof raw === "number" && Number.isFinite(raw)
              ? clampWidth(raw)
              : current.width,
        };
      },
    }
  )
);
