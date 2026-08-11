import type { ComponentType, CSSProperties } from "react";
import type { IconLibraryId } from "@/config/iconLibraries";
import type { AppIconName } from "@/config/iconNames";
import { APP_ICON_NAMES } from "@/config/iconNames";
import { cn } from "@/lib/utils";

export type IconComponent = ComponentType<{
  size?: number | string;
  className?: string;
  strokeWidth?: number;
  color?: string;
  weight?: string;
  [key: string]: unknown;
}>;

export type IconRegistry = Partial<Record<AppIconName, IconComponent>>;

/** Optical scale to cancel Material Symbols' internal padding. */
const MATERIAL_OPTICAL_SCALE = 1.28;

const LUCIDE_STROKE: Record<string, number> = {
  thin: 1,
  light: 1.25,
  regular: 1.75,
  bold: 2.5,
};

const PHOSPHOR_WEIGHT: Record<string, string> = {
  thin: "thin",
  light: "light",
  regular: "regular",
  bold: "bold",
  fill: "fill",
  duotone: "duotone",
};

function wrapStroke(Icon: IconComponent, strokeWidth: number): IconComponent {
  return function WrappedIcon(props) {
    const { strokeWidth: _ignored, ...rest } = props;
    return <Icon {...rest} strokeWidth={strokeWidth} />;
  };
}

function wrapPhosphor(Icon: IconComponent, weight: string): IconComponent {
  return function WrappedPhosphor(props) {
    const { weight: _ignored, strokeWidth: _sw, ...rest } = props;
    return <Icon {...rest} weight={weight} />;
  };
}

function normalizeSizeProps(Icon: IconComponent): IconComponent {
  return function NormalizedIcon({ size, className, strokeWidth: _sw, ...rest }) {
    const resolvedSize =
      typeof size === "number"
        ? size
        : typeof size === "string"
          ? size
          : undefined;
    return (
      <Icon
        {...rest}
        className={className}
        size={resolvedSize}
        style={{
          ...(rest.style as object | undefined),
          ...(typeof resolvedSize === "number"
            ? { width: resolvedSize, height: resolvedSize }
            : null),
        }}
      />
    );
  };
}

function wrapMuiIcon(Icon: IconComponent): IconComponent {
  return function MuiWrapped({
    size,
    className,
    strokeWidth: _strokeWidth,
    color,
    style,
    ...rest
  }) {
    const numeric =
      typeof size === "number"
        ? size
        : undefined;
    const sx = {
      ...(numeric
        ? {
            fontSize: numeric,
            width: numeric,
            height: numeric,
          }
        : { fontSize: "1em", width: "1em", height: "1em" }),
      ...(color ? { color } : {}),
      // Cancel Material's empty padding so glyphs match Lucide/Phosphor optical size.
      transform: `scale(${MATERIAL_OPTICAL_SCALE})`,
      transformOrigin: "center",
    };

    return (
      <Icon
        {...rest}
        className={cn("shrink-0", className)}
        fontSize="inherit"
        sx={sx}
        style={style as CSSProperties | undefined}
      />
    );
  };
}

function pickMap(
  module: Record<string, unknown>
): Record<string, string> {
  const mapKey = Object.keys(module).find((k) => k.endsWith("_MAP"));
  return (module[mapKey!] as Record<string, string>) ?? {};
}

async function loadLucideRegistry(variant: string): Promise<IconRegistry> {
  const [{ default: dynamicIconImports }, { LUCIDE_ICON_MAP }] =
    await Promise.all([
      import("lucide-react/dynamicIconImports"),
      import("./generated/lucideMap"),
    ]);

  const strokeWidth = LUCIDE_STROKE[variant] ?? 1.75;
  const registry: IconRegistry = {};

  await Promise.all(
    APP_ICON_NAMES.map(async (name) => {
      const key = LUCIDE_ICON_MAP[name as keyof typeof LUCIDE_ICON_MAP];
      const loader = dynamicIconImports[key as keyof typeof dynamicIconImports];
      if (!loader) return;
      const mod = await loader();
      const Icon = mod.default as IconComponent;
      registry[name] = wrapStroke(Icon, strokeWidth);
    })
  );

  return registry;
}

async function loadPhosphorRegistry(variant: string): Promise<IconRegistry> {
  const [phosphor, { PHOSPHOR_ICON_MAP }] = await Promise.all([
    import("@phosphor-icons/react"),
    import("./generated/phosphorMap"),
  ]);

  const weight = PHOSPHOR_WEIGHT[variant] ?? "regular";
  const registry: IconRegistry = {};

  for (const name of APP_ICON_NAMES) {
    const key = PHOSPHOR_ICON_MAP[name as keyof typeof PHOSPHOR_ICON_MAP];
    const Icon = (phosphor as unknown as Record<string, IconComponent>)[key];
    if (Icon) registry[name] = wrapPhosphor(Icon, weight);
  }

  return registry;
}

