/*
 * Icon library registry + optional local override (filled glyphs for page headers).
 * Reused: loadIconRegistry cache and the icon-library store.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useIconLibraryStore } from "@/store/iconLibrary";
import type { IconLibraryId } from "@/config/iconLibraries";
import {
  loadIconRegistry,
  registryCacheKey,
  type IconRegistry,
} from "./registries/loadIconRegistry";

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

function useLoadedRegistry(libraryId: IconLibraryId, variant: string) {
  const [registry, setRegistry] = useState<IconRegistry>({});
  const [ready, setReady] = useState(false);
  const key = useMemo(
    () => registryCacheKey(libraryId, variant),
    [libraryId, variant]
  );

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    loadIconRegistry(libraryId, variant).then((next) => {
      if (cancelled) return;
      setRegistry(next);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [key, libraryId, variant]);

  return { registry, ready, libraryId, variant };
}

export function IconLibraryProvider({ children }: { children: ReactNode }) {
  const libraryId = useIconLibraryStore((s) => s.libraryId);
  const variant = useIconLibraryStore((s) => s.variant);
  const loaded = useLoadedRegistry(libraryId, variant);

  const value = useMemo(
    () => ({
      registry: loaded.registry,
      ready: loaded.ready,
      libraryId: loaded.libraryId,
      variant: loaded.variant,
    }),
    [loaded.libraryId, loaded.ready, loaded.registry, loaded.variant]
  );

  return (
    <IconLibraryContext.Provider value={value}>
      {children}
    </IconLibraryContext.Provider>
  );
}

/** Nested registry so a subtree can use Fill / Solid without changing the global style. */
export function IconVariantOverride({
  variant,
  children,
}: {
  variant: string;
  children: ReactNode;
}) {
  const libraryId = useIconLibraryStore((s) => s.libraryId);
  const loaded = useLoadedRegistry(libraryId, variant);

  const value = useMemo(
    () => ({
      registry: loaded.registry,
      ready: loaded.ready,
      libraryId: loaded.libraryId,
      variant: loaded.variant,
    }),
    [loaded.libraryId, loaded.ready, loaded.registry, loaded.variant]
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
