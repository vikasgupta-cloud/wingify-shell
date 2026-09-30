export const FLAG_ENVIRONMENTS = ['Production', 'Staging', 'Dev', 'LocalTest', 'Mobile'] as const;
export type FlagEnvironment = typeof FLAG_ENVIRONMENTS[number];
export type FlagRule = {
  id: string;
  flagId: string;
  environment: FlagEnvironment;
  name: string;
  type: 'Rollout' | 'Testing' | 'Personalization';
  enabled: boolean;
  hasStarted: boolean;
  scheduledFor?: string;
  pauseReason?: string;
  completed?: boolean;
  visitors: number;
  personalizationSetup?: {
    audienceCondition?: { attribute: string; operator: string; value: string };
    variations: { name: string; assignmentLabel?: string; description?: string; userIds?: string[] }[];
    salt?: string;
    automations?: string[];
    smartStats?: string[];
  };
  testingSetup?: {
    audienceCondition?: { attribute: string; operator: string; value: string };
    variations: { name: string; traffic: number; description?: string; userIds?: string[] }[];
    salt?: string;
    automations?: string[];
  };
  rolloutSetup?: {
    audienceCondition?: { attribute: string; operator: string; value: string };
    metricConditions?: { metric: string; conversionRate: number; visitors: number; trafficAllocation: number }[];
    includedUsers?: string[];
    excludedUsers?: string[];
    salt?: string;
  };
  uniqueConversions?: number;
  audience?: string;
  trafficAllocation?: number;
  rolloutSteps?: { trafficAllocation: number; afterDays: number }[];
  metric: string | null;
};
export const FLAG_RULES: FlagRule[] = [
  { id: 'local-ready', flagId: '30', environment: 'LocalTest', name: 'Local targeting check', type: 'Rollout', enabled: true, hasStarted: false, visitors: 0, metric: null },
  { id: 'staging-draft', flagId: '30', environment: 'Staging', name: 'New checkout test', type: 'Testing', enabled: false, hasStarted: false, visitors: 0, metric: null },
  { id: 'nz', rolloutSetup: { audienceCondition: { attribute: 'Country', operator: 'equals', value: 'New Zealand' }, metricConditions: [{ metric: 'Add to cart clicks', conversionRate: 5, visitors: 500, trafficAllocation: 10 }, { metric: 'Checkout conversion', conversionRate: 2, visitors: 100, trafficAllocation: 20 }], includedUsers: ['62546', '7364573', '847694', '87584'], excludedUsers: ['353647', '7976767', '79076', '789764'], salt: '12343535' }, audience: 'Custom segment', trafficAllocation: 5, rolloutSteps: [{ trafficAllocation: 5, afterDays: 0 }, { trafficAllocation: 25, afterDays: 2 }, { trafficAllocation: 100, afterDays: 7 }], uniqueConversions: 3984, flagId: '30', environment: 'Production', name: 'All NZ users', type: 'Rollout', enabled: true, hasStarted: true, visitors: 12450, metric: '32% conversion rate' },
  { pauseReason: 'Paused manually by a user.', id: 'all', uniqueConversions: 6947, flagId: '30', environment: 'Production', name: 'All users', type: 'Rollout', enabled: false, hasStarted: true, visitors: 24810, metric: '28% conversion rate' },
  { id: 'cta', audience: 'Custom segment', trafficAllocation: 100, testingSetup: { audienceCondition: { attribute: 'User Agent', operator: 'Matches Regex (case insens.)', value: '(iOS|iPhone|iPad)' }, variations: [{ name: 'Control', traffic: 10, description: 'Default experience', userIds: ['62546', '7364573', '847694', '87584'] }, { name: 'Variation 1', traffic: 45, description: 'First checkout CTA variation', userIds: ['353647', '7976767', '79076', '789764'] }, { name: 'Variation 2', traffic: 45, description: 'Second checkout CTA variation' }], salt: '12343535', automations: ['Pause campaign after duration is completed'] }, flagId: '30', environment: 'Production', name: 'Checkout CTA test', type: 'Testing', enabled: true, hasStarted: true, visitors: 8420, metric: '+4.3% uplift' },
  { id: 'internal', flagId: '30', environment: 'Staging', name: 'Internal users', type: 'Rollout', enabled: true, hasStarted: true, visitors: 340, metric: null },
  { id: 'mobile', audience: 'Custom segment', trafficAllocation: 100, personalizationSetup: { audienceCondition: { attribute: 'User Agent', operator: 'Matches Regex (case insens.)', value: '(iOS|iPhone|iPad)' }, variations: [{ name: 'Control', assignmentLabel: 'Default', description: 'Default experience served to qualifying visitors', userIds: ['62546', '7364573', '847694', '87584'] }], salt: '12343535', automations: ['Pause campaign after duration is completed'], smartStats: ['Sequential testing approach', 'Bonferroni correction'] }, uniqueConversions: 446, flagId: '30', environment: 'Mobile', name: 'Mobile PDP experience', type: 'Personalization', enabled: true, hasStarted: true, visitors: 1860, metric: '24% conversion rate' },
  { id: 'checkout', uniqueConversions: 2440, flagId: '29', environment: 'Production', name: 'Checkout redesign rollout', type: 'Rollout', enabled: true, hasStarted: true, visitors: 6420, metric: '38% conversion rate' },
  { id: 'checkout-test', flagId: '29', environment: 'Dev', name: 'Checkout layout test', type: 'Testing', enabled: true, hasStarted: true, visitors: 120, metric: null },
  { id: 'checkout-target', flagId: '29', environment: 'Dev', name: 'Returning customers', type: 'Personalization', enabled: true, hasStarted: true, visitors: 85, metric: null },
  { id: 'checkout-scheduled', flagId: '29', environment: 'Staging', name: 'Next checkout release', type: 'Rollout', enabled: true, hasStarted: false, scheduledFor: '2026-10-07T09:00:00Z', visitors: 0, metric: null },
  { id: 'search-complete', flagId: '28', environment: 'Production', name: 'Search relevance test', type: 'Testing', enabled: false, hasStarted: true, completed: true, visitors: 18200, metric: '+2.1% uplift' },
  { pauseReason: 'Paused automatically after reaching the configured visitor limit.', id: 'search-paused', flagId: '28', environment: 'LocalTest', name: 'Local search validation', type: 'Rollout', enabled: false, hasStarted: true, visitors: 42, metric: null },
];
export function rulesForFlag(flagId: string, environment?: FlagEnvironment) {
  return FLAG_RULES.filter(rule => rule.flagId === flagId && (!environment || rule.environment === environment));
}
export type RuleStatus = 'Active' | 'Inactive' | 'Draft' | 'Paused' | 'Scheduled' | 'Completed';

