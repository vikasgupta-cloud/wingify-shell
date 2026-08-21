import { useState, type ReactNode } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  Check,
  ChevronsUpDown,
  CircleHelp,
  Copy,
  Plus,
  Save,
  Search,
  Trash2,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { AddTag, Tag, tagSwatchClass, type TagSwatch } from "@/components/ui/tag";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import SplitSaveButton from "@/components/ui/SplitSaveButton";
import StatusBadge from "@/components/ui/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const DEVICES = [
  { id: "desktop", label: "Desktop" },
  { id: "mobile", label: "Mobile" },
  { id: "tablet", label: "Tablet" },
] as const;

const SEGMENTS = [
  "All visitors",
  "Returning visitors",
  "New visitors",
  "Mobile only",
  "US + CA",
  "Logged-in users",
] as const;

const SECONDARY_METRICS = [
  { id: "bounce", label: "Bounce rate" },
  { id: "revenue", label: "Revenue per visitor" },
  { id: "pages", label: "Pages / session" },
  { id: "time", label: "Time on page" },
] as const;

const LABELS = [
  { id: "checkout", label: "checkout", swatch: 1 as TagSwatch },
  { id: "q3-roadmap", label: "q3-roadmap", swatch: 4 as TagSwatch },
  { id: "mobile-only", label: "mobile-only", swatch: 6 as TagSwatch },
  { id: "needs-review", label: "needs-review", swatch: 7 as TagSwatch },
  { id: "revenue", label: "revenue", swatch: 3 as TagSwatch },
] as const;

/**
 * Living form used by the design-controller gallery — campaign setup
 * composed from the shadcn controls, not a component catalog.
 */
