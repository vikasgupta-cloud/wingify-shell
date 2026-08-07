import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { applyTheme } from "./config/themes";
import { useThemeStore } from "./store/theme";

export default function App() {
  const themeId = useThemeStore((s) => s.themeId);
  const colorMode = useThemeStore((s) => s.colorMode);

  useEffect(() => {
    applyTheme(themeId, colorMode);
  }, [themeId, colorMode]);

  return <RouterProvider router={router} />;
}
