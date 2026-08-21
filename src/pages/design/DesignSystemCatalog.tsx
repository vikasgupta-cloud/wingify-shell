import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "@/components/icons/protoLucide";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/ui/StatusBadge";
import BadgeMatrix from "./BadgeMatrix";
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
import CreatorAvatar from "@/components/ui/CreatorAvatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Slider } from "@/components/ui/slider";
import SplitSaveButton from "@/components/ui/SplitSaveButton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { AddTag, Tag } from "@/components/ui/tag";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function Block({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-background p-6">
      <div>
        <h3 className="font-title text-base font-semibold text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemCatalog() {
  const [slider, setSlider] = useState([40]);
  const [on, setOn] = useState(true);

  return (
    <div className="space-y-8">
      <Block
        title="Buttons"
        description="Default (stroke), inverted fill, secondary fill, shadow, danger, and link."
      >
        <div className="flex flex-wrap gap-2">
          <Button type="button">Default Button</Button>
          <Button type="button" variant="inverted">
            Default Inverted Button
          </Button>
          <Button type="button" variant="secondary">
            Secondary Button
          </Button>
          <Button type="button" variant="shadow">
            Shadow Button
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="destructive">
            Danger Button
          </Button>
          <Button type="button" variant="destructiveInverted">
            Danger Inverted Button
          </Button>
          <Button type="button" variant="destructiveShadow">
            Danger Shadow Button
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" variant="link">
            Upload file
          </Button>
          <Button type="button" disabled>
            Disabled
          </Button>
          <SplitSaveButton
            existingLabel="Homepage CTA"
            onSaveExisting={() => undefined}
            onSaveAsNew={() => undefined}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm">
            Small
          </Button>
          <Button type="button" size="lg">
            Large
          </Button>
          <Button type="button" size="icon" aria-label="Info">
            <Info className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </Block>

      <Block
        title="Inputs"
        description="Text, filled, textarea, and select — same control height as campaign setup."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ds-input">Text</Label>
            <Input id="ds-input" placeholder="Placeholder" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ds-filled">Filled</Label>
            <Input id="ds-filled" defaultValue="Homepage CTA test" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ds-area">Textarea</Label>
            <Textarea id="ds-area" rows={3} defaultValue="Hypothesis copy." />
          </div>
          <div className="space-y-2">
            <Label>Select</Label>
            <Select defaultValue="prod">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prod">Production</SelectItem>
                <SelectItem value="stage">Staging</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Block>

      <Block
        title="Choice controls"
        description="Radio, checkbox, switch, and slider."
      >
        <div className="flex flex-wrap items-center gap-8">
          <RadioGroup defaultValue="a" className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="a" id="ds-ra" />
              <Label htmlFor="ds-ra">Variation A</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="b" id="ds-rb" />
              <Label htmlFor="ds-rb">Variation B</Label>
            </div>
          </RadioGroup>
          <div className="flex items-center gap-2">
            <Checkbox id="ds-cb" defaultChecked />
            <Label htmlFor="ds-cb">Checkbox 1</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="ds-cb-off" />
            <Label htmlFor="ds-cb-off">Checkbox 1</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={on} onCheckedChange={setOn} />
            <Label>Notifications</Label>
          </div>
        </div>
        <div className="mt-4 max-w-sm space-y-2">
          <Label>Traffic {slider[0]}%</Label>
          <Slider value={slider} onValueChange={setSlider} max={100} />
        </div>
      </Block>

      <Block
        title="Badges"
        description="Pill badges: eight tones, light or solid fill, three sizes, and layouts from text-only through avatar. Status stays on semantic tokens."
      >
        <BadgeMatrix />
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge>Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Tag label="checkout" swatch={1} />
          <Tag label="q3-roadmap" swatch={4} onRemove={() => undefined} />
          <AddTag onClick={() => undefined} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge status="Draft" />
          <StatusBadge status="In QA" />
          <StatusBadge status="Ready to launch" />
          <StatusBadge status="Running" />
          <StatusBadge status="In Analysis" />
          <StatusBadge status="Paused" />
          <StatusBadge status="Ended" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-success-bg px-2.5 py-0.5 text-xs font-medium text-success-fg">
            <CheckCircle2 className="size-3.5" strokeWidth={1.75} />
            Success
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-danger-bg px-2.5 py-0.5 text-xs font-medium text-danger-fg">
            <AlertCircle className="size-3.5" strokeWidth={1.75} />
            Error
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-warning-bg px-2.5 py-0.5 text-xs font-medium text-warning-fg">
            <AlertTriangle className="size-3.5" strokeWidth={1.75} />
            Warning
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-info-bg px-2.5 py-0.5 text-xs font-medium text-info-fg">
            <Info className="size-3.5" strokeWidth={1.75} />
            Info
          </span>
        </div>
      </Block>

      <Block
        title="Navigation chrome"
        description="Pill tabs, underline tabs, and accordion."
      >
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Pill</TabsTrigger>
            <TabsTrigger value="b">Audience</TabsTrigger>
            <TabsTrigger value="c" disabled>
              Disabled
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs defaultValue="a" className="mt-4">
          <TabsList variant="underline">
            <TabsTrigger value="a">Underline</TabsTrigger>
            <TabsTrigger value="b">Reports</TabsTrigger>
          </TabsList>
        </Tabs>
        <Accordion type="single" collapsible className="mt-4 max-w-lg">
          <AccordionItem value="one">
            <AccordionTrigger>Quality checks</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Targeting, metrics, and URLs before launch.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Block>

      <Block
        title="Overlays"
        description="Dialog, sheet, popover, menu, and tooltip."
      >
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Dialog
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pause campaign</DialogTitle>
                <DialogDescription>
                  Traffic stops immediately. You can resume from the listing.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="button">Pause</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="outline">
                Sheet
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Side panel used for pickers and detail.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline">
                Popover
              </Button>
            </PopoverTrigger>
            <PopoverContent className="text-sm text-muted-foreground">
              Compact surface for date, menu, and pickers.
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline">
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost">
                  Tooltip
                </Button>
              </TooltipTrigger>
              <TooltipContent>Helper copy on hover</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Block>

      <Block
        title="Card & people"
        description="Grouped surface plus creator avatars."
      >
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Campaign card</CardTitle>
            <CardDescription>Surface for grouped content.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <CreatorAvatar name="John Doe" />
            <CreatorAvatar name="Alex Chen" />
            <span className="text-sm text-muted-foreground">Owners</span>
          </CardContent>
          <CardFooter className="border-t border-border">
            <Button type="button" size="sm">
              Open
            </Button>
          </CardFooter>
        </Card>
      </Block>
    </div>
  );
}
