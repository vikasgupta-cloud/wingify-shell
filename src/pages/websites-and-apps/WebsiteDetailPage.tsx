/** Configuration → Connected → website detail (Code / Performance / …).
 * Opened from the Websites and Apps table. Header breadcrumb switcher lives in DrillInBreadcrumb.
 */

import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Globe,
  MoreVertical,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SMART_CODE_PLATFORMS,
  WNA_SITES_BASE,
  getWebsiteById,
  type SmartCodePlatform,
} from "@/data/websitesAndApps";
import { cn } from "@/lib/utils";

const DETAIL_TABS = [
  { id: "code", label: "Code" },
  { id: "performance", label: "Performance" },
  { id: "audit", label: "Audit" },
  { id: "sitewide-js", label: "Sitewide JS" },
  { id: "debug", label: "Debug" },
] as const;

function CodeTab({
  platform,
  onPlatformChange,
  smartCode,
  siteName,
}: {
  platform: SmartCodePlatform;
  onPlatformChange: (p: SmartCodePlatform) => void;
  smartCode: NonNullable<ReturnType<typeof getWebsiteById>>["smartCode"];
  siteName: string;
}) {
  const [cookieConsent, setCookieConsent] = useState(false);

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-foreground">Code</h2>

      {smartCode?.detected ? (
        <div className="flex gap-3 rounded-lg border border-[var(--success-bg)] bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success-fg)]">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0"
            strokeWidth={1.75}
            aria-hidden
          />
          <div className="min-w-0 space-y-1">
            <p className="font-medium">SmartCode is detected on your website.</p>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-90">
              <span>Version: {smartCode.version}</span>
              <span>Type: {smartCode.type}</span>
              <span>Platform: {smartCode.platform}</span>
              <span className="truncate" title={smartCode.url}>
                URL: {smartCode.url}
              </span>
              <span>Checked on: {smartCode.checkedOn}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          SmartCode is not detected on this project yet.
        </div>
      )}

      <div className="flex flex-wrap gap-1 border-b border-border">
        {SMART_CODE_PLATFORMS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPlatformChange(p)}
            className={cn(
              "px-3 py-2 text-sm transition-colors",
              platform === p
                ? "border-b-2 border-foreground font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Steps to install SmartCode using Wingify {platform} plugin
        </h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
          <li>
            Download the plugin from{" "}
            <button
              type="button"
              className="font-medium text-[var(--info-fg)] underline-offset-2 hover:underline"
            >
              here
            </button>
            .
          </li>
          <li>
            Install and activate the plugin in your {platform} dashboard.
          </li>
          <li>
            Paste your {siteName} SmartCode account ID when prompted, then save.
          </li>
        </ol>
      </div>

      <div className="space-y-1 text-sm">
        <p className="font-medium text-foreground">
          Content Security Policy (CSP)?
        </p>
        <button
          type="button"
          className="font-medium text-[var(--info-fg)] underline-offset-2 hover:underline"
        >
          View policy
        </button>
      </div>

      <div className="rounded-xl border border-border bg-background px-4 py-4">
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={cookieConsent}
            onCheckedChange={(v) => setCookieConsent(v === true)}
            className="mt-0.5"
            aria-label="Enable Cookie Consent"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">
              Enable Cookie Consent
            </span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              Configure Wingify functionality based on cookie consent status.{" "}
              <button
                type="button"
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Read more
              </button>
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}

export default function WebsiteDetailPage() {
  const { siteId = "" } = useParams();
  const site = getWebsiteById(siteId);
  const [platform, setPlatform] = useState<SmartCodePlatform>(
    () => site?.smartCode?.platform ?? "Wordpress"
  );

  const tabPlaceholder = useMemo(
    () => (
      <p className="py-12 text-sm text-muted-foreground">
        Coming soon for this website.
      </p>
    ),
    []
  );

  if (!site) {
    return <Navigate to={WNA_SITES_BASE} replace />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-8 pb-16 pt-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[var(--info-bg)] text-base font-semibold text-[var(--info-fg)]"
            aria-hidden
          >
            {site.initial}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {site.name}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Globe className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                {site.domain ?? "No domain"}
              </span>
              <span aria-hidden>•</span>
              <span>{site.category}</span>
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${site.name}`}
              className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="size-4" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <Link to={WNA_SITES_BASE}>Back to list</Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Edit website</DropdownMenuItem>
            <DropdownMenuItem disabled>Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="code" className="w-full">
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
          {DETAIL_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="code" className="mt-8 focus-visible:outline-none">
          <CodeTab
            platform={platform}
            onPlatformChange={setPlatform}
            smartCode={site.smartCode}
            siteName={site.name}
          />
        </TabsContent>
        <TabsContent value="performance" className="mt-8">
          {tabPlaceholder}
        </TabsContent>
        <TabsContent value="audit" className="mt-8">
          {tabPlaceholder}
        </TabsContent>
        <TabsContent value="sitewide-js" className="mt-8">
          {tabPlaceholder}
        </TabsContent>
        <TabsContent value="debug" className="mt-8">
          {tabPlaceholder}
        </TabsContent>
      </Tabs>
    </div>
  );
}
