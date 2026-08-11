import type { ComponentType, CSSProperties } from "react";
import type { IconLibraryId } from "@/config/iconLibraries";
import type { AppIconName } from "@/config/iconNames";
import { APP_ICON_NAMES } from "@/config/iconNames";

export type IconComponent = ComponentType<{
  size?: number | string;
  className?: string;
  strokeWidth?: number;
  color?: string;
  weight?: string;
  [key: string]: unknown;
}>;

export type IconRegistry = Partial<Record<AppIconName, IconComponent>>;

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

function wrapStroke(
  Icon: IconComponent,
  strokeWidth: number
): IconComponent {
  return function WrappedIcon(props) {
    return <Icon {...props} strokeWidth={props.strokeWidth ?? strokeWidth} />;
  };
}

function wrapPhosphor(
  Icon: IconComponent,
  weight: string
): IconComponent {
  return function WrappedPhosphor(props) {
    return <Icon {...props} weight={weight} />;
  };
}

function normalizeSizeProps(
  Icon: IconComponent
): IconComponent {
  return function NormalizedIcon({ size, className, ...rest }) {
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

function wrapMuiIcon(Icon: IconComponent): IconComponent {
  return function MuiWrapped({
    size,
    className,
    strokeWidth: _strokeWidth,
    color,
    style,
    ...rest
  }) {
    const sx =
      typeof size === "number" || color
        ? {
            ...(typeof size === "number"
              ? { fontSize: size, width: size, height: size }
              : {}),
            ...(color ? { color } : {}),
          }
        : undefined;

    return (
      <Icon
        {...rest}
        className={className}
        fontSize="inherit"
        sx={sx}
        style={style as CSSProperties | undefined}
      />
    );
  };
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

  const componentsKey = Object.keys(module).find((k) => k.endsWith("_COMPONENTS"))!;
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
  const mapKey = Object.keys(mapModule).find((k) => k.endsWith("_MAP"))!;
  const map = (mapModule as Record<string, Record<string, string>>)[mapKey];
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
  const mapKey = Object.keys(mapModule).find((k) => k.endsWith("_MAP"))!;
  const map = (mapModule as Record<string, Record<string, string>>)[mapKey];
  const registry: IconRegistry = {};

  for (const name of APP_ICON_NAMES) {
    const key = map[name];
    const Icon = (tabler as unknown as Record<string, IconComponent>)[key];
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
    case "custom":
      promise = loadCustomRegistry();
      break;
    default:
      promise = loadLucideRegistry("regular");
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
