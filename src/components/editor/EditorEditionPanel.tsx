// Summary: Edition empty state keeps the original Wandz chat zero state.
// With a selection, the element editor stays in this panel; Wandz opens as a float on the canvas.
import { useEffect, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ChevronRight,
  Columns2,
  Copy,
  Eye,
  EyeOff,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Mic,
  Minus,
  MoreVertical,
  Plus,
  RotateCcw,
  Rows2,
  Strikethrough,
  Sparkles,
  Underline,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EditorIcon } from "./EditorIcon";
import { EditorFloatablePanel } from "./EditorFloatablePanel";
import aiSparkle from "@/assets/editor/ai-sparkle.svg";
import send from "@/assets/editor/send.svg";
import paletteSm from "@/assets/editor/palette-sm.svg";
import move from "@/assets/editor/move.svg";
import type {
  EditorPanelChrome,
  EditorPanelGroupDragHandlers,
} from "./EditorFloatablePanel";
import type {
  EditionTabId,
  EditorSelection,
} from "@/config/editorScenarios";

type EditionTab = EditionTabId;
type AlignId = "left" | "center" | "right" | "justify";
type FlowId = "row" | "column" | "row-reverse" | "column-reverse";

function FieldLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("text-xs font-medium text-muted-foreground", className)}>
      {children}
    </span>
  );
}

function FieldInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        "h-7 rounded px-2 text-xs shadow-none focus-visible:ring-1",
        className
      )}
      {...props}
    />
  );
}

