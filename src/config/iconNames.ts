import { LUCIDE_ICON_MAP } from "@/components/icons/registries/generated/lucideMap";

/** Lucide icon names used across the prototype (derived from protoLucide exports). */
export type AppIconName = keyof typeof LUCIDE_ICON_MAP;

export const APP_ICON_NAMES = Object.keys(LUCIDE_ICON_MAP) as AppIconName[];
