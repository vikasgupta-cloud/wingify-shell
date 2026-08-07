import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/fonts/brand-fonts.css";
import "./index.css";
import { applyTheme, readStoredThemeId } from "./config/themes";
import App from "./App.tsx";

applyTheme(readStoredThemeId());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
