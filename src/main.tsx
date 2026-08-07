import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/fonts/brand-fonts.css";
import "./index.css";
import { applyTheme, readStoredTheme } from "./config/themes";
import App from "./App.tsx";

const stored = readStoredTheme();
applyTheme(stored.themeId, stored.colorMode);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
