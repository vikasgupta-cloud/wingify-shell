import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/fonts/brand-fonts.css";
import "./index.css";
import { applyFonts, readStoredFonts } from "./config/fonts";
import { resolveCtaTokenId } from "./config/ctaTokens";
import { resolveBackgroundTokenId } from "./config/backgroundTokens";
import { resolveFormElementSchemeId } from "./config/formElementSchemes";
import { readStoredTheme } from "./config/themes";
import { applyBrand } from "./config/applyBrand";
import App from "./App.tsx";

const stored = readStoredTheme();
applyBrand(
  stored.themeId,
  stored.colorMode,
  resolveCtaTokenId(stored.ctaTokenId),
  resolveBackgroundTokenId(stored.backgroundTokenId),
  resolveBackgroundTokenId(stored.headerTokenId ?? null),
  resolveFormElementSchemeId(stored.formElementSchemeId)
);
applyFonts(readStoredFonts());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
