import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { applyFonts } from "./config/fonts";
import { applyBrand } from "./config/applyBrand";
import { useFontStore } from "./store/fonts";
import { useThemeStore } from "./store/theme";

export default function App() {
  const themeId = useThemeStore((s) => s.themeId);
  const colorMode = useThemeStore((s) => s.colorMode);
  const ctaTokenId = useThemeStore((s) => s.ctaTokenId);
  const fontAssignments = useFontStore((s) => s.assignments);

  useEffect(() => {
    applyBrand(themeId, colorMode, ctaTokenId);
  }, [themeId, colorMode, ctaTokenId]);

  useEffect(() => {
    applyFonts(fontAssignments);
  }, [fontAssignments]);

  return <RouterProvider router={router} />;
}