export default function FormGallery() {
  const [name, setName] = useState("Homepage CTA test");
  const [url, setUrl] = useState("https://www.example.com/home");
  const [email, setEmail] = useState("rohit@wingify.com");
  const [phone, setPhone] = useState("+1 415 555 0199");
  const [search, setSearch] = useState("");
  const [hypothesis, setHypothesis] = useState(
    "A stronger primary CTA on the hero will lift add-to-cart from returning visitors."
  );
  const [campaignType, setCampaignType] = useState("ab");
  const [environment, setEnvironment] = useState("production");
  const [traffic, setTraffic] = useState([40]);
  const [confidence, setConfidence] = useState([95]);
  const [sampleSize, setSampleSize] = useState("12000");
  const [devices, setDevices] = useState<string[]>(["desktop", "mobile"]);
  const [returning, setReturning] = useState(true);
  const [notify, setNotify] = useState(true);
  const [slackNotify, setSlackNotify] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [priority, setPriority] = useState("medium");
  const [successMetric, setSuccessMetric] = useState("atc");
  const [secondaryMetrics, setSecondaryMetrics] = useState<string[]>([
    "bounce",
    "revenue",
  ]);
  const [segment, setSegment] = useState<string>("Returning visitors");
  const [segmentOpen, setSegmentOpen] = useState(false);
  const [matchType, setMatchType] = useState<"url" | "pattern" | "regex">(
    "pattern"
  );
  const [tags, setTags] = useState<string[]>([
    "checkout",
    "q3-roadmap",
    "mobile-only",
    "needs-review",
    "revenue",
  ]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const allDevicesSelected = devices.length === DEVICES.length;
  const someDevicesSelected =
    devices.length > 0 && devices.length < DEVICES.length;

  const toggleDevice = (id: string, checked: boolean) => {
    setDevices((prev) =>
      checked ? [...prev, id] : prev.filter((d) => d !== id)
    );
  };

  const toggleAllDevices = (checked: boolean) => {
    setDevices(checked ? DEVICES.map((d) => d.id) : []);
  };

  const toggleSecondary = (id: string, checked: boolean) => {
    setSecondaryMetrics((prev) =>
      checked ? [...prev, id] : prev.filter((m) => m !== id)
    );
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        <Card className="shadow-sm">
          <CardHeader className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="font-title text-xl">
                Campaign details
              </CardTitle>
              <StatusBadge status="Draft" />
            </div>
            <CardDescription>
              Name, destination, and the hypothesis this test is meant to prove.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Campaign name" htmlFor="campaign-name">
                <Input
                  id="campaign-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Homepage CTA test"
                />
              </Field>
              <Field label="Destination URL" htmlFor="campaign-url">
                <div className="flex gap-2">
                  <Input
                    id="campaign-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Copy URL"
                    onClick={() => navigator.clipboard?.writeText(url)}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </Field>
            </div>

            <Field
              label="Hypothesis"
              htmlFor="campaign-hypothesis"
              hint="What do you expect to change, and why?"
              tip="Keep one clear success metric so the result is easy to read."
            >
              <Textarea
                id="campaign-hypothesis"
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                className="min-h-24"
                placeholder="What do you expect to change, and why?"
              />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Campaign type" htmlFor="campaign-type">
                <Select value={campaignType} onValueChange={setCampaignType}>
                  <SelectTrigger id="campaign-type">
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ab">A/B test</SelectItem>
                    <SelectItem value="mvt">Multivariate</SelectItem>
                    <SelectItem value="split">Split URL</SelectItem>
                    <SelectItem value="personalize">Personalize</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Search variations" htmlFor="campaign-search">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="campaign-search"
                    type="search"
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Find a variation…"
                  />
                </div>
              </Field>
            </div>

            <Field label="Labels" tip="Tags help filter campaigns in the list.">
              <div className="flex flex-wrap items-center gap-1.5">
                {tags.map((id) => {
                  const meta = LABELS.find((l) => l.id === id);
                  if (!meta) return null;
                  return (
                    <Tag
                      key={id}
                      label={meta.label}
                      swatch={meta.swatch}
                      onRemove={() => toggleTag(id)}
                    />
                  );
                })}
                <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                  <PopoverTrigger asChild>
                    <AddTag aria-expanded={tagsOpen} />
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-56 p-0">
                    <Command>
                      <CommandInput placeholder="Search labels…" />
                      <CommandList>
                        <CommandEmpty>No label found.</CommandEmpty>
                        <CommandGroup>
                          {LABELS.map((tag) => {
                            const checked = tags.includes(tag.id);
                            return (
                              <CommandItem
                                key={tag.id}
                                value={tag.label}
                                onSelect={() => toggleTag(tag.id)}
                              >
                                <span
                                  aria-hidden
                                  className={cn(
                                    "mr-2 size-2.5 shrink-0 rounded-[2px]",
                                    tagSwatchClass(tag.swatch)
                                  )}
                                />
                                <span className="flex-1">{tag.label}</span>
                                {checked ? (
                                  <Check className="size-4 text-foreground" />
                                ) : null}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </Field>

            <Field label="Environment">
              <RadioGroup
                value={environment}
                onValueChange={setEnvironment}
                className="grid gap-3 sm:grid-cols-3"
              >
                <RadioOption
                  id="env-production"
                  value="production"
                  label="Production"
                  hint="Live traffic"
                />
                <RadioOption
                  id="env-staging"
                  value="staging"
                  label="Staging"
                  hint="Preview only"
                />
                <RadioOption
                  id="env-both"
                  value="both"
                  label="Both"
                  hint="QA then go live"
                />
              </RadioGroup>
            </Field>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1.5">
            <CardTitle className="font-title text-xl">Goals & metrics</CardTitle>
            <CardDescription>
              Primary success metric, guardrails, and how sure you need to be.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <Field label="Success metric">
              <RadioGroup
                value={successMetric}
                onValueChange={setSuccessMetric}
                className="grid gap-3 sm:grid-cols-2"
              >
                <RadioOption
                  id="metric-atc"
                  value="atc"
                  label="Add to cart"
                  hint="Primary conversion"
                />
                <RadioOption
                  id="metric-purchase"
                  value="purchase"
                  label="Purchase"
                  hint="Revenue event"
                />
                <RadioOption
                  id="metric-signup"
                  value="signup"
                  label="Signup"
                  hint="Account created"
                />
                <RadioOption
                  id="metric-custom"
                  value="custom"
                  label="Custom event"
                  hint="Define in metrics"
                />
              </RadioGroup>
            </Field>

            <Field
              label="Secondary metrics"
              tip="Tracked alongside the primary — they do not decide the winner."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {SECONDARY_METRICS.map((metric) => {
                  const checked = secondaryMetrics.includes(metric.id);
                  return (
                    <label
                      key={metric.id}
                      htmlFor={`metric-${metric.id}`}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-3"
                    >
                      <Checkbox
                        id={`metric-${metric.id}`}
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleSecondary(metric.id, value === true)
                        }
                      />
                      <span className="text-sm">{metric.label}</span>
                    </label>
                  );
                })}
              </div>
            </Field>

            <Field
              label="Confidence threshold"
              hint={`${confidence[0]}% statistical confidence before calling a winner`}
            >
              <Slider
                value={confidence}
                onValueChange={setConfidence}
                min={80}
                max={99}
                step={1}
                aria-label="Confidence threshold"
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1.5">
            <CardTitle className="font-title text-xl">Audience</CardTitle>
            <CardDescription>
              How much traffic sees the test, and on which devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <Field
              label="Traffic allocation"
              hint={`${traffic[0]}% of visitors enter the campaign`}
            >
              <Slider
                value={traffic}
                onValueChange={setTraffic}
                min={5}
                max={100}
                step={5}
                aria-label="Traffic allocation"
              />
            </Field>

            <Field
              label="Target sample size"
              htmlFor="sample-size"
              hint="Minimum visitors before a conclusion is drawn."
            >
              <Input
                id="sample-size"
                type="number"
                inputMode="numeric"
                className="tabular-nums"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                min={100}
                step={100}
              />
            </Field>

            <Field label="Audience segment">
              <Popover open={segmentOpen} onOpenChange={setSegmentOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={segmentOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">{segment}</span>
                    <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                >
                  <Command>
                    <CommandInput placeholder="Search segments…" />
                    <CommandList>
                      <CommandEmpty>No segment found.</CommandEmpty>
                      <CommandGroup>
                        {SEGMENTS.map((item) => (
                          <CommandItem
                            key={item}
                            value={item}
                            onSelect={() => {
                              setSegment(item);
                              setSegmentOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "size-4",
                                segment === item ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {item}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>

            <Field label="URL match">
              <div className="inline-flex rounded-md border border-border bg-muted p-0.5">
                {(
                  [
                    { id: "url", label: "Exact URL" },
                    { id: "pattern", label: "Pattern" },
                    { id: "regex", label: "Regex" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMatchType(opt.id)}
                    className={cn(
                      "rounded-[5px] px-3 py-1.5 text-sm transition-colors",
                      matchType === opt.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Devices">
              <div className="space-y-3">
                <label
                  htmlFor="devices-all"
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-3"
                >
                  <Checkbox
                    id="devices-all"
                    checked={
                      allDevicesSelected
                        ? true
                        : someDevicesSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(value) =>
                      toggleAllDevices(value === true)
                    }
                  />
                  <span className="text-sm font-medium">All devices</span>
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {DEVICES.map((device) => {
                    const checked = devices.includes(device.id);
                    return (
                      <label
                        key={device.id}
                        htmlFor={`device-${device.id}`}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-3"
                      >
                        <Checkbox
                          id={`device-${device.id}`}
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleDevice(device.id, value === true)
                          }
                        />
                        <span className="text-sm">{device.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </Field>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
              <div className="space-y-1">
                <Label htmlFor="returning-visitors">
                  Returning visitors only
                </Label>
                <p className="text-xs text-muted-foreground">
                  New visitors stay on the control experience.
                </p>
              </div>
              <Switch
                id="returning-visitors"
                checked={returning}
                onCheckedChange={setReturning}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1.5">
            <CardTitle className="font-title text-xl">Schedule & alerts</CardTitle>
            <CardDescription>
              When the campaign starts and who hears about it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="schedule" className="space-y-6">
              <TabsList>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="schedule" className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Start date" htmlFor="start-date">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="start-date"
                          type="button"
                          variant="outline"
                          className="w-full justify-start gap-2 font-normal"
                        >
                          <CalendarDays className="size-4 text-muted-foreground" />
                          {startDate
                            ? format(startDate, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </Field>

                  <Field label="Start time" htmlFor="start-time">
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="tabular-nums"
                    />
                  </Field>

                  <Field label="Priority" htmlFor="priority">
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Choose priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    label="Notify"
                    htmlFor="notify-email"
                    hint="Results and health alerts go here."
                  >
                    <Input
                      id="notify-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                    />
                  </Field>
                  <Field
                    label="On-call phone"
                    htmlFor="notify-phone"
                    hint="Optional SMS for critical health alerts."
                  >
                    <Input
                      id="notify-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 …"
                    />
                  </Field>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
                    <div className="space-y-1">
                      <Label htmlFor="email-alerts">Email alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Send a digest when significance is reached.
                      </p>
                    </div>
                    <Switch
                      id="email-alerts"
                      checked={notify}
                      onCheckedChange={setNotify}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
                    <div className="space-y-1">
                      <Label htmlFor="slack-alerts">Slack alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Post to #experiment-alerts when the test ends.
                      </p>
                    </div>
                    <Switch
                      id="slack-alerts"
                      checked={slackNotify}
                      onCheckedChange={setSlackNotify}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-6">
                <Field
                  label="Internal notes"
                  htmlFor="campaign-notes"
                  hint="Visible only to your workspace."
                >
                  <Textarea
                    id="campaign-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-28"
                    placeholder="Context for reviewers…"
                  />
                </Field>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1.5">
            <CardTitle className="font-title text-xl">Field states</CardTitle>
            <CardDescription>
              Disabled, read-only, invalid, and required — how controls look
              under pressure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field
                label="Required name"
                htmlFor="required-name"
                hint="Leave empty to see the invalid state."
              >
                <Input
                  id="required-name"
                  required
                  placeholder="Campaign name"
                  aria-invalid={!name.trim()}
                  className={cn(
                    !name.trim() &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </Field>
              <Field
                label="Read-only workspace"
                htmlFor="workspace-ro"
                hint="Assigned by the account — not editable here."
              >
                <Input
                  id="workspace-ro"
                  value="Wingify Delhi"
                  readOnly
                  className="bg-muted"
                />
              </Field>
              <Field label="Disabled control" htmlFor="disabled-field">
                <Input
                  id="disabled-field"
                  value="Coming soon"
                  disabled
                />
              </Field>
              <Field label="Disabled switch">
                <div className="flex h-9 items-center justify-between rounded-lg border border-border px-3">
                  <span className="text-sm text-muted-foreground">
                    Auto-archive
                  </span>
                  <Switch disabled checked={false} aria-label="Auto-archive" />
                </div>
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1.5">
            <CardTitle className="font-title text-xl">Advanced</CardTitle>
            <CardDescription>
              Credentials, creatives, and fields that are usually left collapsed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["credentials"]}>
              <AccordionItem value="credentials">
                <AccordionTrigger>API & creatives</AccordionTrigger>
                <AccordionContent className="space-y-6 pt-2">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="API token" htmlFor="api-token">
                      <Input
                        id="api-token"
                        type="password"
                        defaultValue="wng_live_••••••••"
                        autoComplete="off"
                      />
                    </Field>
                    <Field
                      label="Account ID"
                      htmlFor="account-id"
                      hint="Read-only — assigned by the workspace."
                    >
                      <Input
                        id="account-id"
                        value="acct_2048"
                        disabled
                        readOnly
                        className="tabular-nums"
                      />
                    </Field>
                  </div>
                  <Field
                    label="Creative upload"
                    htmlFor="creative-file"
                    hint="PNG, JPG, or SVG. Dummy control — nothing is uploaded."
                  >
                    <Input id="creative-file" type="file" accept="image/*" />
                  </Field>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="tracking">
                <AccordionTrigger>Tracking snippet</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <Field
                    label="Custom JS"
                    htmlFor="custom-js"
                    hint="Runs once per visitor when they enter the campaign."
                  >
                    <Textarea
                      id="custom-js"
                      className="min-h-28 font-mono text-xs"
                      defaultValue={"// window.vwo_exp = { id: 4532345 };"}
                    />
                  </Field>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1.5">
            <CardTitle className="font-title text-xl">Actions</CardTitle>
            <CardDescription>
              Hover and press each one. Tab through to see the focus ring on
              every fill. Prominence runs primary → secondary → tertiary →
              ghost.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button">Primary CTA</Button>
              <Button type="button" variant="outline">
                Secondary CTA
              </Button>
              <Button type="button" variant="secondary">
                Secondary Button
              </Button>
              <Button type="button" variant="shadow">
                Shadow Button
              </Button>
              <Button type="button" variant="destructive">
                Danger Button
              </Button>
              <Button type="button" variant="destructiveInverted">
                Danger Inverted Button
              </Button>
              <Button type="button" variant="destructiveShadow">
                Danger Shadow Button
              </Button>
              <Button type="button" variant="link">
                Upload file
              </Button>
              <Button type="button" variant="ai">
                CTA shade for AI
              </Button>
              <Button type="button" disabled>
                Disabled
              </Button>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" variant="outline">
                Small
              </Button>
              <Button type="button" size="lg">
                Large
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Add"
              >
                <Plus />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Copy"
              >
                <Copy />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Delete"
              >
                <Trash2 />
              </Button>
              <Button type="button" disabled>
                <Save />
                Saving…
              </Button>
              <SplitSaveButton
                label="Save view"
                existingLabel="Default"
                onSaveExisting={() => setSaved(true)}
                onSaveAsNew={() => setSaved(true)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline">
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Duplicate campaign</DropdownMenuItem>
                  <DropdownMenuItem>Export JSON</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Archive</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              {saved
                ? "Draft stored in this session — nothing is sent to a server."
                : "Changes stay on this page until you launch or save."}
            </p>
            <Button type="button" onClick={() => setSaved(true)}>
              Launch campaign
            </Button>
          </CardFooter>
        </Card>
      </form>
    </TooltipProvider>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  tip,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  tip?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={htmlFor}>{label}</Label>
        {tip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                aria-label={`About ${label}`}
              >
                <CircleHelp className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              {tip}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      {children}
      {hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function RadioOption({
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
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-3"
    >
      <RadioGroupItem id={id} value={value} className="mt-0.5" />
      <span>
        <span className="block text-sm">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {hint}
        </span>
      </span>
    </label>
  );
}
