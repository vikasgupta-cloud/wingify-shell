import { Card } from "@/components/ui/card";
import {
  OVERLAY_CORE,
  PRIMITIVE_PALETTES,
  RADIUS_ALIASES,
  RADIUS_PRIMITIVES,
  SEMANTIC_COLOR_GROUPS,
  SHADOW_LEVELS,
  SPACE_ALIASES,
  SPACE_PRIMITIVES,
  THERMAL_STEPS,
  TYPE_SCALE,
} from "@/config/foundationTokens";
import { cn } from "@/lib/utils";

const TYPE_GROUPS = ["display", "heading", "body", "label", "numeric"] as const;

function primitiveVar(palette: string, step: string) {
  return `--vwo-${palette.toLowerCase()}-${step}`;
}

function Swatch({
  name,
  swatch,
  token,
}: {
  name: string;
  swatch: string;
  token: string;
}) {
  return (
    <div className="min-w-0">
      <div className={cn("h-16 rounded-lg border border-border", swatch)} />
      <p className="mt-2 truncate text-sm font-medium text-foreground">{name}</p>
      <p className="truncate text-xs text-muted-foreground">--{token}</p>
    </div>
  );
}

function SectionHead({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: string;
}) {
  return (
    <div className="max-w-2xl space-y-2">
      <p className="type-label text-muted-foreground">{kicker}</p>
      <h2 className="type-heading-xl text-foreground">{title}</h2>
      <p className="type-body-md text-muted-foreground">{children}</p>
    </div>
  );
}

