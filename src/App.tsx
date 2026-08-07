import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { applyCtaToken } from "./config/ctaTokens";
import { applyFonts } from "./config/fonts";
import { applyTheme } from "./config/themes";
import { useFontStore } from "./store/fonts";
import { useThemeStore } from "./store/theme";

export default function App() {
  const themeId = useThemeStore((s) => s.themeId);
  const colorMode = useThemeStore((s) => s.colorMode);
  const ctaTokenId = useThemeStore((s) => s.ctaTokenId);
  const fontAssignments = useFontStore((s) => s.assignments);

  useEffect(() => {
    applyTheme(themeId, colorMode);
    applyCtaToken(ctaTokenId, colorMode);
  }, [themeId, colorMode, ctaTokenId]);

  useEffect(() => {
    applyFonts(fontAssignments);
  }, [fontAssignments]);

  return <RouterProvider router={router} />;
}
