import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { applyFonts } from "./config/fonts";
import { applyBrand } from "./config/applyBrand";
import { useFontStore } from "./store/fonts";
import { useThemeStore } from "./store/theme";
import { IconLibraryProvider } from "./components/icons/IconLibraryProvider";
import BootSplash from "./components/layout/BootSplash";

export default function App() {
  const themeId = useThemeStore((s) => s.themeId);
  const colorMode = useThemeStore((s) => s.colorMode);
  const colorModePreference = useThemeStore((s) => s.colorModePreference);
  const syncSystemColorMode = useThemeStore((s) => s.syncSystemColorMode);
  const ctaTokenId = useThemeStore((s) => s.ctaTokenId);
  const backgroundTokenId = useThemeStore((s) => s.backgroundTokenId);
  const headerTokenId = useThemeStore((s) => s.headerTokenId);
  const formElementSchemeId = useThemeStore((s) => s.formElementSchemeId);
  const surfaceSchemeId = useThemeStore((s) => s.surfaceSchemeId);
  const fontAssignments = useFontStore((s) => s.assignments);

  useEffect(() => {
    applyBrand(
      themeId,
      colorMode,
      ctaTokenId,
      backgroundTokenId,
      headerTokenId,
      formElementSchemeId,
      surfaceSchemeId
    );
  }, [
    themeId,
    colorMode,
    ctaTokenId,
    backgroundTokenId,
    headerTokenId,
    formElementSchemeId,
    surfaceSchemeId,
  ]);

  useEffect(() => {
    if (colorModePreference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => syncSystemColorMode();
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [colorModePreference, syncSystemColorMode]);

  useEffect(() => {
    applyFonts(fontAssignments);
  }, [fontAssignments]);

  return (
    <IconLibraryProvider>
      <BootSplash />
      <RouterProvider router={router} />
    </IconLibraryProvider>
  );
}
