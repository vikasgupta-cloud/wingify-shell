import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/fonts/brand-fonts.css";
import "./index.css";
import { applyFonts, readStoredFonts } from "./config/fonts";
import { applyCtaToken, resolveCtaTokenId } from "./config/ctaTokens";
import { applyTheme, readStoredTheme } from "./config/themes";
import App from "./App.tsx";

const stored = readStoredTheme();
applyTheme(stored.themeId, stored.colorMode);
applyCtaToken(resolveCtaTokenId(stored.ctaTokenId), stored.colorMode);
applyFonts(readStoredFonts());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
