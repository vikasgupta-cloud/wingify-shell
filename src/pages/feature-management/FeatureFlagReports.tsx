import FlagGroupedResults from "./FlagGroupedResults";
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReportsPage from '@/pages/reports/ReportsPage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CAMPAIGNS, type Campaign } from '@/data/campaigns';
import { FLAG_ENVIRONMENTS, type FlagRule } from '@/data/featureFlagRules';
import { useFlagRulesStore } from '@/store/flagRules';
import { useVisibleFeatureFlags } from '@/store/flagRows';

const TYPES: FlagRule['type'][] = ['Rollout', 'Testing', 'Personalization'];
export default function FeatureFlagReports({ flagId }: { flagId: string }) {
  const [params, setParams] = useSearchParams();
  const allRules = useFlagRulesStore(state => state.rules);
  const flag = useVisibleFeatureFlags().find(item => item.id === flagId);
  const environment = FLAG_ENVIRONMENTS.find(item => item === params.get('environment')) ?? 'Production';
  const rules = allRules.filter(rule => rule.flagId === flagId && rule.environment === environment);
  const linkedRule = rules.find(rule => rule.id === params.get('rule'));
  const type = linkedRule?.type ?? TYPES.find(item => item === params.get('ruleType')) ?? 'Rollout';
  const selectedRule = type === 'Testing' ? linkedRule ?? rules.find(rule => rule.type === 'Testing') : undefined;
  const selection = selectedRule ? `rule:${selectedRule.id}` : type;
  const selected = type === 'Testing' ? (selectedRule ? [selectedRule] : []) : rules.filter(rule => rule.type === type);
  const visitors = selected.reduce((total, rule) => total + rule.visitors, 0);
  const reportKey = `flag-${flagId}-${environment}-${selection}`;
  // The prototype reuses the Web Testing sample report model and interactions.
  // Rule/environment context and visitor totals are scoped to this selection.
  const campaign = useMemo<Campaign>(() => {
    const template = CAMPAIGNS.find(item => item.status === 'Running' && item.scenario === 'progress') ?? CAMPAIGNS[0];
    return { ...template, id: reportKey, name: `${flag?.name ?? 'Feature flag'} · ${environment} · ${selectedRule?.name ?? type}`, visitors, uniqueConversions: Math.round(visitors * 0.03), status: 'Running', scenario: 'progress', decision: 'No decision', vitals: 'healthy' };
  }, [reportKey, flag?.name, environment, selectedRule?.name, type, visitors]);
  function update(field: 'environment' | 'rule', value: string) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (field === 'environment') { next.set('environment', value); next.delete('rule'); next.set('ruleType', 'Rollout'); }
      else if (value.startsWith('rule:')) { next.set('rule', value.slice(5)); next.delete('ruleType'); }
      else { next.set('ruleType', value); next.delete('rule'); }
      return next;
    });
  }
  const controls = <div className="flex shrink-0 items-center gap-2 border-r border-border pr-4">
    <Select value={environment} onValueChange={value => update('environment', value)}><SelectTrigger aria-label="Report environment" className="h-9 w-auto min-w-[170px] gap-2 border-0 shadow-none"><span className="text-muted-foreground">Environment:</span><SelectValue /></SelectTrigger><SelectContent>{FLAG_ENVIRONMENTS.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
    <Select value={selection} onValueChange={value => update('rule', value)}><SelectTrigger aria-label="Report rule" className="h-9 w-auto min-w-[145px] max-w-[270px] gap-2 border-0 shadow-none"><span className="text-muted-foreground">Rule:</span><SelectValue /></SelectTrigger><SelectContent>{TYPES.filter(item => item !== 'Testing').map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}{rules.filter(rule => rule.type === 'Testing').map(rule => <SelectItem key={rule.id} value={`rule:${rule.id}`}>{rule.type} · {rule.name}</SelectItem>)}</SelectContent></Select>
  </div>;
  return <ReportsPage featureFlagReport campaignOverride={campaign} leadingControls={controls} resultsTable={type !== 'Testing' ? <FlagGroupedResults rules={selected} type={type} /> : undefined} emptyMessage={(type === 'Testing' ? visitors === 0 : selected.length === 0) ? 'No report data for this selection yet. Reports appear after a rule receives user activity.' : undefined} />;
}
