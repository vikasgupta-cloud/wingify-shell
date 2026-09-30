import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Clock, TrendingUp, Copy, CheckCircle2 } from '@/components/icons/protoLucide';
import { isGradualRollout, type FlagRule } from '@/data/featureFlagRules';

function SetupSection({ label, heading, children }: { label?: string; heading: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <section className="space-y-1">
    {label && <p className="text-muted-foreground">{label}</p>}
    <Button variant="ghost" className="h-auto justify-start gap-1 p-0 font-normal hover:bg-transparent" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}{heading}</Button>
    {open && <div className="ml-5">{children}</div>}
  </section>;
}

export default function RolloutRuleSetup({ rule, onCopy }: { rule: FlagRule; onCopy: (value: string) => void }) {
  const setup = rule.rolloutSetup;
  const gradual = isGradualRollout(rule);
  const conditions = setup?.metricConditions ?? [];
  return <div className="flag-rule-summary mt-3 space-y-4 text-sm">
    <SetupSection label="Audience" heading={rule.audience ?? 'All visitors'}>
      <Card className="rounded-sm shadow-none"><CardContent className="space-y-2 px-4 py-3">
        <p className="font-medium">All Visitors</p>
        {setup?.audienceCondition ? <><p className="text-muted-foreground">where</p><p className="flex flex-wrap gap-2"><strong className="font-medium">{setup.audienceCondition.attribute}</strong><span className="text-muted-foreground">{setup.audienceCondition.operator}</span><span>{setup.audienceCondition.value}</span></p></> : <p className="text-muted-foreground">{rule.audience && rule.audience !== 'All visitors' ? 'No audience conditions configured.' : 'No audience conditions applied.'}</p>}
      </CardContent></Card>
    </SetupSection>
    <SetupSection label="Traffic allocation" heading={<span>Current value – <strong className="text-[var(--success-fg)]">{rule.trafficAllocation ?? 100}%</strong>{gradual && ' · Gradual'}</span>}>
      <Card className="rounded-sm shadow-none"><CardContent className="space-y-3 px-4 py-3">
        {gradual ? <><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-4" />Control exposure in time based increments</p><ol className="ml-5 space-y-3">{rule.rolloutSteps!.map((step,index) => <li key={index} className="flex flex-wrap items-center gap-2"><Badge tone="neutral" size="sm">{index+1}</Badge><span>{step.afterDays === 0 ? 'At launch' : `After ${step.afterDays} days`}</span><span className="text-muted-foreground">set Rollout % to</span><strong className="font-medium">{step.trafficAllocation}%</strong></li>)}</ol></> : <p>{rule.trafficAllocation ?? 100}% of qualifying visitors receive the rollout experience.</p>}
        {!!conditions.length && <>
          {gradual && <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="flex-1 border-t border-dashed border-border" />OR<span className="flex-1 border-t border-dashed border-border" /></div>}
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><TrendingUp className="size-4" />Control exposure based on metric performance: any of the following conditions</p>
          <div className="ml-5 space-y-2">{conditions.map((condition,index) => <Card key={index} className="w-fit max-w-full rounded-sm shadow-none"><CardContent className="space-y-2 px-3 py-2"><p><span className="text-muted-foreground">For </span>{condition.metric}<span className="text-muted-foreground">, when conversion rate is </span>&gt; {condition.conversionRate}%<span className="text-muted-foreground"> after </span>{condition.visitors}</p><div className="flex flex-wrap items-center gap-2"><span><span className="text-muted-foreground">visitors change </span>Rollout %<span className="text-muted-foreground"> to </span>{condition.trafficAllocation}%</span>{condition.trafficAllocation === rule.trafficAllocation && <Badge tone="green" size="sm">Current value</Badge>}</div></CardContent></Card>)}</div>
        </>}
      </CardContent></Card>
    </SetupSection>
    <SetupSection heading={<span className="text-muted-foreground">Advanced options</span>}>
      <div className="space-y-3">
        <div><p className="mb-1 text-muted-foreground">Force users to variations</p><div className="overflow-x-auto rounded-sm border border-border"><table className="w-full text-left text-xs"><thead><tr className="bg-canvas"><th className="px-4 py-2 font-medium">Rollout experience</th><th className="px-3 py-2 font-medium">User ID(s)</th></tr></thead><tbody>{[['Users who get the experience', setup?.includedUsers ?? []], ['Users who don’t get the experience', setup?.excludedUsers ?? []]].map(([label, ids]) => <tr key={label as string}><th className="px-4 py-2 font-medium">{label}</th><td className="px-3 py-2"><div className="flex flex-wrap gap-2">{(ids as string[]).length ? (ids as string[]).map(id => <Badge key={id} variant="outline" className="rounded-sm">{id}</Badge>) : <span className="text-muted-foreground">None configured</span>}</div></td></tr>)}</tbody></table></div></div>
        <div><p className="text-muted-foreground">Salt value</p><div className="flex items-center gap-2">{setup?.salt ?? 'Not configured'}{setup?.salt && <Button variant="ghost" size="icon" className="size-6" aria-label={`Copy salt for ${rule.name}`} onClick={() => onCopy(setup.salt!)}><Copy className="size-4" /></Button>}</div></div>
        <div><p className="text-muted-foreground">Automations</p>{rule.scheduledFor ? <p className="flex items-center gap-2"><CheckCircle2 className="size-4" />Schedule campaign · {new Date(rule.scheduledFor).toLocaleString()}</p> : <p>No automations configured.</p>}</div>
      </div>
    </SetupSection>
  </div>;
}
