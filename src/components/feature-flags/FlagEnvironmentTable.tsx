import { useFlagRulesStore } from '@/store/flagRules';
import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Flag, ArrowUpRight } from '@/components/icons/protoLucide';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFlagEnvironmentsStore } from '@/store/flagEnvironments';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FLAG_ENVIRONMENTS, activeRuleCount, ruleStatus, ruleStatusHint, ruleStatusLabel, hasRuleReport, type RuleStatus } from '@/data/featureFlagRules';
import type { FeatureFlag } from '@/data/featureFlags';
import { useFlagTableStore } from '@/store/flagTable';

const tones: Record<RuleStatus, BadgeTone> = { Active: 'green', Inactive: 'amber', Paused: 'amber', Scheduled: 'berry', Completed: 'neutral', Draft: 'neutral' };
const purple = 'text-[var(--report-purple-fg)]';

export default function FlagEnvironmentTable({ rows }: { rows: FeatureFlag[] }) {
  const allRules = useFlagRulesStore(state => state.rules);
  const rulesForFlag = (flagId: string, environment?: string) => allRules.filter(rule => rule.flagId === flagId && (!environment || rule.environment === environment));
  const [environmentExpanded, setEnvironmentExpanded] = useState<Record<string, boolean>>({});
  const { enabled } = useFlagEnvironmentsStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { page, pageSize, setPage, setPageSize } = useFlagTableStore();
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  function toggle(id: string) {
    setExpanded(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  const environmentOn = (key: string) => enabled[key] ?? key !== '30:LocalTest';
  return <TooltipProvider delayDuration={150}>
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <caption className="sr-only">Feature flags and active rules by environment</caption>
          <thead><tr className="border-b border-border bg-listing-header text-listing-header-foreground">
            <th scope="col" className="w-[35%] px-5 py-3 text-left text-xs font-medium">Flag</th>
            {FLAG_ENVIRONMENTS.map(environment => <th scope="col" key={environment} className="px-5 py-3 text-left text-xs font-medium">{environment}</th>)}
          </tr></thead>
          <tbody>{visible.map(flag => <Fragment key={flag.id}>
            <tr className="border-b border-border hover:bg-muted/20">
              <td className="px-4 py-4"><div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={`${expanded.has(flag.id) ? 'Collapse' : 'Expand'} ${flag.name}`} aria-expanded={expanded.has(flag.id)} aria-controls={`flag-rules-${flag.id}`} onClick={() => toggle(flag.id)}>
                  {expanded.has(flag.id) ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </Button>
                <Flag className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <Link className="font-medium hover:underline" to={`/feature-management/feature-flags/c/${flag.id}`}>{flag.name}</Link>
              </div></td>
              {FLAG_ENVIRONMENTS.map(environment => { const count = activeRuleCount(rulesForFlag(flag.id, environment), environmentOn(`${flag.id}:${environment}`)); return <td key={environment} className="px-5 py-4 tabular-nums">{!environmentOn(`${flag.id}:${environment}`) ? <Badge tone="amber">OFF</Badge> : count ? <span className={purple}>{count} active</span> : <span className="text-muted-foreground">—</span>}</td>; })}
            </tr>
            {expanded.has(flag.id) && <tr id={`flag-rules-${flag.id}`}><td colSpan={6} className="border-b border-border bg-muted/10 px-7 py-2">
              {FLAG_ENVIRONMENTS.map(environment => {
                const rules = rulesForFlag(flag.id, environment);
                const key = `${flag.id}:${environment}`;
                const isOpen = environmentExpanded[key] ?? rules.length > 0;
                const isOn = environmentOn(key);
                const contentId = `environment-rules-${flag.id}-${environment}`;
                const summary = (['Active', 'Inactive', 'Paused', 'Draft', 'Scheduled', 'Completed'] as const)
                  .map(status => ({ status, count: rules.filter(rule => ruleStatus(rule, isOn) === status).length }))
                  .filter(item => item.count > 0);
                return <section key={environment} aria-label={`${flag.name} ${environment} rules`} className="my-4 overflow-hidden rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-4 bg-muted/40 px-4 py-3">
                    <h3 className="min-w-0"><Button variant="ghost" className="h-auto w-full justify-start gap-3 p-0 text-xs font-semibold uppercase tracking-wider" aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${environment} rules for ${flag.name}`} aria-expanded={isOpen} aria-controls={contentId} onClick={() => setEnvironmentExpanded(previous => ({ ...previous, [key]: !isOpen }))}>
                      {isOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}{environment}
                    </Button></h3>
                    <Tooltip><TooltipTrigger asChild><span tabIndex={0} aria-label={`${environment}: ${isOn ? 'On' : 'Off'}`} className="inline-flex cursor-default"><Badge tone={isOn ? 'green' : 'amber'}>{isOn ? 'ON' : 'OFF'}</Badge></span></TooltipTrigger><TooltipContent>{isOn ? 'Flag is turned On for this environment' : 'Flag is turned Off for this environment'}</TooltipContent></Tooltip>
                    <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                      {summary.length ? summary.map(({ status, count }) => <Badge key={status} tone={tones[status]}>{count} {status.toLowerCase()}</Badge>) : <span>No rules created</span>}
                    </div>

                  </div>
                  <div id={contentId} hidden={!isOpen} className="px-4 pb-2 pt-3">
                  {!isOn && <p className="mb-3 text-xs text-muted-foreground">Environment is off. Rule delivery is suspended; saved rule statuses and past reports are retained.</p>}
                  {rules.length === 0 ? <p className="text-sm text-muted-foreground">No rules created</p> : <table className="w-full table-fixed text-sm [--listing-header-bg:var(--background)] [--listing-header-fg:var(--muted-foreground)]">
                    <caption className="sr-only">{environment} rules for {flag.name}</caption>
                    <thead><tr className="border-b border-border/60 text-xs">{['Rule', 'Type', 'Status', 'Visitors', 'Primary metric', 'Report'].map((label, index) => <th scope="col" key={label} className={`h-12 py-3 align-middle text-left text-xs font-semibold uppercase tracking-wide ${index === 0 ? 'w-[25%]' : ''}`}>{label}</th>)}</tr></thead>
                    <tbody>{rules.map(rule => <tr key={rule.id} className="border-t border-border/60">
                      <td className="py-3 pr-3 font-medium">{rule.name}</td><td className="py-3">{rule.type}</td>
                      <td className="py-3"><Tooltip><TooltipTrigger asChild><span tabIndex={0} className="inline-flex"><Badge tone={tones[ruleStatus(rule, isOn)]}>{ruleStatusLabel(rule, isOn)}</Badge></span></TooltipTrigger><TooltipContent>{ruleStatusHint(rule, isOn)}</TooltipContent></Tooltip></td>
                      <td className="py-3 tabular-nums">{rule.visitors === 0 ? '—' : `${rule.visitors.toLocaleString('en-US')} visitors`}</td>
                      <td className="py-3">{rule.metric ?? '—'}</td>
                      <td className="py-3">{!hasRuleReport(rule, isOn) ? <span className="text-muted-foreground">—</span> : <Button variant="link" className={`h-auto gap-1 p-0 text-sm ${purple}`} aria-label={`View report for ${rule.name} in ${environment}`} onClick={() => navigate(`/feature-management/feature-flags/c/${flag.id}/reports?environment=${environment}&rule=${rule.id}`)}>View report<ArrowUpRight className="size-3.5" /></Button>}</td>
                    </tr>)}</tbody>
                  </table>}
                  </div>
                </section>;
              })}
            </td></tr>}
          </Fragment>)}
          {rows.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">No feature flags match your search or filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-3"><Select value={String(pageSize)} onValueChange={value => setPageSize(Number(value))}><SelectTrigger className="h-8 w-20" aria-label="Flags per page"><SelectValue /></SelectTrigger><SelectContent>{[10,25,50].map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent></Select><span>Showing results {rows.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, rows.length)} of {rows.length}</span></div>
        <div className="flex items-center gap-3"><Button variant="outline" size="icon" className="size-8" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronRight className="size-4 rotate-180" /></Button><span>{currentPage} / {pages}</span><Button variant="outline" size="icon" className="size-8" aria-label="Next page" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}><ChevronRight className="size-4" /></Button></div>
      </div>
    </div>

  </TooltipProvider>;
}
