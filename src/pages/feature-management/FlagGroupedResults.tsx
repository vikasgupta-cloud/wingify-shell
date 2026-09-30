import type { FlagRule } from '@/data/featureFlagRules';

export default function FlagGroupedResults({ rules, type }: { rules: FlagRule[]; type: string }) {
  return <div className="overflow-x-auto">
    <table className="w-full min-w-[700px] border-collapse text-sm">
      <caption className="sr-only">{type} rule results</caption>
      <thead><tr className="border-b border-border">
        {['Rules', 'Audience', 'Traffic allocation', 'Conversion rate', 'Unique Conv / Visitor'].map(label => <th key={label} scope="col" className="px-5 py-4 text-left font-medium">{label}</th>)}
      </tr></thead>
      <tbody>{rules.map(rule => {
        const conversions = rule.uniqueConversions;
        const rate = rule.visitors > 0 && conversions !== undefined ? `${(conversions / rule.visitors * 100).toFixed(2)}%` : '—';
        return <tr key={rule.id} className="border-b border-border last:border-0">
          <th scope="row" className="px-5 py-5 text-left font-medium">{rule.name}</th>
          <td className="px-5 py-5">{rule.audience ?? 'All visitors'}</td>
          <td className="px-5 py-5 tabular-nums">{rule.trafficAllocation ?? 100}%</td>
          <td className="px-5 py-5 tabular-nums">{rate}</td>
          <td className="px-5 py-5 tabular-nums">{conversions === undefined ? '—' : conversions.toLocaleString('en-US')} / {rule.visitors.toLocaleString('en-US')}</td>
        </tr>;
      })}</tbody>
    </table>
    <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">Sample rule results. A dash indicates conversion data is not available.</p>
  </div>;
}
