import { useState } from "react";
import { LayoutGrid } from "@/components/icons/protoLucide";
import PageHeader from "@/components/layout/PageHeader";
import FormGallery from "@/components/layout/FormGallery";
import AnalyticsChartGallery from "@/components/layout/AnalyticsChartGallery";
import { cn } from "@/lib/utils";
import { iconForPath } from "@/lib/nav";
import IntegrationsStep from "@/pages/web-experiment-old/IntegrationsStep";
import DesignSystemCatalog from "./DesignSystemCatalog";
import DesignSystemFoundations from "./DesignSystemFoundations";
import EmailerGallery from "./emailers/EmailerGallery";

const SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    title: "Design System",
    description:
      "Foundations, components, forms, and themed emailers for the product shell.",
  },
  {
    id: "foundations",
    label: "Foundations",
    description: "Color, type, spacing, and radius from the active theme.",
  },
  {
    id: "components",
    label: "Components",
    description:
      "Shared shadcn controls used across the SaaS shell. Variants follow the CTA hierarchy: primary, secondary, tertiary, ghost, link, destructive.",
  },
  {
    id: "forms",
    label: "Forms",
    description: "Campaign setup and integrations as they appear in product flows.",
  },
  {
    id: "emailers",
    label: "Emailers",
    description: "Transactional mails painted with the current theme.",
  },
  {
    id: "charts",
    label: "Charts",
    description: "Analytics chart types and the chart token pack.",
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function DesignSystemPage() {
  const Icon = iconForPath("/design-system") ?? LayoutGrid;
  const [section, setSection] = useState<SectionId>("overview");
  const active = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden">
      <aside className="flex h-full w-56 shrink-0 flex-col overflow-y-auto border-r border-border bg-background py-8">
        <p className="px-5 pb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Contents
        </p>
        <nav className="flex flex-col gap-0.5 px-3" aria-label="Design system">
          {SECTIONS.map((item) => {
            const active = item.id === section;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={cn(
                  "rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto pb-20">
        <PageHeader
          title={"title" in active ? active.title : active.label}
          icon={Icon}
          description={active.description}
        />

        <div className="px-12 pt-8">
          {section === "overview" && (
            <div className="max-w-3xl space-y-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                This is the living reference for Wingify Shell. Tokens come from
                the active theme; open Appearance from Settings → General to
                restyle color, type, and CTAs. Everything on these pages is
                client-side dummy UI — no API.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {SECTIONS.filter((s) => s.id !== "overview").map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className="rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-muted"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.id === "foundations" &&
                        "Color, type, spacing, and radius."}
                      {item.id === "components" &&
                        "Buttons, inputs, overlays, and chrome."}
                      {item.id === "forms" &&
                        "Campaign setup and integrations."}
                      {item.id === "emailers" &&
                        "Transactional mails and export."}
                      {item.id === "charts" &&
                        "Analytics chart types and tokens."}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {section === "foundations" && <DesignSystemFoundations />}

          {section === "components" && (
            <div className="space-y-6">
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Shared shadcn controls used across the SaaS shell. Variants
                follow the CTA hierarchy: primary, secondary, tertiary, ghost,
                link, destructive.
              </p>
              <DesignSystemCatalog />
            </div>
          )}

          {section === "forms" && (
            <div className="space-y-16">
              <section className="space-y-4">
                <div>
                  <h2 className="font-title text-xl font-semibold text-foreground">
                    Campaign setup
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    Inputs, selects, tags, sliders, and save actions as they
                    appear next to the appearance panel.
                  </p>
                </div>
                <FormGallery />
              </section>
              <section className="space-y-4">
                <div>
                  <h2 className="font-title text-xl font-semibold text-foreground">
                    Integrations
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    Connected apps, radios, date, checkboxes, and CTAs from the
                    campaign flow.
                  </p>
                </div>
                <IntegrationsStep />
              </section>
            </div>
          )}

          {section === "emailers" && (
            <div className="space-y-6">
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Transactional mails painted with the current theme. Download
                tokens and the prompt to restyle the same components outside
                this app.
              </p>
              <EmailerGallery />
            </div>
          )}

          {section === "charts" && (
            <div className="space-y-6">
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Chart types used in product analytics. Colors use the chart
                token pack (categorical, sequential, diverging, and chrome).
              </p>
              <AnalyticsChartGallery />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