async function loadMaterialRegistry(variant: string): Promise<IconRegistry> {
  const module =
    variant === "filled"
      ? await import("./generated/materialFilledRegistry")
      : variant === "rounded"
        ? await import("./generated/materialRoundedRegistry")
        : variant === "sharp"
          ? await import("./generated/materialSharpRegistry")
          : variant === "twotone"
            ? await import("./generated/materialTwotoneRegistry")
            : await import("./generated/materialOutlinedRegistry");

  const componentsKey = Object.keys(module).find((k) =>
    k.endsWith("_COMPONENTS")
  )!;
  const components = (
    module as Record<string, Record<string, IconComponent>>
  )[componentsKey];
  const registry: IconRegistry = {};

  for (const [name, Icon] of Object.entries(components)) {
    registry[name as AppIconName] = wrapMuiIcon(Icon);
  }

  return registry;
}

async function loadFontAwesomeRegistry(variant: string): Promise<IconRegistry> {
  const fa = await import("react-icons/fa6");
  const mapModule =
    variant === "regular"
      ? await import("./generated/faRegularMap")
      : await import("./generated/faSolidMap");
  const map = pickMap(mapModule as Record<string, unknown>);
  const registry: IconRegistry = {};

  for (const name of APP_ICON_NAMES) {
    const key = map[name];
    const Icon = (fa as unknown as Record<string, IconComponent>)[key];
    if (Icon) registry[name] = normalizeSizeProps(Icon);
  }

  return registry;
}

async function loadTablerRegistry(variant: string): Promise<IconRegistry> {
  const tabler = await import("@tabler/icons-react");
  const mapModule =
    variant === "filled"
      ? await import("./generated/tablerFilledMap")
      : await import("./generated/tablerOutlineMap");
  const map = pickMap(mapModule as Record<string, unknown>);
  const registry: IconRegistry = {};

  for (const name of APP_ICON_NAMES) {
    const key = map[name];
    const Icon = (tabler as unknown as Record<string, IconComponent>)[key];
    if (Icon) registry[name] = normalizeSizeProps(Icon);
  }

  return registry;
}

async function loadHeroiconsRegistry(variant: string): Promise<IconRegistry> {
  const pack =
    variant === "solid"
      ? await import("@heroicons/react/24/solid")
      : variant === "mini"
        ? await import("@heroicons/react/20/solid")
        : await import("@heroicons/react/24/outline");
  const { HEROICONS_MAP } = await import("./generated/heroiconsMap");
  const registry: IconRegistry = {};

  for (const name of APP_ICON_NAMES) {
    const key = HEROICONS_MAP[name as keyof typeof HEROICONS_MAP];
    const Icon = (pack as unknown as Record<string, IconComponent>)[key];
    if (Icon) registry[name] = normalizeSizeProps(Icon);
  }

  return registry;
}

async function loadRemixRegistry(variant: string): Promise<IconRegistry> {
  const remix = await import("@remixicon/react");
  const mapModule =
    variant === "fill"
      ? await import("./generated/remixFillMap")
      : await import("./generated/remixLineMap");
  const map = pickMap(mapModule as Record<string, unknown>);
  const registry: IconRegistry = {};

  for (const name of APP_ICON_NAMES) {
    const key = map[name];
    const Icon = (remix as unknown as Record<string, IconComponent>)[key];
    if (Icon) registry[name] = normalizeSizeProps(Icon);
  }

  return registry;
}

async function loadBootstrapRegistry(variant: string): Promise<IconRegistry> {
  const bi = await import("react-bootstrap-icons");
  const mapModule =
    variant === "fill"
      ? await import("./generated/bootstrapFillMap")
      : await import("./generated/bootstrapOutlineMap");
  const map = pickMap(mapModule as Record<string, unknown>);
  const registry: IconRegistry = {};

  for (const name of APP_ICON_NAMES) {
    const key = map[name];
    const Icon = (bi as unknown as Record<string, IconComponent>)[key];
    if (Icon) registry[name] = normalizeSizeProps(Icon);
  }

  return registry;
}

