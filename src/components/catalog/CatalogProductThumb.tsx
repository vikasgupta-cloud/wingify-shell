/** Dummy product thumbnail — SVG bottle/jar illustrations (no remote images). */

import { cn } from "@/lib/utils";

/** Soft product-like palettes (token-friendly neutrals + muted accents). */
const PALETTES = [
  { bg: "#f4f1ec", body: "#c4b5a5", cap: "#3d3d3d", label: "#8a7a6a" },
  { bg: "#eef2f4", body: "#9bb0bc", cap: "#2a2a2a", label: "#6b7c86" },
  { bg: "#f3efe8", body: "#d4c4a8", cap: "#4a4038", label: "#9a8b74" },
  { bg: "#eef5f2", body: "#8fb5a5", cap: "#2f3d38", label: "#5f7a6e" },
  { bg: "#f6eee9", body: "#d4a090", cap: "#3a2e2a", label: "#a87868" },
  { bg: "#f0eef6", body: "#b0a4c8", cap: "#2e2a38", label: "#7a708e" },
  { bg: "#eef3f8", body: "#8aa8c4", cap: "#243040", label: "#5a748c" },
  { bg: "#f5f0ea", body: "#c9b89a", cap: "#3c3428", label: "#8e8068" },
  { bg: "#eef6f4", body: "#7eb8a8", cap: "#1e3832", label: "#4a7a6c" },
  { bg: "#f7f0f2", body: "#c8a0b0", cap: "#382830", label: "#8e6878" },
  { bg: "#f2f0ea", body: "#b8a888", cap: "#343028", label: "#7a7060" },
  { bg: "#eef2f6", body: "#a0b4c8", cap: "#283038", label: "#687888" },
] as const;

type Shape = "bottle" | "jar" | "tube" | "dropper";

const SHAPES: Shape[] = ["bottle", "jar", "tube", "dropper"];

function productSvg(seed: number): string {
  const palette = PALETTES[Math.abs(seed) % PALETTES.length];
  const shape = SHAPES[Math.abs(seed) % SHAPES.length];
  const { bg, body, cap, label } = palette;

  let product = "";
  if (shape === "bottle") {
    product = `
      <rect x="28" y="10" width="24" height="10" rx="2" fill="${cap}"/>
      <rect x="32" y="20" width="16" height="8" fill="${cap}"/>
      <path d="M24 28 h32 v8 c0 4-2 6-6 6 H30 c-4 0-6-2-6-6 z" fill="${body}"/>
      <rect x="22" y="40" width="36" height="48" rx="6" fill="${body}"/>
      <rect x="28" y="52" width="24" height="18" rx="2" fill="${label}" opacity="0.35"/>
    `;
  } else if (shape === "jar") {
    product = `
      <rect x="22" y="22" width="36" height="8" rx="2" fill="${cap}"/>
      <rect x="20" y="30" width="40" height="48" rx="8" fill="${body}"/>
      <ellipse cx="40" cy="30" rx="20" ry="5" fill="${cap}"/>
      <rect x="28" y="48" width="24" height="14" rx="2" fill="${label}" opacity="0.35"/>
    `;
  } else if (shape === "tube") {
    product = `
      <rect x="30" y="8" width="20" height="12" rx="2" fill="${cap}"/>
      <path d="M28 20 h24 l4 12 H24 z" fill="${body}"/>
      <rect x="24" y="32" width="32" height="50" rx="4" fill="${body}"/>
      <rect x="30" y="48" width="20" height="16" rx="2" fill="${label}" opacity="0.35"/>
    `;
  } else {
    product = `
      <rect x="37" y="6" width="6" height="14" rx="1" fill="${cap}"/>
      <circle cx="40" cy="22" r="7" fill="${cap}"/>
      <path d="M28 28 h24 v6 c0 3-2 5-5 5 H33 c-3 0-5-2-5-5 z" fill="${body}"/>
      <rect x="26" y="38" width="28" height="46" rx="8" fill="${body}"/>
      <rect x="32" y="52" width="16" height="14" rx="2" fill="${label}" opacity="0.35"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <rect width="80" height="80" rx="8" fill="${bg}"/>
    ${product}
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function CatalogProductThumb({
  seed,
  name,
  className,
}: {
  seed: number;
  name: string;
  className?: string;
}) {
  return (
    <img
      src={productSvg(seed)}
      alt=""
      title={name}
      className={cn(
        "size-10 shrink-0 rounded-md border border-border object-cover",
        className
      )}
      draggable={false}
    />
  );
}
