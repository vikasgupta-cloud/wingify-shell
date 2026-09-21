/** Dummy asset library images for Configuration → Assets Hub → Images. */

export type AssetImage = {
  id: string;
  name: string;
  /** Preview URL (dummy / placeholder). */
  src: string;
  sizeLabel: string;
  dimensions: string;
  addedLabel: string;
  tags: string[];
};

export const ASSET_IMAGES: AssetImage[] = [
  {
    id: "img-1",
    name: "ChatGPT Image Sep 17, 2026, 05_36_32 PM.png",
    src: "https://picsum.photos/seed/wingify-logos/640/360",
    sizeLabel: "1.11 MB",
    dimensions: "1942×809",
    addedLabel: "Sep 18, 2026",
    tags: ["banner", "logos", "partners"],
  },
  {
    id: "img-2",
    name: "ChatGPT Image Sep 17, 2026, 05_36_32 PM.png",
    src: "https://picsum.photos/seed/wingify-banner/640/360",
    sizeLabel: "1.11 MB",
    dimensions: "1942×809",
    addedLabel: "Sep 17, 2026",
    tags: ["banner", "logos"],
  },
  {
    id: "img-3",
    name: "profile.png",
    src: "https://picsum.photos/seed/wingify-profile/512/512",
    sizeLabel: "413.19 KB",
    dimensions: "512×512",
    addedLabel: "Sep 17, 2026",
    tags: ["profile", "avatar"],
  },
];
