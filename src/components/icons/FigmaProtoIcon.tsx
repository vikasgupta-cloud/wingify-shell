import React from "react";
import { cn } from "@/lib/utils";

// Inline SVG pool (patched to use `currentColor`).
// These come from the Figma icon frame `582:36683`.
import homeSvg from "@/assets/proto-icons/wingify-figma-582-36683/home.svg?raw";
import svg1618874916 from "@/assets/proto-icons/wingify-figma-582-36683/1618874916.svg?raw";
import svg1618874917 from "@/assets/proto-icons/wingify-figma-582-36683/1618874917.svg?raw";
import svg1618874918 from "@/assets/proto-icons/wingify-figma-582-36683/1618874918.svg?raw";
import svg1618874919 from "@/assets/proto-icons/wingify-figma-582-36683/1618874919.svg?raw";
import svg1618874920 from "@/assets/proto-icons/wingify-figma-582-36683/1618874920.svg?raw";
import svg1618874921 from "@/assets/proto-icons/wingify-figma-582-36683/1618874921.svg?raw";
import svg1618874922 from "@/assets/proto-icons/wingify-figma-582-36683/1618874922.svg?raw";
import svg1618874923 from "@/assets/proto-icons/wingify-figma-582-36683/1618874923.svg?raw";
import svg1618874924 from "@/assets/proto-icons/wingify-figma-582-36683/1618874924.svg?raw";
import svg1618874925 from "@/assets/proto-icons/wingify-figma-582-36683/1618874925.svg?raw";
import svg1618874926 from "@/assets/proto-icons/wingify-figma-582-36683/1618874926.svg?raw";
import svg1618874947 from "@/assets/proto-icons/wingify-figma-582-36683/1618874947.svg?raw";
import svg1618874948 from "@/assets/proto-icons/wingify-figma-582-36683/1618874948.svg?raw";
import svg1618874949 from "@/assets/proto-icons/wingify-figma-582-36683/1618874949.svg?raw";
import svg1618874950 from "@/assets/proto-icons/wingify-figma-582-36683/1618874950.svg?raw";
import svg1618874951 from "@/assets/proto-icons/wingify-figma-582-36683/1618874951.svg?raw";
import svg1618874952 from "@/assets/proto-icons/wingify-figma-582-36683/1618874952.svg?raw";
import svg1618874953 from "@/assets/proto-icons/wingify-figma-582-36683/1618874953.svg?raw";
import svg1618874954 from "@/assets/proto-icons/wingify-figma-582-36683/1618874954.svg?raw";
import svg1618874955 from "@/assets/proto-icons/wingify-figma-582-36683/1618874955.svg?raw";
import svg1618874956 from "@/assets/proto-icons/wingify-figma-582-36683/1618874956.svg?raw";
import svg1618874957 from "@/assets/proto-icons/wingify-figma-582-36683/1618874957.svg?raw";
import svg1618874958 from "@/assets/proto-icons/wingify-figma-582-36683/1618874958.svg?raw";
import svg1618874959 from "@/assets/proto-icons/wingify-figma-582-36683/1618874959.svg?raw";
import svg1618874960 from "@/assets/proto-icons/wingify-figma-582-36683/1618874960.svg?raw";
import svg1618874961 from "@/assets/proto-icons/wingify-figma-582-36683/1618874961.svg?raw";
import svg1618874962 from "@/assets/proto-icons/wingify-figma-582-36683/1618874962.svg?raw";
import svg1618874963 from "@/assets/proto-icons/wingify-figma-582-36683/1618874963.svg?raw";
import svg1618874964 from "@/assets/proto-icons/wingify-figma-582-36683/1618874964.svg?raw";
import svg1618874965 from "@/assets/proto-icons/wingify-figma-582-36683/1618874965.svg?raw";

const ICON_SVGS = [
  homeSvg,
  svg1618874916,
  svg1618874917,
  svg1618874918,
  svg1618874919,
  svg1618874920,
  svg1618874921,
  svg1618874922,
  svg1618874923,
  svg1618874924,
  svg1618874925,
  svg1618874926,
  svg1618874947,
  svg1618874948,
  svg1618874949,
  svg1618874950,
  svg1618874951,
  svg1618874952,
  svg1618874953,
  svg1618874954,
  svg1618874955,
  svg1618874956,
  svg1618874957,
  svg1618874958,
  svg1618874959,
  svg1618874960,
  svg1618874961,
  svg1618874962,
  svg1618874963,
  svg1618874964,
  svg1618874965,
] as const;

function hashStringToUint32(str: string): number {
  // Simple deterministic hash; good enough for stable icon mapping.
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type FigmaProtoIconProps = {
  iconKey: string;
  size?: number | string;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

export default function FigmaProtoIcon({
  iconKey,
  size,
  className,
  style,
  ...spanProps
}: FigmaProtoIconProps) {
  const idx = hashStringToUint32(iconKey) % ICON_SVGS.length;
  const svg = ICON_SVGS[idx] ?? ICON_SVGS[0]!;

  const resolvedStyle: React.CSSProperties = {
    ...(style ?? {}),
    ...(typeof size === "number" ? { width: size, height: size } : null),
    // Prevent inline-svg baseline spacing from making icons look “off”
    // compared to Lucide (which aligns naturally inside <svg>).
    lineHeight: 0,
  };

  return (
    <span
      aria-hidden="true"
      {...spanProps}
      className={cn(
        "inline-flex items-center justify-center",
        // Ensure the injected SVG fills the box and stays centered.
        "[&>svg]:block [&>svg]:h-full [&>svg]:w-full [&>svg]:origin-center",
        className
      )}
      style={resolvedStyle}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

