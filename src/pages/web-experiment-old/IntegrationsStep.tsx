import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  HelpCircle,
  MoreVertical,
  PlusCircle,
  RotateCcw,
  Save,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { INTEGRATIONS } from "@/data/integrations";
import { useConfigStore } from "@/store/config";
import { cn } from "@/lib/utils";
import { OLD_STEPS } from "./oldFlow";

const SHOW = ["ga4", "snowflake", "segment"] as const;

/** Distinct brand chip fills — live logos, not the theme control accent. */
const BRAND_CHIP: Record<
  (typeof SHOW)[number],
  { bg: string; fg: string }
> = {
  ga4: { bg: "hsl(var(--vwo-cherry-500))", fg: "hsl(var(--vwo-neutral-0))" },
  snowflake: {
    bg: "hsl(var(--vwo-ocean-500))",
    fg: "hsl(var(--vwo-neutral-0))",
  },
  segment: { bg: "hsl(var(--vwo-green-700))", fg: "hsl(var(--vwo-neutral-0))" },
};

/** Inline text links (not link CTAs) shown on a few connected-app rows. */
const ROW_LINKS: Partial<
  Record<(typeof SHOW)[number], { href: string; label: string }>
> = {
  ga4: { href: "#", label: "Open property" },
  segment: { href: "#", label: "API docs" },
};

const EVENT_OPTIONS = [
  { id: "campaign_view", label: "Campaign viewed" },
  { id: "variation_shown", label: "Variation shown" },
  { id: "goal_triggered", label: "Goal triggered" },
  { id: "visitor_tracked", label: "Visitor tracked" },
] as const;

/**
 * Integrations step — real product-shaped form surface for theme QA.
 * Covers primary / secondary / tertiary CTAs plus radio, checkbox, slider,
 * dropdown, date, and time controls.
 */
