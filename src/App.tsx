import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { applyFonts } from "./config/fonts";
import { applyBrand } from "./config/applyBrand";
import { applyPalette } from "./config/palettes";
import { useFontStore } from "./store/fonts";
import { useThemeStore } from "./store/theme";
import { useComponentAppearanceStore } from "./store/componentAppearance";
import { IconLibraryProvider } from "./components/icons/IconLibraryProvider";

export default function App() {
  const themeId = useThemeStore((s) => s.themeId);
  const colorMode = useThemeStore((s) => s.colorMode);
  const paletteId = useThemeStore((s) => s.paletteId);
  const ctaTokenId = useThemeStore((s) => s.ctaTokenId);
  const backgroundTokenId = useThemeStore((s) => s.backgroundTokenId);
  const headerTokenId = useThemeStore((s) => s.headerTokenId);
  const fontAssignments = useFontStore((s) => s.assignments);
  const componentOverrides = useComponentAppearanceStore((s) => s.overrides);
  const applyComponentAppearance = useComponentAppearanceStore(
    (s) => s.applyForMode
  );

  // Palette → brand → component overrides. Appearance runs last so Page canvas /
  // Shell chrome can overwrite --canvas / --background after brand tokens.
  useEffect(() => {
    applyPalette(paletteId);
    applyBrand(themeId, colorMode, ctaTokenId, backgroundTokenId, headerTokenId);
    applyComponentAppearance(colorMode);
  }, [
    themeId,
    colorMode,
    paletteId,
    ctaTokenId,
    backgroundTokenId,
    headerTokenId,
    componentOverrides,
    applyComponentAppearance,
  ]);

  useEffect(() => {
    applyFonts(fontAssignments);
  }, [fontAssignments]);

  return (
    <IconLibraryProvider>
      <RouterProvider router={router} />
    </IconLibraryProvider>
  );
}