export default function DesignSystemFoundations() {
  return (
    <div className="space-y-24">
      <section className="space-y-10">
        <SectionHead kicker="Foundations · Colors" title="Colors">
          Primitive ramps plus live semantic roles. Swatches resolve through CSS
          variables — Appearance restyles this page.
        </SectionHead>

        <div className="space-y-8">
          <h3 className="type-heading-sm text-foreground">Primitive Color</h3>
          <div className="space-y-6">
            {PRIMITIVE_PALETTES.map((palette) => (
              <div key={palette.name} className="space-y-2">
                <p className="type-label text-muted-foreground">{palette.name}</p>
                <div className="flex overflow-hidden rounded-md border border-border">
                  {palette.steps.map((step) => (
                    <div
                      key={step}
                      className="h-12 min-w-0 flex-1"
                      style={{
                        backgroundColor: `var(${primitiveVar(palette.name, step)})`,
                      }}
                      title={`${palette.name}/${step}`}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <p className="type-label text-muted-foreground">Midnight</p>
              <div
                className="h-12 w-24 rounded-md border border-border"
                style={{ backgroundColor: "var(--vwo-midnight-base)" }}
                title="midnight/base"
              />
            </div>
          </div>
        </div>

        {SEMANTIC_COLOR_GROUPS.map((group) => (
          <div key={group.title} className="space-y-4">
            <h3 className="type-heading-sm text-foreground">{group.title}</h3>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {group.tokens.map((c) => (
                <Swatch key={c.token} {...c} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-10">
        <SectionHead kicker="Foundations · Typography" title="Typography">
          Ergon for display and headings, DM Sans for body and labels, DM Mono
          for numeric. Weights 400, 500, 600, 700.
        </SectionHead>

        <div className="overflow-hidden rounded-lg border border-border bg-background">
          {TYPE_GROUPS.map((group) => (
            <div key={group}>
              <div className="border-b border-border bg-muted px-5 py-2">
                <p className="type-label text-muted-foreground">{group}</p>
              </div>
              {TYPE_SCALE.filter((row) => row.group === group).map((row) => (
                <div
                  key={row.id}
                  className="grid gap-4 border-b border-border px-5 py-6 last:border-b-0 sm:grid-cols-[minmax(10rem,14rem)_1fr_auto]"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {row.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.size}/{row.lh} · {row.tracking}
                    </p>
                  </div>
                  <p
                    className={cn(
                      `type-${row.id}`,
                      "min-w-0 text-foreground"
                    )}
                  >
                    {"sample" in row ? row.sample : row.label}
                  </p>
                  <p className="hidden text-right text-xs tabular-nums text-muted-foreground sm:block">
                    --type-{row.id}-size
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <SectionHead kicker="Foundations · Spacing & Radius" title="Spacing & Radius">
          A 16-step scale from 0 to 128px and a compact radius system. Values
          sit on a 4px grid; space/5 (20px) and space/13 (96px) sit off an 8px
          rhythm. Radius uses five steps plus full.
        </SectionHead>

        <div className="space-y-4">
          <h3 className="type-heading-sm text-foreground">Spacing Scale</h3>
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-[3rem_5rem_1fr_8rem] gap-4 border-b border-border bg-muted px-4 py-2 text-xs text-muted-foreground">
              <span>Name</span>
              <span>Pixels</span>
              <span>CSS variable</span>
              <span>Spacing</span>
            </div>
            {SPACE_PRIMITIVES.map((step) => (
              <div
                key={step.id}
                className="grid grid-cols-[3rem_5rem_1fr_8rem] items-center gap-4 border-b border-border px-4 py-2.5 last:border-b-0"
              >
                <span className="text-sm tabular-nums text-foreground">
                  {step.id}
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {step.px}px
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  --space-{step.id}
                </span>
                <div className="flex h-3 items-center">
                  <div
                    className="h-2 bg-foreground"
                    style={{ width: `var(--space-${step.id})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="type-heading-sm text-foreground">
            Component Spacing Aliases
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SPACE_ALIASES.map((alias) => (
              <Card key={alias.name} className="rounded-lg p-4 shadow-none">
                <p className="text-sm font-medium text-foreground">
                  {alias.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {alias.ref} · {alias.px}px
                </p>
                <div
                  className="mt-3 h-2 bg-foreground"
                  style={{ width: `var(${alias.token})` }}
                />
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="type-heading-sm text-foreground">Corner Radius</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {RADIUS_PRIMITIVES.map((r) => (
              <div key={r.name} className="space-y-2">
                <div
                  className="aspect-square border border-border bg-background"
                  style={{ borderRadius: `var(${r.token})` }}
                />
                <p className="text-xs font-medium text-foreground">
                  radius/{r.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.px === 9999 ? "9999px" : `${r.px}px`}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="type-heading-sm text-foreground">
            Component Radius Aliases
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {RADIUS_ALIASES.map((alias) => (
              <Card key={alias.name} className="rounded-lg p-4 shadow-none">
                <p className="text-sm font-medium text-foreground">
                  {alias.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {alias.ref}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <SectionHead kicker="Foundations · Effects & Overlays" title="Effects & Overlays">
          Shadows add depth on the z-axis. Overlay tokens are unthemed — they
          land on customer pages and recordings, which ignore the product theme.
        </SectionHead>

        <div className="space-y-4">
          <h3 className="type-heading-sm text-foreground">Shadows — Light</h3>
          <p className="type-body-sm text-muted-foreground">
            Warm neutral shadow color rgb(27 25 19 / a) to match palette warmth.
          </p>
          <div className="grid gap-6 rounded-lg bg-muted p-8 sm:grid-cols-3">
            {SHADOW_LEVELS.map((level) => (
              <div
                key={level}
                className="rounded-lg bg-background px-5 py-8"
                style={{ boxShadow: `var(--shadow-${level})` }}
              >
                <p className="text-sm font-medium text-foreground">
                  shadow/light/{level}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  --shadow-{level}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="type-heading-sm text-foreground">Shadows — Dark</h3>
          <p className="type-body-sm text-muted-foreground">
            Pure black at higher opacities so the shadow reads against dark
            surfaces.
          </p>
          <div
            data-mode="dark"
            className="grid gap-6 rounded-lg p-8 sm:grid-cols-3"
            style={{ backgroundColor: "var(--vwo-neutral-950)" }}
          >
            {SHADOW_LEVELS.map((level) => (
              <div
                key={level}
                className="rounded-lg px-5 py-8"
                style={{
                  backgroundColor: "var(--vwo-neutral-900)",
                  boxShadow: `var(--shadow-${level})`,
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--vwo-neutral-50)" }}
                >
                  shadow/dark/{level}
                </p>
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--vwo-neutral-300)" }}
                >
                  --shadow-{level}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="type-heading-sm text-foreground">Overlays</h3>
          <p className="type-body-sm text-muted-foreground">
            Single mode only. Core tokens plus thermal heatmap and scrim.
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {OVERLAY_CORE.map((item) => (
              <div key={item.token} className="min-w-0">
                <div
                  className="h-16 rounded-lg border border-border"
                  style={{ backgroundColor: `var(${item.token})` }}
                />
                <p className="mt-2 truncate text-sm font-medium text-foreground">
                  overlay/{item.name}
                </p>
                <p className="text-xs text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="type-heading-sm text-foreground">Thermal Heatmap</h3>
          <div className="flex overflow-hidden rounded-md border border-border">
            {THERMAL_STEPS.map((step) => (
              <div
                key={step}
                className="h-16 min-w-0 flex-1"
                style={{ backgroundColor: `var(--thermal-${step})` }}
                title={`thermal/${step}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {THERMAL_STEPS.map((step) => (
              <span key={step}>thermal/{step}</span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="type-heading-sm text-foreground">Scrim</h3>
          <div
            className="relative overflow-hidden rounded-lg border border-border px-6 py-10"
            style={{ backgroundColor: "var(--vwo-neutral-200)" }}
          >
            <p className="relative z-0 type-heading-sm text-foreground">
              Content behind the scrim
            </p>
            <p className="relative z-0 mt-1 type-body-md text-muted-foreground">
              Page content beneath the overlay when a modal or dialog is open.
            </p>
            <div
              className="absolute inset-0"
              style={{ backgroundColor: "var(--overlay-scrim)" }}
            />
            <p className="relative z-10 mt-6 text-xs text-primary-foreground">
              overlay/scrim · rgb(27 25 19 / 0.62)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
