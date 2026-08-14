import { useState } from "react";
import { HelpCircle, MoreVertical, RotateCcw } from "@/components/icons/protoLucide";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { useConfigStore } from "@/store/config";
import { OLD_STEPS } from "./oldFlow";

export default function PagesStep() {
  const { entityId = "" } = useParams();
  const config = useConfigStore((s) => s.configs[entityId]);
  const patch = useConfigStore((s) => s.patch);
  const [mode, setMode] = useState<"include" | "exclude">("include");
  const url = config?.pageGroups[0]?.rules[0]?.value ?? "";

  const setUrl = (value: string) => {
    if (!config) return;
    const groups = config.pageGroups.map((g, i) =>
      i === 0
        ? {
            ...g,
            kind: mode,
            rules: g.rules.map((r, ri) => (ri === 0 ? { ...r, value } : r)),
          }
        : g
    );
    patch(entityId, { pageGroups: groups });
  };

  const setKind = (next: "include" | "exclude") => {
    setMode(next);
    if (!config) return;
    const groups = config.pageGroups.map((g, i) =>
      i === 0 ? { ...g, kind: next } : g
    );
    patch(entityId, { pageGroups: groups });
  };

  const meta = OLD_STEPS[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-title flex items-center gap-2 text-2xl font-semibold text-foreground">
            {meta.label}
            <HelpCircle className="size-4 text-muted-foreground" />
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled>
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>

      <Tabs defaultValue="configure">
        <TabsList>
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="copilot">Copilot</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4 rounded-lg border border-border bg-background p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Include pages where</p>
          <Button type="button" variant="ghost" size="sm">
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
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
          />
          <Button type="button" variant="ghost" size="icon" aria-label="More">
            <MoreVertical />
          </Button>
        </div>
        <RadioGroup
          value={mode}
          onValueChange={(v) => setKind(v as "include" | "exclude")}
          className="flex gap-6"
        >
          <label htmlFor="include-pages" className="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem id="include-pages" value="include" />
            Include pages
          </label>
          <label htmlFor="exclude-pages" className="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem id="exclude-pages" value="exclude" />
            Exclude pages
          </label>
        </RadioGroup>
      </div>

      <Accordion type="single" collapsible>
        <AccordionItem value="validator" className="rounded-lg border border-border px-4">
          <AccordionTrigger className="text-sm">URL Validator</AccordionTrigger>
          <AccordionContent>
            <Label htmlFor="validate-url" className="sr-only">
              URL to validate
            </Label>
            <Input id="validate-url" placeholder="Paste a URL to check against these rules" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
