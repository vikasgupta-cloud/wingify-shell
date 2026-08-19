/**
 * Component Lab — realistic form playground for testing theme + component colours.
 * Wired under Data 360 in navigation; all controls use shared shadcn UI.
 */
import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "@/components/icons/protoLucide";
import PageHeader from "@/components/layout/PageHeader";
import { iconForPath } from "@/lib/nav";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--appearance-progress-track,_var(--secondary)))]",
        className
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-[hsl(var(--appearance-progress-value,_var(--primary)))] transition-[width]"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function StatusBanner({
  tone,
  title,
  body,
}: {
  tone: "success" | "error" | "warning" | "info";
  title: string;
  body: string;
}) {
  const styles = {
    success: {
      box: "border-success-fg/25 bg-success-bg text-success-fg",
      Icon: CheckCircle2,
    },
    error: {
      box: "border-danger-fg/25 bg-danger-bg text-danger-fg",
      Icon: AlertCircle,
    },
    warning: {
      box: "border-warning-fg/25 bg-warning-bg text-warning-fg",
      Icon: AlertTriangle,
    },
    info: {
      box: "border-info-fg/25 bg-info-bg text-info-fg",
      Icon: Info,
    },
  }[tone];
  const Icon = styles.Icon;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3 text-sm",
        styles.box
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
      <div className="min-w-0 space-y-0.5">
        <p className="font-medium">{title}</p>
        <p className="opacity-90">{body}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-danger-fg">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export default function ComponentLabPage() {
  const Icon = iconForPath("/component-lab");
  const [rollout, setRollout] = useState([42]);
  const [audience, setAudience] = useState("all");
  const [channel, setChannel] = useState("email");
  const [notify, setNotify] = useState(true);
  const [digest, setDigest] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);

  return (
    <div className="min-h-full bg-canvas pb-16">
      <PageHeader
        title="Component Lab"
        icon={Icon}
        description="Try theme and component colours against a full form with every shared control."
      />

      <div className="mx-auto mt-8 flex w-full max-w-[920px] flex-col gap-8 px-12">
        <div className="grid gap-3 sm:grid-cols-2">
          <StatusBanner
            tone="success"
            title="Campaign published"
            body="All checks passed. Traffic is now flowing to variation B."
          />
          <StatusBanner
            tone="error"
            title="Validation failed"
            body="Fix the highlighted fields before you can save this draft."
          />
          <StatusBanner
            tone="warning"
            title="Low sample size"
            body="Results may be noisy until you collect more visitors."
          />
          <StatusBanner
            tone="info"
            title="Tip"
            body="Use the appearance panel to tweak CTA and control colours live."
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign setup</CardTitle>
            <CardDescription>
              A working form that exercises every shared component and status tone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="audience">Audience</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Campaign name" htmlFor="lab-name" hint="Shown in listings and reports.">
                    <Input id="lab-name" defaultValue="Homepage CTA test" />
                  </Field>
                  <Field
                    label="Owner email"
                    htmlFor="lab-email"
                    error={showEmailError ? "Enter a valid work email." : undefined}
                    hint={showEmailError ? undefined : "We’ll send launch alerts here."}
                  >
                    <Input
                      id="lab-email"
                      type="email"
                      placeholder="you@company.com"
                      className={showEmailError ? "border-danger-fg focus-visible:ring-danger-fg" : undefined}
                      onBlur={(e) => setShowEmailError(!e.target.value.includes("@"))}
                    />
                  </Field>
                </div>

                <Field label="Hypothesis" htmlFor="lab-hypothesis">
                  <Textarea
                    id="lab-hypothesis"
                    defaultValue="A clearer primary CTA will increase signup rate among new visitors."
                    rows={4}
                  />
                </Field>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Workspace" htmlFor="lab-workspace">
                    <Select defaultValue="delhi">
                      <SelectTrigger id="lab-workspace">
                        <SelectValue placeholder="Select workspace" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delhi">Wingify Delhi</SelectItem>
                        <SelectItem value="sf">Wingify SF</SelectItem>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Priority">
                    <RadioGroup
                      value={channel}
                      onValueChange={setChannel}
                      className="flex flex-wrap gap-4 pt-2"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="email" id="lab-pri-high" />
                        <Label htmlFor="lab-pri-high">High</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="sms" id="lab-pri-med" />
                        <Label htmlFor="lab-pri-med">Medium</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="push" id="lab-pri-low" />
                        <Label htmlFor="lab-pri-low">Low</Label>
                      </div>
                    </RadioGroup>
                  </Field>
                </div>
              </TabsContent>

              <TabsContent value="audience" className="mt-6 space-y-6">
                <Field label="Audience">
                  <RadioGroup
                    value={audience}
                    onValueChange={setAudience}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="all" id="lab-aud-all" />
                      <Label htmlFor="lab-aud-all">All visitors</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="new" id="lab-aud-new" />
                      <Label htmlFor="lab-aud-new">New visitors only</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="segment" id="lab-aud-seg" />
                      <Label htmlFor="lab-aud-seg">Saved segment</Label>
                    </div>
                  </RadioGroup>
                </Field>

                <Field
                  label={`Traffic allocation — ${rollout[0]}%`}
                  hint="Slider value uses the Progress / Slider appearance tokens."
                >
                  <Slider
                    value={rollout}
                    onValueChange={setRollout}
                    max={100}
                    step={1}
                  />
                </Field>

                <div className="space-y-2">
                  <Label>Setup progress</Label>
                  <ProgressBar value={rollout[0] ?? 0} />
                  <ProgressBar value={72} />
                  <ProgressBar value={18} />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="mt-6 space-y-6">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Email notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Toggle uses on/off and thumb colours from appearance.
                    </p>
                  </div>
                  <Switch checked={notify} onCheckedChange={setNotify} />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Weekly digest</p>
                    <p className="text-xs text-muted-foreground">Off by default.</p>
                  </div>
                  <Switch checked={digest} onCheckedChange={setDigest} />
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="lab-terms"
                    checked={acceptTerms}
                    onCheckedChange={(v) => setAcceptTerms(v === true)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="lab-terms">I accept the launch checklist</Label>
                    <p className="text-xs text-muted-foreground">
                      Checkbox selected fill follows the Checkbox appearance overrides.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="lab-disabled" disabled checked />
                  <Label htmlFor="lab-disabled" className="text-muted-foreground">
                    Disabled checkbox
                  </Label>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tab styles
              </p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Pill tabs — active tab is a filled chip.
                  </p>
                  <Tabs defaultValue="overview">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="segments">Segments</TabsTrigger>
                      <TabsTrigger value="locked" disabled>
                        Disabled
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Underline tabs — text only, with a line under the active tab.
                  </p>
                  <Tabs defaultValue="overview">
                    <TabsList variant="underline">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="segments">Segments</TabsTrigger>
                      <TabsTrigger value="locked" disabled>
                        Disabled
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Badges & status chips
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge>Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <span className="inline-flex items-center rounded-md border border-transparent bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success-fg">
                  Success
                </span>
                <span className="inline-flex items-center rounded-md border border-transparent bg-warning-bg px-2.5 py-0.5 text-xs font-semibold text-warning-fg">
                  Warning
                </span>
                <span className="inline-flex items-center rounded-md border border-transparent bg-danger-bg px-2.5 py-0.5 text-xs font-semibold text-danger-fg">
                  Error
                </span>
                <span className="inline-flex items-center rounded-md border border-transparent bg-info-bg px-2.5 py-0.5 text-xs font-semibold text-info-fg">
                  Information
                </span>
                <span className="inline-flex items-center rounded-md border border-[hsl(var(--appearance-badges-border,_var(--border)))] bg-[hsl(var(--appearance-badges-background,_var(--muted)))] px-2.5 py-0.5 text-xs font-semibold text-[hsl(var(--appearance-badges-text,_var(--foreground)))]">
                  Custom badge token
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="Draft" />
                <StatusBadge status="In QA" />
                <StatusBadge status="Ready to launch" />
                <StatusBadge status="Running" />
                <StatusBadge status="In Analysis" />
                <StatusBadge status="Paused" />
                <StatusBadge status="Ended" />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                CTA types
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button">Primary</Button>
                <Button type="button" variant="secondary">
                  Secondary
                </Button>
                <Button type="button" variant="outline">
                  Tertiary
                </Button>
                <Button type="button" variant="ghost">
                  Ghost
                </Button>
                <Button type="button" variant="link">
                  Link
                </Button>
                <Button type="button" variant="destructive">
                  Destructive
                </Button>
                <Button type="button" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="qa">
                <AccordionTrigger>Quality checks</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  Confirm targeting, metrics, and page URLs before launch. Accordion
                  chrome stays neutral so status banners remain the colour signal.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="notes">
                <AccordionTrigger>Internal notes</AccordionTrigger>
                <AccordionContent>
                  <Textarea placeholder="Add a note for your team…" />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost">
                    Discard draft
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clears local form state only</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline">
                Save draft
              </Button>
              <Button type="button">Publish campaign</Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input states</CardTitle>
            <CardDescription>
              Default, focus, disabled, and filled — useful when tuning Inputs.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Default" htmlFor="lab-in-default">
              <Input id="lab-in-default" placeholder="Placeholder text" />
            </Field>
            <Field label="Filled" htmlFor="lab-in-filled">
              <Input id="lab-in-filled" defaultValue="Filled value" />
            </Field>
            <Field label="Disabled" htmlFor="lab-in-disabled">
              <Input id="lab-in-disabled" disabled defaultValue="Disabled" />
            </Field>
            <Field label="Read-only" htmlFor="lab-in-ro">
              <Input id="lab-in-ro" readOnly defaultValue="Read only" />
            </Field>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
