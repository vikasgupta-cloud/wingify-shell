import './FeatureFlagRules.css';
import RolloutRuleSetup from './RolloutRuleSetup';
import ExperimentRuleSetup from './ExperimentRuleSetup';
import { ComingSoonIllustration } from '@/components/empty/ComingSoonState';
import FeatureFlagReports from "./FeatureFlagReports";
import { useFlagDetailPreferences } from '@/store/flagDetailPreferences';
import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, LayoutGrid, Copy, Plus, Pencil, Trash2, ChevronDown, ChevronUp, ArrowRight, FlaskConical, UserRound, GripVertical, MoreHorizontal, Info, AlertTriangle, BarChart3 } from '@/components/icons/protoLucide';
import { FLAG_ENVIRONMENTS, ruleStatus, ruleStatusHint, ruleStatusLabel, hasRuleReport, isGradualRollout, type FlagEnvironment, type FlagRule, type RuleStatus } from '@/data/featureFlagRules';
import { useFlagRulesStore } from '@/store/flagRules';
import { useFlagEnvironmentsStore } from '@/store/flagEnvironments';
import { useVisibleFeatureFlags } from '@/store/flagRows';

const tones: Record<RuleStatus, BadgeTone> = { Active: 'green', Inactive: 'amber', Draft: 'neutral', Paused: 'amber', Scheduled: 'berry', Completed: 'neutral' };
const accent = 'text-[var(--link)]';

export default function FeatureFlagDetail() {
  const { entityId = '' } = useParams();
  const flag = useVisibleFeatureFlags().find(item => item.id === entityId);
  if (!flag) return <div className="p-10"><h1 className="text-xl font-semibold">Feature flag not found</h1><Button asChild variant="link"><Link to="/feature-management/feature-flags">Back to Feature Flags</Link></Button></div>;
  return <FlagDetailContent flagId={entityId} />;
}

function FlagDetailContent({ flagId }: { flagId: string }) {
  const { pathname } = useLocation();
  return pathname.endsWith('/reports') ? <FeatureFlagReports flagId={flagId} /> : <FlagWorkspace key={flagId} flagId={flagId} />;
}