function IconToggle({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md text-foreground outline-none transition-colors",
        active ? "bg-accent" : "hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

function SideBox({
  values,
  onChange,
}: {
  values: { top: string; right: string; bottom: string; left: string };
  onChange: (next: typeof values) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid flex-1 grid-cols-2 gap-1.5">
        {(
          [
            ["top", "Top"],
            ["bottom", "Bottom"],
            ["left", "Left"],
            ["right", "Right"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1">
            <FieldLabel>{label}</FieldLabel>
            <FieldInput
              value={values[key]}
              onChange={(e) => onChange({ ...values, [key]: e.target.value })}
              className="min-w-0 flex-1"
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        aria-label="Link all sides"
      >
        <Link2 className="size-3.5" strokeWidth={1.75} />
      </Button>
    </div>
  );
}

function ColorField({
  swatchClass,
  hex,
  opacity,
}: {
  swatchClass: string;
  hex: string;
  opacity: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "size-5 shrink-0 rounded border border-border",
          swatchClass
        )}
        aria-hidden
      />
      <FieldInput defaultValue={hex} className="min-w-0 flex-1 font-mono" />
      <FieldInput defaultValue={opacity} className="w-14 shrink-0" />
    </div>
  );
}

function StylesTab() {
  const [absolute, setAbsolute] = useState(false);
  const [flow, setFlow] = useState<FlowId>("column");
  const [align, setAlign] = useState<AlignId>("left");
  const [opacity, setOpacity] = useState([26]);
  const [visible, setVisible] = useState(true);
  const [content, setContent] = useState(
    "Optimize digital experiences & maximize conversions"
  );
  const [margin, setMargin] = useState({
    top: "2 px",
    right: "2 px",
    bottom: "2 px",
    left: "2 px",
  });
  const [padding, setPadding] = useState({
    top: "2 px",
    right: "2 px",
    bottom: "2 px",
    left: "2 px",
  });
  const [cssRows, setCssRows] = useState([{ name: "display", value: "flex" }]);
  const [alignCell, setAlignCell] = useState(0);
  const [formatActive, setFormatActive] = useState<string[]>(["bold"]);

  const formatTools = [
    { id: "bold", icon: Bold, label: "Bold" },
    { id: "italic", icon: Italic, label: "Italic" },
    { id: "underline", icon: Underline, label: "Underline" },
    { id: "strike", icon: Strikethrough, label: "Strikethrough" },
    { id: "link", icon: Link2, label: "Link" },
    { id: "ul", icon: List, label: "Bulleted list" },
    { id: "ol", icon: ListOrdered, label: "Numbered list" },
  ] as const;

  const flows: { id: FlowId; icon: typeof Rows2; label: string }[] = [
    { id: "row", icon: Columns2, label: "Row" },
    { id: "column", icon: Rows2, label: "Column" },
    { id: "row-reverse", icon: Columns2, label: "Row reverse" },
    { id: "column-reverse", icon: Rows2, label: "Column reverse" },
  ];

  const textAligns: { id: AlignId; icon: typeof AlignLeft; label: string }[] = [
    { id: "left", icon: AlignLeft, label: "Align left" },
    { id: "center", icon: AlignCenter, label: "Align center" },
    { id: "right", icon: AlignRight, label: "Align right" },
    { id: "justify", icon: AlignJustify, label: "Justify" },
  ];

  return (
    <Accordion
      type="multiple"
      defaultValue={[
        "content",
        "position",
        "layout",
        "appearance",
        "typography",
        "background",
        "border",
        "css",
      ]}
      className="w-full"
    >
      <AccordionItem value="content" className="border-border px-3">
        <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
          Content
        </AccordionTrigger>
        <AccordionContent className="pb-3">
          <FieldLabel>Text</FieldLabel>
          <div className="mt-1.5 mb-2 flex flex-wrap gap-0.5 rounded-md border border-border p-0.5">
            {formatTools.map((t) => (
              <IconToggle
                key={t.id}
                label={t.label}
                active={formatActive.includes(t.id)}
                onClick={() =>
                  setFormatActive((prev) =>
                    prev.includes(t.id)
                      ? prev.filter((id) => id !== t.id)
                      : [...prev, t.id]
                  )
                }
              >
                <t.icon className="size-3.5" strokeWidth={1.75} />
              </IconToggle>
            ))}
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[72px] resize-none text-xs shadow-none"
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="position" className="border-border px-3">
        <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
          Position
        </AccordionTrigger>
        <AccordionContent className="space-y-2.5 pb-3">
          <label className="flex items-center justify-end gap-2 text-xs text-foreground">
            Absolute
            <Checkbox
              checked={absolute}
              onCheckedChange={(v) => setAbsolute(v === true)}
            />
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                ["X", "560"],
                ["Y", "320"],
                ["Z", "1"],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="space-y-1">
                <FieldLabel>{label}</FieldLabel>
                <FieldInput defaultValue={value} />
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <FieldLabel>Rotate</FieldLabel>
            <div className="flex items-center gap-1">
              <FieldInput defaultValue="0°" className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label="Reset rotation"
              >
                <RotateCcw className="size-3.5" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="layout" className="border-border px-3">
        <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
          Layout
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-3">
          <div className="space-y-1.5">
            <FieldLabel>Flow</FieldLabel>
            <div className="flex gap-0.5 rounded-md border border-border p-0.5">
              {flows.map((f) => (
                <IconToggle
                  key={f.id}
                  label={f.label}
                  active={flow === f.id}
                  onClick={() => setFlow(f.id)}
                >
                  <f.icon
                    className={cn(
                      "size-3.5",
                      (f.id === "row-reverse" || f.id === "column-reverse") &&
                        "scale-x-[-1]"
                    )}
                    strokeWidth={1.75}
                  />
                </IconToggle>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <FieldLabel>Alignment</FieldLabel>
            <div className="grid w-fit grid-cols-3 gap-1 rounded-md border border-border p-1.5">
              {Array.from({ length: 9 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Align cell ${i + 1}`}
                  onClick={() => setAlignCell(i)}
                  className={cn(
                    "size-2 rounded-full outline-none",
                    alignCell === i ? "bg-foreground" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <FieldLabel>Gap</FieldLabel>
            <FieldInput defaultValue="20 px" />
          </div>

          <div className="space-y-1.5">
            <FieldLabel>Dimensions</FieldLabel>
            <div className="flex items-center gap-1.5">
              <FieldInput defaultValue="560 px" className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                aria-label="Unlink dimensions"
              >
                <Link2Off className="size-3.5" strokeWidth={1.75} />
              </Button>
              <FieldInput defaultValue="320 px" className="flex-1" />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-0.5 text-xs font-medium text-foreground underline-offset-2 hover:underline"
            >
              More options
              <ChevronDown className="size-3.5 -rotate-90 text-muted-foreground" strokeWidth={1.75} />
            </button>
          </div>

          <div className="space-y-1.5">
            <FieldLabel>Margin</FieldLabel>
            <SideBox values={margin} onChange={setMargin} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Padding</FieldLabel>
            <SideBox values={padding} onChange={setPadding} />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="appearance" className="border-border px-3">
        <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
          Appearance
        </AccordionTrigger>
        <AccordionContent className="space-y-3 pb-3">
          <div className="space-y-1.5">
            <FieldLabel>Opacity</FieldLabel>
            <div className="flex items-center gap-2">
              <Slider
                value={opacity}
                onValueChange={setOpacity}
                max={100}
                step={1}
                className="flex-1"
              />
              <FieldInput
                value={`${opacity[0]}%`}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (!Number.isNaN(n)) setOpacity([Math.min(100, Math.max(0, n))]);
                }}
                className="w-14"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Visibility</FieldLabel>
            <div className="flex gap-0.5 rounded-md border border-border p-0.5 w-fit">
              <IconToggle
                label="Visible"
                active={visible}
                onClick={() => setVisible(true)}
              >
                <Eye className="size-3.5" strokeWidth={1.75} />
              </IconToggle>
              <IconToggle
                label="Hidden"
                active={!visible}
                onClick={() => setVisible(false)}
              >
                <EyeOff className="size-3.5" strokeWidth={1.75} />
              </IconToggle>
            </div>
          </div>
          <div className="space-y-1">
            <FieldLabel>Corner Radius</FieldLabel>
            <div className="flex items-center gap-1">
              <FieldInput defaultValue="2 px" className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label="Individual corners"
              >
                <Link2Off className="size-3.5" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="typography" className="border-border px-3">
        <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
          Typography
        </AccordionTrigger>
        <AccordionContent className="space-y-2.5 pb-3">
          <div className="space-y-1">
            <FieldLabel>Family</FieldLabel>
            <Select defaultValue="inherited">
              <SelectTrigger className="h-7 text-xs shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inherited">Inherited from parent</SelectItem>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="system">System UI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <FieldLabel>Color</FieldLabel>
            <ColorField swatchClass="bg-foreground" hex="#000000" opacity="100%" />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="space-y-1">
              <FieldLabel>Size</FieldLabel>
              <FieldInput defaultValue="16 px" />
            </div>
            <div className="space-y-1">
              <FieldLabel>Weight</FieldLabel>
              <Select defaultValue="400">
                <SelectTrigger className="h-7 text-xs shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="400">400 - Regular</SelectItem>
                  <SelectItem value="500">500 - Medium</SelectItem>
                  <SelectItem value="600">600 - Semibold</SelectItem>
                  <SelectItem value="700">700 - Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Align</FieldLabel>
            <div className="flex w-fit gap-0.5 rounded-md border border-border p-0.5">
              {textAligns.map((a) => (
                <IconToggle
                  key={a.id}
                  label={a.label}
                  active={align === a.id}
                  onClick={() => setAlign(a.id)}
                >
                  <a.icon className="size-3.5" strokeWidth={1.75} />
                </IconToggle>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="space-y-1">
              <FieldLabel>Line height</FieldLabel>
              <FieldInput defaultValue="140 %" />
            </div>
            <div className="space-y-1">
              <FieldLabel>Transform</FieldLabel>
              <Select defaultValue="none">
                <SelectTrigger className="h-7 text-xs shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="uppercase">Uppercase</SelectItem>
                  <SelectItem value="lowercase">Lowercase</SelectItem>
                  <SelectItem value="capitalize">Capitalize</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="background" className="border-border px-3">
        <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
          Background
        </AccordionTrigger>
        <AccordionContent className="space-y-2.5 pb-3">
          <div className="flex w-fit gap-0.5 rounded-md border border-border p-0.5">
            <IconToggle label="Solid" active>
              <span className="size-3.5 rounded-sm border border-foreground bg-muted" />
            </IconToggle>
            <IconToggle label="Gradient">
              <span className="size-3.5 rounded-sm bg-gradient-to-br from-foreground/80 to-muted" />
            </IconToggle>
            <IconToggle label="Image">
              <span className="size-3.5 rounded-sm border border-dashed border-foreground/40" />
            </IconToggle>
          </div>
          <div className="space-y-1">
            <FieldLabel>Color</FieldLabel>
            <ColorField swatchClass="bg-background" hex="#FFFFFF" opacity="26%" />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="border" className="border-border px-3">
        <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
          Border
        </AccordionTrigger>
        <AccordionContent className="space-y-2.5 pb-3">
          <div className="space-y-1">
            <FieldLabel>Style</FieldLabel>
            <Select defaultValue="solid">
              <SelectTrigger className="h-7 text-xs shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <FieldLabel>Color</FieldLabel>
            <ColorField swatchClass="bg-foreground" hex="#000000" opacity="100%" />
          </div>
          <div className="space-y-1">
            <FieldLabel>Width</FieldLabel>
            <div className="flex items-center gap-1">
              <FieldInput defaultValue="2 px" className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label="Border sides"
              >
                <Link2Off className="size-3.5" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="shadow" className="border-border px-3">
        <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
          Shadow and Effects
        </AccordionTrigger>
        <AccordionContent className="pb-3 text-xs text-muted-foreground">
          No effects applied.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="css" className="border-border px-3">
        <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
          CSS properties
        </AccordionTrigger>
        <AccordionContent className="space-y-2 pb-3">
          <div className="flex items-center gap-1 px-0.5">
            <FieldLabel className="flex-1">Property Name</FieldLabel>
            <FieldLabel className="flex-1">Value</FieldLabel>
            <span className="size-7 shrink-0" aria-hidden />
          </div>
          {cssRows.map((row, i) => (
            <div key={`${row.name}-${i}`} className="flex items-center gap-1">
              <FieldInput
                value={row.name}
                onChange={(e) => {
                  const next = [...cssRows];
                  next[i] = { ...row, name: e.target.value };
                  setCssRows(next);
                }}
                className="flex-1"
                placeholder="Property"
              />
              <FieldInput
                value={row.value}
                onChange={(e) => {
                  const next = [...cssRows];
                  next[i] = { ...row, value: e.target.value };
                  setCssRows(next);
                }}
                className="flex-1"
                placeholder="Value"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                aria-label="Remove property"
                onClick={() => setCssRows(cssRows.filter((_, j) => j !== i))}
              >
                <Minus className="size-3.5" strokeWidth={1.75} />
              </Button>
            </div>
          ))}
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold text-foreground"
            onClick={() => setCssRows([...cssRows, { name: "", value: "" }])}
          >
            <Plus className="size-3.5" strokeWidth={1.75} />
            Add property
          </button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function AttributesTab() {
  const [classes, setClasses] = useState(["heading-title"]);
  const [custom, setCustom] = useState([{ name: "", value: "" }]);

  return (
    <Accordion
      type="multiple"
      defaultValue={["standard", "custom"]}
      className="w-full"
    >
      <AccordionItem value="standard" className="border-border px-3">
        <AccordionTrigger className="py-2.5 text-[10px] font-semibold tracking-wide text-muted-foreground hover:no-underline">
          STANDARD
        </AccordionTrigger>
        <AccordionContent className="space-y-2.5 pb-3">
          <div className="space-y-1">
            <FieldLabel>ID</FieldLabel>
            <FieldInput placeholder="Value" />
          </div>
          <div className="space-y-1">
            <FieldLabel>Class</FieldLabel>
            <div className="flex min-h-9 flex-wrap gap-1 rounded-md border border-border bg-background p-1.5">
              {classes.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground"
                >
                  {c}
                  <button
                    type="button"
                    aria-label={`Remove ${c}`}
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      setClasses((prev) => prev.filter((x) => x !== c))
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <FieldLabel>Title</FieldLabel>
            <FieldInput placeholder="Value" />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="custom" className="border-border px-3">
        <AccordionTrigger className="py-2.5 text-[10px] font-semibold tracking-wide text-muted-foreground hover:no-underline">
          CUSTOM
        </AccordionTrigger>
        <AccordionContent className="space-y-2 pb-3">
          {custom.map((row, i) => (
            <div key={i} className="flex items-center gap-1">
              <FieldInput
                placeholder="Name"
                value={row.name}
                onChange={(e) => {
                  const next = [...custom];
                  next[i] = { ...row, name: e.target.value };
                  setCustom(next);
                }}
                className="flex-1"
              />
              <FieldInput
                placeholder="Value"
                value={row.value}
                onChange={(e) => {
                  const next = [...custom];
                  next[i] = { ...row, value: e.target.value };
                  setCustom(next);
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                aria-label="Remove attribute"
                onClick={() => setCustom(custom.filter((_, j) => j !== i))}
              >
                <Minus className="size-3.5" strokeWidth={1.75} />
              </Button>
            </div>
          ))}
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold text-foreground"
            onClick={() => setCustom([...custom, { name: "", value: "" }])}
          >
            <Plus className="size-3.5" strokeWidth={1.75} />
            Add attribute
          </button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function TrackingTab() {
  return (
    <div className="space-y-3 px-3 py-3">
      <p className="text-xs text-muted-foreground">
        Track clicks and impressions on this element.
      </p>
      <label className="flex items-center gap-2 text-xs text-foreground">
        <Checkbox defaultChecked={false} />
        Track clicks
      </label>
      <label className="flex items-center gap-2 text-xs text-foreground">
        <Checkbox defaultChecked={false} />
        Track impressions
      </label>
      <div className="space-y-1">
        <FieldLabel>Metric name</FieldLabel>
        <FieldInput placeholder="e.g. Headline clicks" />
      </div>
    </div>
  );
}

const WANDZ_ZERO_SUGGESTIONS: { icon: string; label: string }[] = [
  { icon: paletteSm, label: "Make the headline text larger" },
  { icon: move, label: "Move the image to the left" },
  { icon: paletteSm, label: "Change the button color to green" },
];

/** Original Wandz chat zero state — shown when no element is selected. */
function EditionEmptyState() {
  const [draft, setDraft] = useState("");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 pt-3">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-semibold text-foreground outline-none"
        >
          New chat
          <ChevronDown
            className="size-4 text-muted-foreground"
            strokeWidth={1.75}
          />
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 rounded-md"
          aria-label="Chat options"
        >
          <MoreVertical className="size-3.5" strokeWidth={1.75} />
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-28 pt-16">
        <div className="mb-5 flex size-[50px] items-center justify-center rounded-full bg-muted">
          <EditorIcon src={aiSparkle} size={24} />
        </div>
        <div className="mb-12 flex w-full flex-col items-center gap-2 text-center">
          <p className="text-sm font-semibold text-foreground">
            Hi! How can I help you today?
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            Quickly modify your variation using natural language - just type or
            speak your commands.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 px-3">
          <p className="text-xs text-muted-foreground">
            Try asking something like:
          </p>
          {WANDZ_ZERO_SUGGESTIONS.map((s) => (
            <Button
              key={s.label}
              type="button"
              variant="outline"
              size="sm"
              className="h-[26px] justify-start gap-2 rounded-md px-2 text-xs font-medium shadow-none"
              onClick={() => setDraft(s.label)}
            >
              <EditorIcon
                src={s.icon}
                size={14}
                className="text-muted-foreground"
              />
              {s.label}
            </Button>
          ))}
          <button
            type="button"
            className="inline-flex h-[26px] items-center gap-1.5 px-1 text-xs font-semibold text-foreground outline-none hover:underline"
          >
            <EditorIcon src={aiSparkle} size={13} />
            See how VWO AI can help you
            <ChevronRight className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-3">
        <div className="relative flex h-24 items-end justify-between overflow-hidden rounded-lg border border-border bg-background p-3 shadow-none transition-colors focus-within:border-input">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask anything....."
            className="absolute inset-x-3 bottom-10 top-3 resize-none bg-transparent text-[13px] leading-5 text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative z-10 size-7 rounded-md"
            aria-label="Attach"
          >
            <Plus className="size-[18px]" strokeWidth={1.75} />
          </Button>
          <div className="relative z-10 flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded-md"
              aria-label="Voice input"
            >
              <Mic className="size-4" strokeWidth={1.75} />
            </Button>
            <Button
              type="button"
              size="icon"
              className="size-7 rounded-md shadow-none"
              aria-label="Send"
            >
              <EditorIcon src={send} size={15} />
            </Button>
          </div>
        </div>
        <p className="mt-1.5 whitespace-nowrap text-center text-[10.5px] leading-4 text-muted-foreground">
          AI can make mistakes. Please verify the information.
        </p>
      </div>
    </div>
  );
}

/** Edition inspector — Styles / Attributes / Tracking for the selected element.
 *  With no selection, the original Wandz chat zero state fills the panel.
 *  With selection, Wandz opens as a floating card near the element (not here).
 */
export function EditorEditionPanel({
  onClose,
  chrome,
  onChromeChange,
  onReattach,
  grouped,
  tabPane,
  groupDrag,
  selection = null,
  initialTab = "styles",
  onTabChange,
}: {
  onClose?: () => void;
  chrome: EditorPanelChrome;
  onChromeChange: (next: EditorPanelChrome) => void;
  onReattach?: () => void;
  grouped?: boolean;
  tabPane?: boolean;
  groupDrag?: EditorPanelGroupDragHandlers;
  selection?: EditorSelection | null;
  initialTab?: EditionTab;
  /** Persist active Styles / Attributes / Tracking tab to the editor store. */
  onTabChange?: (tab: EditionTab) => void;
}) {
  const [tab, setTab] = useState<EditionTab>(initialTab);
  const [toast, setToast] = useState<string | null>(null);

  const selectTab = (next: EditionTab) => {
    setTab(next);
    onTabChange?.(next);
  };

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const tabs: { id: EditionTab; label: string }[] = [
    { id: "styles", label: "Styles" },
    { id: "attributes", label: "Attributes" },
    { id: "tracking", label: "Tracking" },
  ];

  const hasSelection = Boolean(selection);

  return (
    <EditorFloatablePanel
      title={
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <span className="truncate">Edition</span>
          {/* Display-only for now — header click handled in a later pass. */}
          <Sparkles
            className="size-3.5 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
          />
        </span>
      }
      onClose={onClose}
      bodyClassName="min-h-0 overflow-hidden"
      chrome={chrome}
      onChromeChange={onChromeChange}
      onReattach={onReattach}
      grouped={grouped}
      tabPane={tabPane}
      groupDrag={groupDrag}
    >
      {!hasSelection ? (
        <EditionEmptyState />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 space-y-2 border-b border-border px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-foreground">
                {selection!.tag} {selection!.label}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 shrink-0 gap-1 px-2 text-xs font-semibold"
              >
                Edit Code
                <ChevronDown
                  className="size-3.5 text-muted-foreground"
                  strokeWidth={1.75}
                />
              </Button>
            </div>
            <div className="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5">
              <code className="truncate text-[11px] text-muted-foreground">
                {selection!.selector}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-5 shrink-0"
                aria-label="Copy selector"
                onClick={() => {
                  void (async () => {
                    try {
                      await navigator.clipboard.writeText(selection!.selector);
                      setToast("Selector copied");
                    } catch {
                      setToast("Couldn't copy selector");
                    }
                  })();
                }}
              >
                <Copy className="size-3" strokeWidth={1.75} />
              </Button>
            </div>
            <div className="flex gap-1 rounded-md border border-border bg-muted p-0.5">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectTab(t.id)}
                  className={cn(
                    "h-7 flex-1 rounded-[5px] text-xs font-semibold outline-none transition-colors",
                    tab === t.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto">
            {toast && (
              <div
                role="status"
                aria-live="polite"
                className="sticky top-2 z-10 mx-auto mb-2 w-fit rounded-md border border-border bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-md"
              >
                {toast}
              </div>
            )}
            {tab === "styles" && <StylesTab />}
            {tab === "attributes" && <AttributesTab />}
            {tab === "tracking" && <TrackingTab />}
          </div>
        </div>
      )}
    </EditorFloatablePanel>
  );
}