async function loadIconoirRegistry(variant: string): Promise<IconRegistry> {
  const io = await import("iconoir-react");
  const mapModule =
    variant === "solid"
      ? await import("./generated/iconoirSolidMap")
      : await import("./generated/iconoirRegularMap");
  const map = pickMap(mapModule as Record<string, unknown>);
  const registry: IconRegistry = {};

  for (const name of APP_ICON_NAMES) {
    const key = map[name];
    const Icon = (io as unknown as Record<string, IconComponent>)[key];
    if (Icon) registry[name] = normalizeSizeProps(Icon);
  }

  return registry;
}

async function loadRadixRegistry(): Promise<IconRegistry> {
  const rx = await import("@radix-ui/react-icons");
  const { RADIX_MAP } = await import("./generated/radixMap");
  const registry: IconRegistry = {};

  for (const name of APP_ICON_NAMES) {
    const key = RADIX_MAP[name as keyof typeof RADIX_MAP];
    const Icon = (rx as unknown as Record<string, IconComponent>)[key];
    if (Icon) registry[name] = normalizeSizeProps(Icon);
  }

  return registry;
}

async function loadFluentRegistry(variant: string): Promise<IconRegistry> {
  const fl = await import("@fluentui/react-icons");
  const mapModule =
    variant === "filled"
      ? await import("./generated/fluentFilledMap")
      : variant === "light"
        ? await import("./generated/fluentLightMap")
        : await import("./generated/fluentRegularMap");
  const map = pickMap(mapModule as Record<string, unknown>);
  const registry: IconRegistry = {};

  for (const name of APP_ICON_NAMES) {
    const key = map[name];
    const Icon = (fl as unknown as Record<string, IconComponent>)[key];
    if (Icon) registry[name] = normalizeSizeProps(Icon);
  }

  return registry;
}

async function loadSolarRegistry(variant: string): Promise<IconRegistry> {
  const solar = await import("solar-icon-set");
  const mapModule =
    variant === "outline"
      ? await import("./generated/solarOutlineMap")
      : variant === "bold"
        ? await import("./generated/solarBoldMap")
        : variant === "broken"
          ? await import("./generated/solarBrokenMap")
          : variant === "lineduotone"
            ? await import("./generated/solarLineduotoneMap")
            : variant === "boldduotone"
              ? await import("./generated/solarBoldduotoneMap")
              : await import("./generated/solarLinearMap");
  const map = pickMap(mapModule as Record<string, unknown>);
  const registry: IconRegistry = {};

  for (const name of APP_ICON_NAMES) {
    const key = map[name];
    const Icon = (solar as unknown as Record<string, IconComponent>)[key];
    if (Icon) registry[name] = normalizeSizeProps(Icon);
  }

  return registry;
}

async function loadCustomRegistry(): Promise<IconRegistry> {
  const { default: FigmaProtoIcon } = await import("../FigmaProtoIcon");
  const registry: IconRegistry = {};

  for (const name of APP_ICON_NAMES) {
    registry[name] = function CustomIcon(props) {
      const resolvedSize =
        typeof props.size === "string" ? undefined : props.size;
      return (
        <FigmaProtoIcon iconKey={name} {...props} size={resolvedSize} />
      );
    };
  }

  return registry;
}

const cache = new Map<string, Promise<IconRegistry>>();

export function loadIconRegistry(
  libraryId: IconLibraryId,
  variant: string
): Promise<IconRegistry> {
  const cacheKey = `${libraryId}:${variant}`;
  const existing = cache.get(cacheKey);
  if (existing) return existing;

  let promise: Promise<IconRegistry>;
  switch (libraryId) {
    case "lucide":
      promise = loadLucideRegistry(variant);
      break;
    case "phosphor":
      promise = loadPhosphorRegistry(variant);
      break;
    case "material":
      promise = loadMaterialRegistry(variant);
      break;
    case "fontawesome":
      promise = loadFontAwesomeRegistry(variant);
      break;
    case "tabler":
      promise = loadTablerRegistry(variant);
      break;
    case "heroicons":
      promise = loadHeroiconsRegistry(variant);
      break;
    case "remix":
      promise = loadRemixRegistry(variant);
      break;
    case "bootstrap":
      promise = loadBootstrapRegistry(variant);
      break;
    case "iconoir":
      promise = loadIconoirRegistry(variant);
      break;
    case "radix":
      promise = loadRadixRegistry();
      break;
    case "fluent":
      promise = loadFluentRegistry(variant);
      break;
    case "solar":
      promise = loadSolarRegistry(variant);
      break;
    case "custom":
      promise = loadCustomRegistry();
      break;
    default:
      promise = loadPhosphorRegistry("regular");
  }

  cache.set(cacheKey, promise);
  return promise;
}

export function registryCacheKey(
  libraryId: IconLibraryId,
  variant: string
): string {
  return `${libraryId}:${variant}`;
}
