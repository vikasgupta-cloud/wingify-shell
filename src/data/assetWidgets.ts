/** Dummy widgets for Configuration → Assets Hub → Widgets. */

export type WidgetPreviewKind = "code" | "browser";

export type AssetWidget = {
  id: string;
  name: string;
  category: string;
  widgetType: string;
  /** Shown as a small pill next to the title when set. */
  badge?: string;
  preview: WidgetPreviewKind;
  /** Shown under the preview when attribution exists. */
  author?: string;
  authorInitials?: string;
  updatedLabel?: string;
};

export const WIDGET_CATEGORIES = [
  "All categories",
  "Promotion",
  "Engagement",
  "Widget",
] as const;

export const WIDGET_TYPES = [
  "All widget types",
  "Custom",
  "Template",
] as const;

export const ASSET_WIDGETS: AssetWidget[] = [
  {
    id: "w1",
    name: "Wheel of Fortune",
    category: "Promotion",
    widgetType: "Custom",
    badge: "Custom",
    preview: "code",
    author: "Wingify Support",
    authorInitials: "WS",
    updatedLabel: "14 Jul 2026",
  },
  {
    id: "w2",
    name: "Untitled",
    category: "Widget",
    widgetType: "Custom",
    badge: "Custom",
    preview: "browser",
  },
  {
    id: "w3",
    name: "Untitled",
    category: "Widget",
    widgetType: "Custom",
    badge: "Custom",
    preview: "browser",
  },
];
