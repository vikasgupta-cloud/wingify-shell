import { Star } from "@/components/icons/protoLucide";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  BADGE_SIZES,
  BADGE_TONES,
  Badge,
  BadgeDot,
  BadgeFlag,
  type BadgeFill,
  type BadgeSize,
  type BadgeTone,
} from "@/components/ui/badge";

const LAYOUTS = [
  "text",
  "dot",
  "leading",
  "trailing",
  "both",
  "icon",
  "country",
  "avatar",
] as const;

type Layout = (typeof LAYOUTS)[number];

const LAYOUT_LABEL: Record<Layout, string> = {
  text: "Text only",
  dot: "Dot",
  leading: "Leading",
  trailing: "Trailing",
  both: "Lead & trail",
  icon: "Icon only",
  country: "Country",
  avatar: "Avatar",
};

function Pill({
  tone,
  fill,
  size,
  layout,
}: {
  tone: BadgeTone;
  fill: BadgeFill;
  size: BadgeSize;
  layout: Layout;
}) {
  const star = <Star className="shrink-0" aria-hidden />;
  if (layout === "icon") {
    return (
      <Badge
        tone={tone}
        fill={fill}
        size={size}
        iconOnly
        aria-label="Label"
      >
        {star}
      </Badge>
    );
  }
  if (layout === "dot") {
    return (
      <Badge tone={tone} fill={fill} size={size}>
        <BadgeDot />
        Label
      </Badge>
    );
  }
  if (layout === "leading") {
    return (
      <Badge tone={tone} fill={fill} size={size}>
        {star}
        Label
      </Badge>
    );
  }
  if (layout === "trailing") {
    return (
      <Badge tone={tone} fill={fill} size={size}>
        Label
        {star}
      </Badge>
    );
  }
  if (layout === "both") {
    return (
      <Badge tone={tone} fill={fill} size={size}>
        {star}
        Label
        {star}
      </Badge>
    );
  }
  if (layout === "country") {
    return (
      <Badge tone={tone} fill={fill} size={size}>
        <BadgeFlag />
        Label
      </Badge>
    );
  }
  if (layout === "avatar") {
    const px = size === "sm" ? 12 : size === "lg" ? 16 : 14;
    return (
      <Badge tone={tone} fill={fill} size={size}>
        <Avatar className="shrink-0" style={{ width: px, height: px }}>
          <AvatarImage src="https://i.pravatar.cc/64?u=badge" alt="" />
          <AvatarFallback className="text-[7px]">AL</AvatarFallback>
        </Avatar>
        Label
      </Badge>
    );
  }
  return (
    <Badge tone={tone} fill={fill} size={size}>
      Label
    </Badge>
  );
}

function Matrix({ fill }: { fill: BadgeFill }) {
  return (
    <div className="grid gap-6 overflow-x-auto lg:grid-cols-8">
      {LAYOUTS.map((layout) => (
        <div key={layout} className="min-w-[7.5rem] space-y-2">
          <p className="type-label text-muted-foreground">
            {LAYOUT_LABEL[layout]}
          </p>
          <div className="flex flex-col items-start gap-2">
            {BADGE_TONES.map((tone) => (
              <div key={tone} className="flex items-center gap-1.5">
                {BADGE_SIZES.map((size) => (
                  <Pill
                    key={size}
                    tone={tone}
                    fill={fill}
                    size={size}
                    layout={layout}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BadgeMatrix() {
  return (
    <div className="space-y-8">
      <div className="space-y-6 rounded-xl bg-canvas p-6">
        <div>
          <h3 className="type-heading-sm text-foreground">On canvas</h3>
          <p className="mt-1 type-body-sm text-muted-foreground">
            Light pills use a tinted fill. Solid pills use a filled tone.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Light pills</p>
          <Matrix fill="light" />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Solid pills</p>
          <Matrix fill="solid" />
        </div>
      </div>

      <div className="space-y-6 rounded-xl border border-border bg-background p-6">
        <div>
          <h3 className="type-heading-sm text-foreground">On surface</h3>
          <p className="mt-1 type-body-sm text-muted-foreground">
            Same tokens on a raised surface. Dark mode follows Appearance.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Light pills</p>
          <Matrix fill="light" />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Solid pills</p>
          <Matrix fill="solid" />
        </div>
      </div>
    </div>
  );
}
