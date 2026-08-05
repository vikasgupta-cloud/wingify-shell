import { useEffect, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Columns2,
  Copy,
  Eye,
  EyeOff,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Rows2,
  Strikethrough,
  Underline,
} from "lucide-react";
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
import { EditorFloatablePanel } from "./EditorFloatablePanel";
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

function EmptySelectionArt() {
  return (
    <svg
      viewBox="0 0 168 128"
      className="h-[104px] w-[136px] text-muted-foreground"
      fill="none"
      aria-hidden
    >
      <rect
        x="10"
        y="8"
        width="132"
        height="100"
        rx="10"
        className="fill-muted stroke-border"
        strokeWidth="1.25"
      />
      <rect
        x="10"
        y="8"
        width="132"
        height="22"
        rx="10"
        className="fill-muted"
      />
      <rect
        x="10"
        y="18"
        width="132"
        height="12"
        className="fill-muted"
      />
      <circle cx="24" cy="19" r="3" className="fill-border" />
      <circle cx="34" cy="19" r="3" className="fill-border" />
      <circle cx="44" cy="19" r="3" className="fill-border" />
      <rect
        x="22"
        y="40"
        width="52"
        height="8"
        rx="2"
        className="fill-border"
      />
      <rect
        x="22"
        y="54"
        width="72"
        height="5"
        rx="1.5"
        className="fill-border/80"
      />
      <rect
        x="22"
        y="64"
        width="60"
        height="5"
        rx="1.5"
        className="fill-border/80"
      />
      <rect
        x="22"
        y="80"
        width="40"
        height="16"
        rx="3"
        className="fill-border"
      />
      <rect
        x="78"
        y="36"
        width="48"
        height="40"
        rx="4"
        className="stroke-foreground/55"
        strokeWidth="1.5"
        strokeDasharray="3.5 2.5"
      />
      <path
        d="M118 86 L126 104 L122 104 L126 114 L120 114 L116 104 L112 104 Z"
        className="fill-foreground"
      />
      <path
        d="M132 92 L136 88 L140 92 L136 96 Z M136 82 V88 M136 96 V100 M128 92 H132 M140 92 H144"
        className="stroke-foreground"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EditionEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <EmptySelectionArt />
      <div className="space-y-2">
        <p className="text-[15px] font-semibold leading-snug text-foreground">
          Select an element on page
        </p>
        <p className="max-w-[240px] text-xs leading-5 text-muted-foreground">
          Select any element to access its properties, adjust settings, and make
          changes as needed.
        </p>
      </div>
    </div>
  );
}

/** Edition inspector — Styles / Attributes / Tracking for the selected element. */
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
}) {
  const [tab, setTab] = useState<EditionTab>(initialTab);
  const [toast, setToast] = useState<string | null>(null);

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
      title="Edition"
      icon={<Pencil className="size-3.5 shrink-0" strokeWidth={1.75} />}
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
                  onClick={() => setTab(t.id)}
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
