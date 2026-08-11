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
