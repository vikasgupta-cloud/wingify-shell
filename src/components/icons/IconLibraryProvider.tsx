import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useIconLibraryStore } from "@/store/iconLibrary";
import {
  loadIconRegistry,
  registryCacheKey,
  type IconRegistry,
} from "./registries/loadIconRegistry";
import type { IconLibraryId } from "@/config/iconLibraries";

type IconLibraryContextValue = {
  registry: IconRegistry;
  ready: boolean;
  libraryId: string;
  variant: string;
};

const IconLibraryContext = createContext<IconLibraryContextValue>({
  registry: {},
  ready: false,
  libraryId: "phosphor",
  variant: "regular",
});

export function IconLibraryProvider({ children }: { children: ReactNode }) {
  const libraryId = useIconLibraryStore((s) => s.libraryId);
  const variant = useIconLibraryStore((s) => s.variant);
  const [registry, setRegistry] = useState<IconRegistry>({});
  const [ready, setReady] = useState(false);

  const key = useMemo(
    () => registryCacheKey(libraryId, variant),
    [libraryId, variant]
  );

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const load = () => {
      attempts += 1;
      loadIconRegistry(libraryId, variant)
        .then((next) => {
          if (cancelled) return;
          // Retry once if a transient HMR race returned an empty pack.
          if (Object.keys(next).length === 0 && attempts < 3) {
            window.setTimeout(load, 50 * attempts);
            return;
          }
          setRegistry(next);
          setReady(true);
        })
        .catch((err) => {
          console.error("[wingify icons] registry load failed", err);
          if (cancelled) return;
          if (attempts < 3) {
            window.setTimeout(load, 50 * attempts);
            return;
          }
          setRegistry({});
          setReady(true);
        });
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [key, libraryId, variant]);

  const value = useMemo(
    () => ({ registry, ready, libraryId, variant }),
    [registry, ready, libraryId, variant]
  );

  return (
    <IconLibraryContext.Provider value={value}>
      {children}
    </IconLibraryContext.Provider>
  );
}

export function useIconRegistry() {
  return useContext(IconLibraryContext);
}

/** Render children with a different library/variant (e.g. Phosphor fill for selected nav). */
export function IconVariantOverride({
  libraryId,
  variant,
  children,
}: {
  libraryId?: IconLibraryId;
  variant: string;
  children: ReactNode;
}) {
  const parent = useIconRegistry();
  const lib = libraryId ?? (parent.libraryId as IconLibraryId);
  const [registry, setRegistry] = useState<IconRegistry>(parent.registry);
  const [ready, setReady] = useState(parent.ready);

  useEffect(() => {
    let cancelled = false;
    loadIconRegistry(lib, variant)
      .then((next) => {
        if (cancelled) return;
        setRegistry(next);
        setReady(true);
      })
      .catch((err) => {
        console.error("[wingify icons] override registry load failed", err);
        if (cancelled) return;
        setRegistry({});
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lib, variant]);

  const value = useMemo(
    () => ({ registry, ready, libraryId: lib, variant }),
    [registry, ready, lib, variant]
  );

  return (
    <IconLibraryContext.Provider value={value}>
      {children}
    </IconLibraryContext.Provider>
  );
}