export default function IntegrationsStep() {
  const connected = useConfigStore((s) => s.connectedIntegrations);
  const connect = useConfigStore((s) => s.connectIntegration);
  const disconnect = useConfigStore((s) => s.disconnectIntegration);
  const meta = OLD_STEPS[4];

  const [syncMode, setSyncMode] = useState("realtime");
  const [property, setProperty] = useState("ga4-prod");
  const [sampleRate, setSampleRate] = useState([100]);
  const [events, setEvents] = useState<string[]>([
    "campaign_view",
    "goal_triggered",
  ]);
  const [goLiveDate, setGoLiveDate] = useState<Date | undefined>(new Date());
  const [goLiveTime, setGoLiveTime] = useState("09:00");
  const [webhookUrl, setWebhookUrl] = useState(
    "https://hooks.example.com/vwo/events"
  );
  const [notes, setNotes] = useState("");
  const [pauseOnError, setPauseOnError] = useState(true);
  const [includePii, setIncludePii] = useState(false);
  const [targetUrl, setTargetUrl] = useState("https://vwo.com");

  useEffect(() => {
    if (connected.length > 0) return;
    for (const id of ["ga4", "segment"]) {
      connect(id);
    }
  }, [connected.length, connect]);

  const rows = SHOW.map((id) => INTEGRATIONS.find((i) => i.id === id)).filter(
    (i): i is NonNullable<typeof i> => Boolean(i)
  );

  const toggleEvent = (id: string, checked: boolean) => {
    setEvents((prev) =>
      checked ? [...prev, id] : prev.filter((e) => e !== id)
    );
  };

  const resetDefaults = () => {
    setSyncMode("realtime");
    setProperty("ga4-prod");
    setSampleRate([100]);
    setEvents(["campaign_view", "goal_triggered"]);
    setGoLiveDate(new Date());
    setGoLiveTime("09:00");
    setPauseOnError(true);
    setIncludePii(false);
    setNotes("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h2 className="font-title text-2xl font-semibold text-foreground">
          {meta.label}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
      </div>

      {/* Connected apps — checkbox list */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">Connected apps</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Choose which tools receive experiment data from this campaign.
          </p>
        </div>
        <ul className="divide-y divide-border rounded-lg border border-border bg-background">
          {rows.map((item) => {
            const checked = connected.includes(item.id);
            const rowLink = ROW_LINKS[item.id as (typeof SHOW)[number]];
            const chip = BRAND_CHIP[item.id as (typeof SHOW)[number]];
            return (
              <li key={item.id} className="flex items-start gap-3 px-4 py-4">
                <Checkbox
                  id={`int-${item.id}`}
                  checked={checked}
                  onCheckedChange={(value) =>
                    value === true ? connect(item.id) : disconnect(item.id)
                  }
                  className="mt-0.5"
                />
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold"
                  style={
                    chip
                      ? { backgroundColor: chip.bg, color: chip.fg }
                      : undefined
                  }
                >
                  {item.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`int-${item.id}`}
                    className="flex cursor-pointer items-center gap-1.5 text-sm font-medium"
                  >
                    {item.name}
                    <HelpCircle className="size-3.5 text-muted-foreground" />
                  </label>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  {rowLink ? (
                    <a
                      href={rowLink.href}
                      className="mt-1 inline-block text-sm text-link hover:text-link-hover hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      {rowLink.label}
                    </a>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-0.5 shrink-0"
                >
                  Configure
                </Button>
              </li>
            );
          })}
        </ul>
        <a
          href="#"
          className="inline-block text-sm text-link hover:text-link-hover hover:underline"
          onClick={(e) => e.preventDefault()}
        >
          Browse more integrations...
        </a>
      </section>

      {/* Sync settings — radio + dropdown + slider */}
      <section className="space-y-5 rounded-lg border border-border bg-background p-5">
        <div>
          <h3 className="text-sm font-medium text-foreground">Sync settings</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            How often data leaves VWO and which property receives it.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Delivery mode</Label>
          <RadioGroup
            value={syncMode}
            onValueChange={setSyncMode}
            className="grid gap-3 sm:grid-cols-3"
          >
            <RadioCard
              id="sync-realtime"
              value="realtime"
              label="Realtime"
              hint="Push on every conversion"
            />
            <RadioCard
              id="sync-batched"
              value="batched"
              label="Batched"
              hint="Hourly digest"
            />
            <RadioCard
              id="sync-manual"
              value="manual"
              label="Manual"
              hint="Export on demand"
            />
          </RadioGroup>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="int-property">Destination property</Label>
            <Select value={property} onValueChange={setProperty}>
              <SelectTrigger id="int-property">
                <SelectValue placeholder="Choose property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ga4-prod">GA4 — Production</SelectItem>
                <SelectItem value="ga4-staging">GA4 — Staging</SelectItem>
                <SelectItem value="mixpanel-main">Mixpanel — Main</SelectItem>
                <SelectItem value="segment-prod">Segment — Prod</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label>Sample rate</Label>
            <span className="font-number text-xs tabular-nums text-muted-foreground">
              {sampleRate[0]}% of sessions
            </span>
          </div>
          <Slider
            value={sampleRate}
            onValueChange={setSampleRate}
            min={10}
            max={100}
            step={5}
            aria-label="Sample rate"
          />
        </div>
      </section>

      {/* Events — checkboxes */}
      <section className="space-y-5 rounded-lg border border-border bg-background p-5">
        <div>
          <h3 className="text-sm font-medium text-foreground">Events to sync</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Only selected events are forwarded to connected tools.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {EVENT_OPTIONS.map((event) => {
            const checked = events.includes(event.id);
            return (
              <label
                key={event.id}
                htmlFor={`event-${event.id}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-3"
              >
                <Checkbox
                  id={`event-${event.id}`}
                  checked={checked}
                  onCheckedChange={(value) =>
                    toggleEvent(event.id, value === true)
                  }
                />
                <span className="text-sm">{event.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Schedule — date + time + switches */}
      <section className="space-y-5 rounded-lg border border-border bg-background p-5">
        <div>
          <h3 className="text-sm font-medium text-foreground">Go-live schedule</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            When this campaign starts pushing data to connected tools.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="go-live-date">Start date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="go-live-date"
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2 font-normal"
                >
                  <CalendarDays className="size-4 text-muted-foreground" />
                  {goLiveDate ? format(goLiveDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={goLiveDate}
                  onSelect={setGoLiveDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="go-live-time">Start time</Label>
            <Input
              id="go-live-time"
              type="time"
              value={goLiveTime}
              onChange={(e) => setGoLiveTime(e.target.value)}
              className="tabular-nums"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="pause-on-error">Pause sync on errors</Label>
              <p className="text-xs text-muted-foreground">
                Stop forwarding if the destination returns 5xx.
              </p>
            </div>
            <Switch
              id="pause-on-error"
              checked={pauseOnError}
              onCheckedChange={setPauseOnError}
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="include-pii">Include visitor PII</Label>
              <p className="text-xs text-muted-foreground">
                Off by default — enable only when the destination is approved.
              </p>
            </div>
            <Switch
              id="include-pii"
              checked={includePii}
              onCheckedChange={setIncludePii}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="int-notes">Internal notes</Label>
          <Textarea
            id="int-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-20"
            placeholder="e.g. Approved by RevOps for GA4 production…"
          />
        </div>
      </section>

      {/* Page targeting — shadow CTAs (same as Cancel) */}
      <section className="space-y-4 rounded-lg border border-border bg-background p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            Include pages where
          </p>
          <Button type="button" variant="shadow" size="sm">
            <Save className="size-3.5" />
            Save for future use
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="matches">
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="matches">URL matches</SelectItem>
              <SelectItem value="contains">URL contains</SelectItem>
              <SelectItem value="starts">URL starts with</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://"
          />
          <Button type="button" variant="shadow" size="icon" aria-label="More">
            <MoreVertical />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="shadow" size="sm">
            <PlusCircle className="size-3.5" />
            Include pages
          </Button>
          <Button type="button" variant="shadow" size="sm">
            <PlusCircle className="size-3.5" />
            Exclude pages
          </Button>
        </div>
      </section>

      {/* CTA hierarchy — primary / secondary / tertiary / ghost / shadow / link / destructive */}
      <section className="space-y-4 rounded-lg border border-border bg-background px-5 py-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Actions</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            CTA levels from the design system — switch themes to compare.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm">
            Save integration
          </Button>
          <Button type="button" variant="secondary" size="sm">
            Test connection
          </Button>
          <Button type="button" variant="tertiary" size="sm">
            Preview payload
          </Button>
          <Button type="button" variant="ghost" size="sm">
            Cancel
          </Button>
          <Button type="button" variant="shadow" size="sm">
            <Save className="size-3.5" />
            Save for future use
          </Button>
          <Button type="button" variant="link" size="sm">
            <HelpCircle className="size-3.5" />
            Browse more integrations
          </Button>
          <Button type="button" variant="destructive" size="sm">
            Disconnect all
          </Button>
        </div>
      </section>

      {/* Notification banners — success / warning / danger with CTAs */}
      <div className="space-y-3">
        <div
          role="status"
          className="flex flex-col gap-3 rounded-lg border border-success-fg/25 bg-success-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-fg" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-success-fg">
                Sync connected
              </p>
              <p className="mt-0.5 text-sm text-success-fg/80">
                Two tools are receiving experiment data. Save or test the
                current sync settings when you’re ready.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pl-7">
            <Button type="button" size="sm">
              Save
            </Button>
            <Button type="button" variant="secondary" size="sm">
              Test
            </Button>
            <Button type="button" variant="link" size="sm">
              <HelpCircle className="size-3.5" />
              Docs
            </Button>
          </div>
        </div>

        <div
          role="status"
          className="flex flex-col gap-3 rounded-lg border border-warning-fg/25 bg-warning-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-fg" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-warning-fg">
                Sample rate is partial
              </p>
              <p className="mt-0.5 text-sm text-warning-fg/80">
                Only {sampleRate[0]}% of sessions are forwarded. Reset to 100% or
                cancel if this wasn’t intentional.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pl-7">
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              onClick={resetDefaults}
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
            <Button type="button" variant="ghost" size="sm">
              Cancel
            </Button>
          </div>
        </div>

        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-danger-fg/25 bg-danger-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-start gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger-fg" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-danger-fg">
                Destination rejected events
              </p>
              <p className="mt-0.5 text-sm text-danger-fg/80">
                GA4 returned errors for the last batch. Fix the property mapping
                or disconnect the integration to stop retries.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pl-7">
            <Button type="button" variant="secondary" size="sm">
              Configure
            </Button>
            <Button type="button" variant="destructive" size="sm">
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RadioCard({
  id,
  value,
  label,
  hint,
}: {
  id: string;
  value: string;
  label: string;
  hint: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-3"
      )}
    >
      <RadioGroupItem id={id} value={value} className="mt-0.5" />
      <span>
        <span className="block text-sm font-medium text-foreground">
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}