function FlagWorkspace({ flagId }: { flagId: string }) {
  const { pathname } = useLocation();
  const [query, setQuery] = useSearchParams();
  const { rules: allRules, save, remove, move } = useFlagRulesStore();
  const { enabled, setEnabled } = useFlagEnvironmentsStore();
  const rules = allRules.filter(rule => rule.flagId === flagId);
  const base = `/feature-management/feature-flags/c/${flagId}`;
  const envParam = query.get('environment');
  const environment: FlagEnvironment = FLAG_ENVIRONMENTS.find(env => env === envParam) ?? 'Production';
  const key = `${flagId}:${environment}`;
  const isOn = enabled[key] ?? key !== '30:LocalTest';
  const [category, setCategory] = useState('rollout');
  const [openSetup, setOpenSetup] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<FlagRule | null>(null);
  const [deleting, setDeleting] = useState<FlagRule | null>(null);
  const [copying, setCopying] = useState(false);
  const [sourceId, setSourceId] = useState('');
  const [notice, setNotice] = useState<{ message: string } | null>(null);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  const { holdout, analysis, setAnalysis, configuration, saveConfiguration } = useFlagDetailPreferences();
  const [configTab, setConfigTab] = useState('Variables');
  const [config, setConfig] = useState<Record<string, string>>(configuration[flagId] ?? { Variables: 'enabled: boolean = false', Variations: 'Control\nVariation 1', Metrics: 'Conversion rate' });
  const [savedConfig, setSavedConfig] = useState(false);
  const environmentRules = rules.filter(rule => rule.environment === environment);
  const rollout = environmentRules.filter(rule => rule.type === 'Rollout');
  const experiments = environmentRules.filter(rule => rule.type !== 'Rollout');
  const visible = category === 'rollout' ? rollout : experiments;
  const section = pathname.endsWith('/configuration') ? 'configuration' : pathname.endsWith('/reports') ? 'reports' : 'rules';

  if (pathname === base || pathname === `${base}/`) return <Navigate replace to={`${base}/${rules.length ? 'rules' : 'configuration'}`} />;

  function createRule() {
    setNotice({ message: 'Flow being built' });
  }
  function toggleRule(rule: FlagRule, next: boolean) {
    save({ ...rule, enabled: next, hasStarted: rule.hasStarted || (next && isOn && (!rule.scheduledFor || Date.parse(rule.scheduledFor) <= Date.now())), completed: next ? false : rule.completed, pauseReason: next ? undefined : 'Paused manually by a user.' });
  }
  async function copyText(text: string) {
    try { await navigator.clipboard.writeText(text); setNotice({ message: 'Copied to clipboard' }); }
    catch { setNotice({ message: 'Couldn’t copy. Please select and copy the text manually.' }); }
  }

  if (section === 'configuration') return <div className="mx-auto w-full max-w-5xl p-10">
    <h1 className="text-2xl font-semibold">Configuration</h1><p className="mt-2 text-sm text-muted-foreground">Shared configuration across all environments.</p>
    <Tabs value={configTab} onValueChange={setConfigTab} className="mt-8"><TabsList>{['Variables','Variations','Metrics'].map(name => <TabsTrigger key={name} value={name}>{name}</TabsTrigger>)}</TabsList></Tabs>
    <Card className="mt-5"><CardContent className="space-y-4 p-6"><Label htmlFor="shared-config">{configTab}</Label><Input id="shared-config" value={config[configTab]} onChange={event => { setConfig({ ...config, [configTab]: event.target.value }); setSavedConfig(false); }} /><p className="text-sm text-muted-foreground">{configTab === 'Variables' ? 'Define the values your application receives.' : configTab === 'Variations' ? 'Define the experiences used by your rules.' : 'Choose the shared success metrics for this flag.'}</p><Button onClick={() => { saveConfiguration(flagId, config); setSavedConfig(true); }}>Save configuration</Button>{savedConfig && <p role="status" className="text-sm text-muted-foreground">Configuration saved locally.</p>}</CardContent></Card>
    <Button asChild variant="outline" className="mt-5"><Link to={`${base}/rules`}>Set up environments & rules</Link></Button>
  </div>;

  return <TooltipProvider><div className="flag-rule-workspace flex h-full min-h-full flex-1 overflow-auto">
    <aside aria-label="Flag environments" className="flag-environment-sidebar shrink-0 bg-background p-4">
      {FLAG_ENVIRONMENTS.map(env => { const on = enabled[`${flagId}:${env}`] ?? `${flagId}:${env}` !== '30:LocalTest'; return <Button key={env} variant="ghost" aria-current={environment === env ? 'page' : undefined} onClick={() => { setQuery({ environment: env }); }} className={`mb-1.5 h-8 w-full justify-between rounded-sm px-3 font-normal ${environment === env ? 'bg-muted' : ''}`}><span>{env}</span><span className={`inline-flex items-center gap-1.5 text-xs font-medium ${on ? 'text-[var(--success-fg)]' : 'text-[var(--warning-fg)]'}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{on ? 'ON' : 'OFF'}</span></Button>; })}
    </aside>
    <div className="flag-rule-main min-w-0 flex-1 bg-canvas px-5 py-3">
      <div className="flag-environment-heading mb-4 flex items-start justify-between gap-4"><div><div className="flex items-center gap-3"><Switch checked={isOn} aria-label={`${environment} flag enabled`} onCheckedChange={next => {
        setEnabled(key, next);
        if (next) environmentRules.filter(rule => rule.enabled && !rule.completed && (!rule.scheduledFor || Date.parse(rule.scheduledFor) <= Date.now())).forEach(rule => save({ ...rule, hasStarted: true }));
      }} /><h1 className="text-lg font-semibold">{environment}</h1></div><div className="ml-12 mt-1 flex items-center gap-2 text-xs text-muted-foreground">SDK key: demo-{flagId}-{environment.toLowerCase()}<Button variant="ghost" size="icon" className="size-6" aria-label="Copy SDK key" onClick={() => copyText(`demo-${flagId}-${environment.toLowerCase()}`)}><Copy className="size-3.5" /></Button></div></div><Button variant="outline" onClick={createRule}><Plus className="mr-2 size-4" />{holdout[key] ? 'Remove from holdout' : 'Add to holdout'}</Button></div>
      {notice && <Card role="status" aria-live="polite" aria-atomic="true" className="fixed bottom-6 right-6 z-50 max-w-sm shadow-lg"><CardContent className="px-4 py-3 text-sm">{notice.message}</CardContent></Card>}
      {holdout[key] && <p className="mb-4 text-sm text-muted-foreground">This environment is included in the flag holdout in this prototype.</p>}
      {section === 'reports' ? <><h2 className="mb-2 text-lg font-semibold">Rule reports</h2><p className="mb-6 text-sm text-muted-foreground">Results for rules with user activity in {environment}. Sample data.</p>{environmentRules.filter(rule => hasRuleReport(rule,isOn)).length ? environmentRules.filter(rule => hasRuleReport(rule,isOn)).map(rule => <Card key={rule.id} className={`mb-4 ${query.get('rule') === rule.id ? 'ring-1 ring-border' : ''}`}><CardContent className="flex items-center justify-between gap-4 p-6"><div><Tooltip><TooltipTrigger asChild><span tabIndex={0} aria-label={rule.type === 'Rollout' ? 'Rollout' : rule.type === 'Testing' ? 'AB test' : 'Personalise'}>{rule.type === 'Rollout' ? <ArrowRight className="size-4" /> : rule.type === 'Testing' ? <FlaskConical className="size-4" /> : <UserRound className="size-4" />}</span></TooltipTrigger><TooltipContent>{rule.type === 'Rollout' ? 'Rollout' : rule.type === 'Testing' ? 'AB test' : 'Personalise'}</TooltipContent></Tooltip><h3 className="font-medium">{rule.name}</h3><p className="mt-1 text-sm text-muted-foreground">{rule.type} · {ruleStatus(rule,isOn)}</p></div><div><p className="text-xs text-muted-foreground">Visitors</p><p className="mt-1 font-semibold">{rule.visitors.toLocaleString('en-US')}</p></div><div><p className="text-xs text-muted-foreground">Primary metric</p><p className={`mt-1 font-semibold ${accent}`}>{rule.metric ?? 'No results yet'}</p></div></CardContent></Card>) : <Card><CardContent className="p-10 text-center text-muted-foreground">No reports yet. Reports appear after a rule receives user activity.</CardContent></Card>}</> : <>
      <Tabs value={category} onValueChange={setCategory}><TabsList className="flag-rule-tabs"><TabsTrigger value="rollout">Rollout ({rollout.length})</TabsTrigger><TabsTrigger value="experiments">Experimentation &amp; more ({experiments.length})</TabsTrigger><TabsTrigger value="debugger">Debugger</TabsTrigger></TabsList></Tabs>
      {category === 'debugger' ? <section aria-labelledby="debugger-coming-soon" className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
        <ComingSoonIllustration className="mb-6 h-auto w-full max-w-[280px]" />
        <h2 id="debugger-coming-soon" className="text-xl font-semibold">Debugger is being built</h2>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Soon, you’ll be able to check how your rules evaluate visitors and understand which experience they receive.</p>
      </section> : <>
      <div className="flag-rule-toolbar mb-4 mt-5 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted-foreground">All visitors will be evaluated for the rules in the following order.</p><div className="flex gap-2"><Tooltip><TooltipTrigger asChild><span className="inline-flex" tabIndex={rules.length === 0 ? 0 : undefined}><Button variant="outline" onClick={() => { setSourceId(''); setCopying(true); }} disabled={rules.length === 0}><Copy className="mr-2 size-4" />Copy rule</Button></span></TooltipTrigger><TooltipContent>Import rules from other environments in this flag</TooltipContent></Tooltip>{category === 'experiments' ? <div className="flag-rule-split-button inline-flex text-foreground"><Button variant="outline" className="rounded-r-none border-foreground text-foreground" onClick={createRule}><Plus className="mr-2 size-4" />AB test rule</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="rounded-l-none border-foreground border-l-0 text-foreground" aria-label="Choose rule type"><ChevronDown className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="min-w-56"><DropdownMenuItem onSelect={createRule}><FlaskConical className="mr-2 size-4" />AB test rule</DropdownMenuItem><DropdownMenuItem onSelect={createRule}><UserRound className="mr-2 size-4" />Personalize rule</DropdownMenuItem><DropdownMenuItem onSelect={createRule}><LayoutGrid className="mr-2 size-4" />Multivariate rule</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div> : <Button onClick={createRule}><Plus className="mr-2 size-4" />Create rule</Button>}</div></div>
      <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">Visitors who qualify will receive: <strong className="font-medium text-foreground">{category === 'experiments' ? 'Variant served' : 'Default values'}</strong><Info className="size-4" aria-label={category === 'experiments' ? 'Qualifying visitors receive the variant served by the rule' : 'Qualifying visitors receive the configured default values'} /></p>
      {visible.map((rule,index) => <Card key={rule.id} className="flag-rule-card mb-3 rounded-sm" onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }} onDrop={event => { event.preventDefault(); const source = visible.findIndex(item => item.id === event.dataTransfer.getData('text/plain')); if (source < 0 || source === index) return; const direction = source < index ? 1 : -1; for (let step = 0; step < Math.abs(index-source); step++) move(visible[source].id,direction); }}><CardContent className="px-4 pb-3 pt-4"><div className="flex items-start gap-4"><Button variant="ghost" size="icon" className="flag-rule-reorder size-5 shrink-0" aria-label={`Reorder ${rule.name}. Use Up or Down arrow keys.`} draggable onDragStart={event => { event.dataTransfer.setData('text/plain',rule.id); event.dataTransfer.effectAllowed = 'move'; }} title="Drag to reorder, or use Up and Down arrow keys" onKeyDown={event => { if (event.key === 'ArrowUp' && index > 0) { event.preventDefault(); move(rule.id,-1); } if (event.key === 'ArrowDown' && index < visible.length-1) { event.preventDefault(); move(rule.id,1); } }}><GripVertical className="size-5" /></Button><Switch className="flag-rule-small-switch mt-1" checked={rule.enabled} aria-label={`Enable ${rule.name}`} onCheckedChange={next => toggleRule(rule,next)} /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Tooltip><TooltipTrigger asChild><span tabIndex={0} aria-label={rule.type === 'Rollout' ? 'Rollout' : rule.type === 'Testing' ? 'AB test' : 'Personalise'}>{rule.type === 'Rollout' ? <ArrowRight className="size-4" /> : rule.type === 'Testing' ? <FlaskConical className="size-4" /> : <UserRound className="size-4" />}</span></TooltipTrigger><TooltipContent>{rule.type === 'Rollout' ? 'Rollout' : rule.type === 'Testing' ? 'AB test' : 'Personalise'}</TooltipContent></Tooltip><h3 className="font-medium">{rule.name}</h3><Button size="icon" variant="ghost" className="size-6" aria-label={`Copy ${rule.name} ID`} onClick={() => copyText(rule.id)}><Copy className="size-3.5" /></Button></div></div>{hasRuleReport(rule,isOn) && <Button asChild variant="link" className={`${accent} h-7 shrink-0 gap-1 border-r border-border pr-4`}><Link to={`${base}/reports?environment=${environment}&rule=${rule.id}`} aria-label={`View reports for ${rule.name}`}><BarChart3 className="size-4" />View reports</Link></Button>}<Tooltip><TooltipTrigger asChild><span tabIndex={0}><Badge tone={tones[ruleStatus(rule,isOn)]}>{ruleStatusLabel(rule,isOn)}</Badge></span></TooltipTrigger><TooltipContent>{ruleStatusHint(rule,isOn)}</TooltipContent></Tooltip>{ruleStatus(rule,isOn) === 'Draft' ? <><Button variant="ghost" size="icon" className="size-7" aria-label={`Edit ${rule.name}`} onClick={() => setEditing({ ...rule })}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" className="size-7" aria-label={`Delete ${rule.name}`} onClick={() => setDeleting(rule)}><Trash2 className="size-4" /></Button></> : <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-7" aria-label={`More actions for ${rule.name}`}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setEditing({ ...rule })}><Pencil className="mr-2 size-4" />Edit rule</DropdownMenuItem><DropdownMenuItem onSelect={() => setDeleting(rule)}><Trash2 className="mr-2 size-4" />Delete rule</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}</div>
      {!((rule.type === 'Rollout' || rule.type === 'Testing') && openSetup[rule.id]) && <div className="flag-rule-summary mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        {hasRuleReport(rule,isOn) && rule.visitors > 0 && <span className="inline-flex flex-wrap items-center gap-3 border-r border-border pr-4"><span><strong className="font-semibold text-foreground" title={rule.visitors.toLocaleString('en-US')}>{new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(rule.visitors)}</strong> Visitors</span><span><strong className="font-semibold text-foreground" title={rule.uniqueConversions?.toLocaleString('en-US')}>{rule.uniqueConversions === undefined ? '—' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(rule.uniqueConversions)}</strong> Unique Conversions</span></span>}
        <span>{rule.audience ?? 'All visitors'}</span><span aria-hidden="true">·</span><span><strong className="font-medium text-foreground">{rule.trafficAllocation ?? 100}%</strong> Traffic</span>{isGradualRollout(rule) && <Badge tone="ocean">Gradual rollout</Badge>}
      </div>}
      {rule.type === 'Rollout' && openSetup[rule.id] && <RolloutRuleSetup rule={rule} onCopy={copyText} />}
      {rule.type !== 'Rollout' && openSetup[rule.id] && <ExperimentRuleSetup rule={rule} onCopy={copyText} />}
      <div className="flag-rule-actions mt-1.5 flex items-center justify-center gap-3"><Button variant="link" className={accent} aria-expanded={!!openSetup[rule.id]} onClick={() => setOpenSetup(previous => ({ ...previous, [rule.id]: !previous[rule.id] }))}>{openSetup[rule.id] ? 'Hide setup' : 'Show setup'}{openSetup[rule.id] ? <ChevronUp className="ml-1 size-4" /> : <ChevronDown className="ml-1 size-4" />}</Button></div>
      </CardContent></Card>)}
      {!visible.length && <div className="rounded border border-border bg-card p-8 text-center text-sm"><div className="flex flex-col items-center gap-4"><div className="relative size-20 p-1.5" aria-hidden="true"><img src="/feature-flags/no-rules.svg" alt="" width={72} height={72} /><Search className="absolute left-[30px] top-[26px] size-5 text-[var(--accent)]" strokeWidth={5} /></div><div className="max-w-[352px] space-y-1"><h2 className="font-semibold">No rule added</h2><p className="text-muted-foreground">Please add at least one rule to launch your feature</p></div></div><div className="mt-6 flex justify-center gap-3"><Tooltip><TooltipTrigger asChild><span className="inline-flex" tabIndex={rules.length === 0 ? 0 : undefined}><Button variant="outline" className="h-8 rounded-sm px-3 font-normal" disabled={rules.length === 0} onClick={() => { setSourceId(''); setCopying(true); }}><Copy className="mr-1 size-4" />Copy rule</Button></span></TooltipTrigger><TooltipContent>Import rules from other environments in this flag</TooltipContent></Tooltip><Button className="h-8 rounded-sm px-3 font-normal" onClick={createRule}><Plus className="mr-1 size-4" />Create rule</Button></div></div>}
      <p className="my-4 flex items-center gap-1 text-sm">Everyone else receives <strong>{category === 'experiments' ? 'Qualified rollout experience' : 'Fallback values'}</strong><Info className="size-4" aria-label={category === 'experiments' ? 'Visitors who do not qualify receive their qualified rollout experience' : 'Visitors who do not qualify receive fallback values'} /></p>
      {category === 'rollout' && <Card className="flag-impact-panel bg-transparent"><CardContent className="flex items-start gap-4 p-4"><div className="flex items-start gap-3"><Switch className="flag-rule-small-switch mt-0.5" checked={analysis[key] ?? true} onCheckedChange={value => setAnalysis(key, value)} aria-label="Analyse impact of this feature" /><div><h2 className="font-semibold">Analyse impact of this feature</h2><p className="mt-2 text-sm text-muted-foreground">Compares users who receive this feature with users who don't, to show how it affects your metrics.</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><AlertTriangle className="size-3.5 shrink-0 text-[var(--status-paused-fg)]" />Uses additional quota. Every user evaluated for this flag counts, even if they don’t match your rollout rules.</p><Button asChild variant="outline" className="mt-4"><Link to={`${base}/reports?environment=${environment}`}><BarChart3 className="mr-1 size-4" />View reports</Link></Button></div></div><img src="/feature-flags/impact.png" alt="" width={100} height={94} className="ml-auto shrink-0" /></CardContent></Card>}
      </>}
      </>}
    </div>
    <Dialog open={!!editing} onOpenChange={open => { if (!open) setEditing(null); }}><DialogContent><DialogHeader><DialogTitle>{allRules.some(rule => rule.id === editing?.id) ? 'Edit rule' : 'Create rule'}</DialogTitle><DialogDescription>{environment} · New rules start as Draft.</DialogDescription></DialogHeader>{editing && <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (!editing.name.trim()) return; save({ ...editing, name: editing.name.trim() }); setCategory(editing.type === 'Rollout' ? 'rollout' : 'experiments'); setEditing(null); }}><div className="space-y-2"><Label htmlFor="rule-name">Rule name</Label><Input id="rule-name" required value={editing.name} onChange={event => setEditing({ ...editing, name: event.target.value })} /></div><div className="space-y-2"><Label>Rule type</Label><Select value={editing.type} onValueChange={value => setEditing({ ...editing, type: value as FlagRule['type'] })}><SelectTrigger aria-label="Rule type"><SelectValue /></SelectTrigger><SelectContent>{['Rollout','Testing','Personalization'].map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div><Button type="submit" disabled={!editing.name.trim()}>Save rule</Button></form>}</DialogContent></Dialog>
    <Dialog open={!!deleting} onOpenChange={open => { if (!open) setDeleting(null); }}><DialogContent><DialogHeader><DialogTitle>Delete {deleting?.name}?</DialogTitle><DialogDescription>This removes the rule and its sample results from this prototype.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button><Button onClick={() => { if (deleting) remove(deleting.id); setDeleting(null); }}>Delete rule</Button></div></DialogContent></Dialog>
    <Dialog open={copying} onOpenChange={setCopying}><DialogContent><DialogHeader><DialogTitle>Copy rule to {environment}</DialogTitle><DialogDescription>The copy starts as a draft with no visitor or report data.</DialogDescription></DialogHeader><Select value={sourceId} onValueChange={setSourceId}><SelectTrigger aria-label="Rule to copy"><SelectValue placeholder="Choose a rule" /></SelectTrigger><SelectContent>{rules.map(rule => <SelectItem key={rule.id} value={rule.id}>{rule.name} · {rule.environment}</SelectItem>)}</SelectContent></Select><Button disabled={!sourceId} onClick={() => { const source = rules.find(rule => rule.id === sourceId); if (!source) return; save({ ...source, id: crypto.randomUUID(), environment, name: `${source.name} (copy)`, enabled: false, hasStarted: false, visitors: 0, uniqueConversions: undefined, metric: null, scheduledFor: undefined, completed: false, pauseReason: undefined }); setCategory(source.type === 'Rollout' ? 'rollout' : 'experiments'); setCopying(false); }}>Copy rule</Button></DialogContent></Dialog>
  </div></TooltipProvider>;
}
