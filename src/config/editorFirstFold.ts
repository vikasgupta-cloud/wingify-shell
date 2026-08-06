/**
 * First-fold (hero) copy/styles applied inside the editor preview iframe.
 * Variations and version history each override different parts so both switches
 * produce a clear above-the-fold change.
 */

export type FirstFoldState = {
  promo: string;
  eyebrow: string;
  heading: string;
  lede: string;
  label: string;
  metaStylesHtml: string;
  metaPriceHtml: string;
  metaShippingHtml: string;
  ctaShop: string;
  ctaStores: string;
  headingLetterSpacing: string;
  heroSurface: string;
};

export const BASE_FIRST_FOLD: FirstFoldState = {
  promo: "Complimentary shipping on orders over $120 · Returns within 30 days",
  eyebrow: "Summer edit · Vol. 04",
  heading: "Coastal weekends",
  lede:
    "Soft linen layers, sun-washed color, and easy silhouettes made for long days by the water — from Montauk mornings to late ferry rides.",
  label: "Lookbook SS26",
  metaStylesHtml: "<strong>28</strong> new styles",
  metaPriceHtml: "<strong>From $64</strong>",
  metaShippingHtml: "<strong>Ships in 2–4 days</strong>",
  ctaShop: "Shop the collection",
  ctaStores: "Find a store",
  headingLetterSpacing: "-0.01em",
  heroSurface: "#f6f5f2",
};

/** A/B treatments — promo, CTA, and offer meta. */
export const VARIATION_FIRST_FOLD: Record<string, Partial<FirstFoldState>> = {
  control: {},
  v1: {
    promo: "Variation 01 · Early access: members save 15% today",
    eyebrow: "Member edit · Vol. 04",
    ctaShop: "Shop member picks",
    ctaStores: "Book a fitting",
    metaPriceHtml: "<strong>From $54</strong>",
    metaStylesHtml: "<strong>32</strong> new styles",
    label: "V1 · Member lookbook",
    heroSurface: "#f3f1ec",
  },
  v2: {
    promo: "Variation 02 · Free express shipping this weekend",
    eyebrow: "Weekend drop · Limited",
    ctaShop: "Grab the drop",
    ctaStores: "See nearby stock",
    metaShippingHtml: "<strong>Ships overnight</strong>",
    metaPriceHtml: "<strong>From $72</strong>",
    label: "V2 · Weekend drop",
    heroSurface: "#eef2f0",
  },
};

const EXTRA_VARIATION_FOLDS: Partial<FirstFoldState>[] = [
  {
    promo: "New variation · Bundle & save on linen sets",
    eyebrow: "Bundle edit",
    ctaShop: "Build your set",
    ctaStores: "Visit flagship",
    metaStylesHtml: "<strong>18</strong> bundle looks",
    label: "Bundle lookbook",
    heroSurface: "#f5f0eb",
  },
  {
    promo: "New variation · Price drop on summer essentials",
    eyebrow: "Sale edit · Ends Sunday",
    ctaShop: "Shop the sale",
    ctaStores: "Reserve in store",
    metaPriceHtml: "<strong>From $48</strong>",
    label: "Sale lookbook",
    heroSurface: "#f2f4f6",
  },
];

/** Version-history snapshots — headline, lede, and spacing (edit over time). */
export const VERSION_FIRST_FOLD: Record<string, Partial<FirstFoldState>> = {
  initial: {
    heading: "Coastal weekends",
    lede:
      "Soft linen layers, sun-washed color, and easy silhouettes made for long days by the water — from Montauk mornings to late ferry rides.",
    headingLetterSpacing: "-0.01em",
  },
  "cta-copy": {
    heading: "Coastal weekends",
    lede:
      "Linen that moves with you — pack light, stay out late, and keep the weekend unhurried.",
    headingLetterSpacing: "-0.01em",
  },
  "headline-spacing": {
    heading: "Weekends by the water",
    lede:
      "Linen that moves with you — pack light, stay out late, and keep the weekend unhurried.",
    headingLetterSpacing: "0.04em",
  },
  promo: {
    heading: "Weekends by the water",
    lede:
      "Sun-washed colorways and breathable layers for ferry rides, beach mornings, and city evenings.",
    headingLetterSpacing: "0.02em",
  },
  urgency: {
    heading: "Last call for summer linen",
    lede:
      "Final sizes in the summer edit — soft layers and easy silhouettes before the season turns.",
    headingLetterSpacing: "0em",
  },
  refresh: {
    heading: "A lighter kind of summer",
    lede:
      "New cuts in washed linen and organic cotton — designed for heat, travel, and long days outside.",
    headingLetterSpacing: "-0.02em",
  },
};

export const VERSION_FOLD_KEYS = Object.keys(VERSION_FIRST_FOLD);

export function variationFirstFold(
  variationId: string
): Partial<FirstFoldState> {
  if (VARIATION_FIRST_FOLD[variationId]) {
    return VARIATION_FIRST_FOLD[variationId];
  }
  const match = /^v(\d+)$/i.exec(variationId);
  const n = match ? Number(match[1]) : 0;
  if (n <= 0) return {};
  return EXTRA_VARIATION_FOLDS[(n - 1) % EXTRA_VARIATION_FOLDS.length] ?? {};
}

export function versionFirstFold(foldKey: string): Partial<FirstFoldState> {
  return VERSION_FIRST_FOLD[foldKey] ?? VERSION_FIRST_FOLD.initial ?? {};
}

export function nextVersionFoldKey(usedKeys: string[]): string {
  for (const key of VERSION_FOLD_KEYS) {
    if (!usedKeys.includes(key)) return key;
  }
  const n = usedKeys.length + 1;
  return `fold-${n}`;
}

export function resolveFirstFold(
  variationId: string,
  foldKey: string
): FirstFoldState {
  return {
    ...BASE_FIRST_FOLD,
    ...versionFirstFold(foldKey),
    ...variationFirstFold(variationId),
  };
}

export function applyFirstFold(doc: Document, state: FirstFoldState) {
  const setText = (id: string, text: string) => {
    const el = doc.getElementById(id);
    if (el) el.textContent = text;
  };
  const setHtml = (id: string, html: string) => {
    const el = doc.getElementById(id);
    if (el) el.innerHTML = html;
  };

  setText("promo-bar", state.promo);
  setText("hero-eyebrow", state.eyebrow);
  setText("hero-heading", state.heading);
  setText("hero-lede", state.lede);
  setText("hero-label", state.label);
  setHtml("hero-meta-styles", state.metaStylesHtml);
  setHtml("hero-meta-price", state.metaPriceHtml);
  setHtml("hero-meta-shipping", state.metaShippingHtml);
  setText("hero-cta-stores", state.ctaStores);

  const cta = doc.getElementById("hero-cta-shop");
  if (cta) {
    const arrow = doc.getElementById("hero-cta-arrow");
    cta.textContent = "";
    cta.append(state.ctaShop + " ");
    const span = doc.createElement("span");
    span.id = "hero-cta-arrow";
    span.textContent = arrow?.textContent || "→";
    cta.appendChild(span);
  }

  const heading = doc.getElementById("hero-heading");
  if (heading) {
    heading.style.letterSpacing = state.headingLetterSpacing;
  }

  const hero = doc.getElementById("section-hero");
  if (hero) {
    hero.style.background = state.heroSurface;
  }

  try {
    doc.defaultView?.scrollTo(0, 0);
  } catch {
    /* ignore */
  }
}
