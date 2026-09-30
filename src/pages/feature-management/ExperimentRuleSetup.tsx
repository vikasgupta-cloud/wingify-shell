import { useId, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Copy, Info } from '@/components/icons/protoLucide';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { FlagRule } from '@/data/featureFlagRules';

function Section({ label, heading, children }: { label?: string; heading: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <section className="space-y-2">
    {label && <p className="text-muted-foreground">{label}</p>}
    <Button variant="ghost" className="h-auto justify-start gap-1 p-0 font-normal hover:bg-transparent" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}{heading}
    </Button>
    {open && <div id={id} className="ml-5">{children}</div>}
  </section>;
}

export default function ExperimentRuleSetup({ rule, onCopy }: { rule: FlagRule; onCopy: (value: string) => void }) {
  const personalized = rule.type === 'Personalization';
  const setup = personalized ? rule.personalizationSetup : rule.testingSetup;
  const condition = setup?.audienceCondition;
  const variations = setup?.variations ?? [];
  const forced = variations.filter(variation => variation.userIds?.length);
  const automations = [...(rule.scheduledFor ? [`Schedule campaign · ${new Date(rule.scheduledFor).toLocaleString()}`] : []), ...(setup?.automations ?? [])];
  return <div className="flag-rule-summary mt-4 space-y-4 text-sm">
    <Section label="Audience" heading={rule.audience ?? 'All visitors'}>
      <div className="space-y-2 rounded-sm border border-border px-4 py-3">
        <p className="font-medium">All Visitors</p>
        {condition ? <><p className="text-muted-foreground">where</p><p className="flex flex-wrap gap-2"><strong className="font-medium">{condition.attribute}</strong><span className="text-muted-foreground">{condition.operator}</span><span>{condition.value}</span></p></> : <p className="text-muted-foreground">No audience conditions configured.</p>}
      </div>
    </Section>
    <section className="space-y-1"><p className="text-muted-foreground">Traffic allocation</p><p>{rule.trafficAllocation ?? 100}%</p></section>
    <section className="space-y-1"><p className="text-muted-foreground">{personalized ? 'Variations served' : 'Traffic split & Variations served'}</p>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2">{variations.length ? variations.map((variation, index) => <span key={variation.name} className="inline-flex items-center gap-1">{variation.name}{variation.description && <Tooltip><TooltipTrigger asChild><button type="button" aria-label={`About ${variation.name}`} className="text-muted-foreground"><Info className="size-3.5" /></button></TooltipTrigger><TooltipContent>{variation.description}</TooltipContent></Tooltip>}{!personalized && 'traffic' in variation && ` (${variation.traffic}%)`}{index < variations.length - 1 && ','}</span>) : 'No variations configured.'}</div>
    </section>
    <Section heading={personalized ? "Advanced and other options" : "Advanced options"}><div className="space-y-3">
      <div><p className="mb-1 text-muted-foreground">Force users to variations</p>
        {forced.length ? <div className="overflow-x-auto rounded-sm border border-border"><table className="w-full text-left text-xs"><thead className="bg-canvas"><tr><th scope="col" className="px-4 py-2 font-medium">Variations</th><th scope="col" className="px-4 py-2 font-medium">User ID(s)</th></tr></thead><tbody>{forced.map(variation => <tr key={variation.name}><th scope="row" className="px-4 py-2 font-medium">{'assignmentLabel' in variation ? variation.assignmentLabel : variation.name}</th><td className="px-4 py-2"><div className="flex flex-wrap gap-2">{variation.userIds!.map(id => <Badge key={id} variant="outline" className="rounded-sm">{id}</Badge>)}</div></td></tr>)}</tbody></table></div> : <p>No users assigned.</p>}
      </div>
      <div><p className="text-muted-foreground">Salt value</p><div className="flex items-center gap-2">{setup?.salt ?? 'Not configured'}{setup?.salt && <Button variant="ghost" size="icon" className="size-6" aria-label={`Copy salt for ${rule.name}`} onClick={() => onCopy(setup.salt!)}><Copy className="size-4" /></Button>}</div></div>
      <div><p className="text-muted-foreground">Automations</p><p>{automations.length ? automations.join(' · ') : 'No automations configured.'}</p></div>
      {personalized && <div><p className="text-muted-foreground">SmartStats Configurations</p><p>{rule.personalizationSetup?.smartStats?.length ? rule.personalizationSetup.smartStats.join(' · ') : 'Not configured'}</p></div>}
    </div></Section>
  </div>;
}