export function ruleStatus(rule: FlagRule, environmentOn: boolean, now = Date.now()): RuleStatus {
  if (rule.completed) return 'Completed';
  if (!rule.enabled) return rule.hasStarted ? 'Paused' : 'Draft';
  if (!environmentOn) return 'Inactive';
  if (rule.scheduledFor && Date.parse(rule.scheduledFor) > now) return 'Scheduled';
  return 'Active';
}

export function ruleStatusHint(rule: FlagRule, environmentOn: boolean): string {
  const status = ruleStatus(rule, environmentOn);
  if (status === 'Inactive') return 'Flag is turned Off for this environment';
  if (status === 'Scheduled') return `Scheduled to launch on ${new Date(rule.scheduledFor!).toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' })} UTC`;
  if (status === 'Paused') return rule.pauseReason ?? 'This rule has been turned off after it started.';
  if (status === 'Draft') return 'This rule has not been turned on yet.';
  if (status === 'Active' && rule.visitors === 0) return 'This rule is running. Its report is waiting for user activity.';
  return status === 'Completed' ? 'This rule has completed.' : 'This rule is active in this environment.';
}

export function hasRuleReport(rule: FlagRule, environmentOn = true) {
  const status = ruleStatus(rule, environmentOn);
  if (status === 'Draft') return false;
  return status === 'Active' || status === 'Paused' || rule.hasStarted || rule.visitors > 0;
}

export function ruleStatusLabel(rule: FlagRule, environmentOn: boolean) {
  const status = ruleStatus(rule, environmentOn);
  return status === 'Active' ? 'Running' : status;
}

export function activeRuleCount(rules: FlagRule[], environmentOn = true) {
  return rules.filter(rule => ruleStatus(rule, environmentOn) === 'Active').length;
}

export function isGradualRollout(rule: FlagRule) {
  return rule.type === 'Rollout' && (rule.rolloutSteps?.length ?? 0) > 1;
}
