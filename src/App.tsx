import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { applyTheme } from "./config/themes";
import { useThemeStore } from "./store/theme";

export default function App() {
  const themeId = useThemeStore((s) => s.themeId);

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  return <RouterProvider router={router} />;
}
