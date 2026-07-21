export type ValueType = 'text' | 'number' | 'select';
export type OperatorSet = 'string' | 'number' | 'enum' | 'event' | 'cohort';

export interface OperatorDef {
  id: string; symbol: string; label: string;
  valueless?: boolean; valueType?: 'number'; valueSuffix?: string;
}

export const OPERATORS: Record<OperatorSet, OperatorDef[]> = {
  string: [
    { id:'eq', symbol:'=', label:'equals' },
    { id:'neq', symbol:'≠', label:'not equals' },
    { id:'has', symbol:'∋', label:'contains' },
    { id:'nhas', symbol:'∌', label:'does not contain' },
    { id:'sw', symbol:'^', label:'starts with' },
    { id:'ew', symbol:'$', label:'ends with' },
    { id:'re', symbol:'.*', label:'matches regex' },
  ],
  number: [
    { id:'eq', symbol:'=', label:'equals' },
    { id:'neq', symbol:'≠', label:'not equals' },
    { id:'gt', symbol:'>', label:'greater than' },
    { id:'gte', symbol:'≥', label:'at least' },
    { id:'lt', symbol:'<', label:'less than' },
    { id:'lte', symbol:'≤', label:'at most' },
  ],
  enum: [
    { id:'is', symbol:'=', label:'is' },
    { id:'isnt', symbol:'≠', label:'is not' },
    { id:'oneof', symbol:'∈', label:'is one of' },
  ],
  event: [
    { id:'occ', symbol:'✓', label:'has occurred', valueless:true },
    { id:'nocc', symbol:'✗', label:'has not occurred', valueless:true },
    { id:'gte_n', symbol:'≥', label:'occurred at least', valueType:'number', valueSuffix:'times' },
    { id:'last_n', symbol:'⏱', label:'in the last', valueType:'number', valueSuffix:'days' },
  ],
  cohort: [
    { id:'in', symbol:'∈', label:'in' },
    { id:'nin', symbol:'∉', label:'not in' },
  ],
};

export interface AttributeDef { id:string; label:string; ops:OperatorSet; valueType?:ValueType; options?:string[]; }
export interface AttributeCategory { id:string; label:string; attributes:AttributeDef[]; }

const COUNTRIES = ['United States','United Kingdom','Canada','Germany','France','India','Australia','Japan','Brazil','Netherlands','Other'];
const BROWSERS = ['Chrome','Safari','Firefox','Edge','Opera','Samsung Internet','Other'];
const DEVICES = ['Desktop','Mobile','Tablet'];

export const ATTRIBUTE_CATEGORIES: AttributeCategory[] = [
  { id:'freq', label:'Frequently used', attributes:[
    { id:'device', label:'Device Type', ops:'enum', valueType:'select', options:DEVICES },
    { id:'browser', label:'Browser', ops:'enum', valueType:'select', options:BROWSERS },
    { id:'country', label:'Country', ops:'enum', valueType:'select', options:COUNTRIES },
    { id:'traffic', label:'Traffic Source', ops:'enum', valueType:'select', options:['Direct','Search','Social','Referral','Email','Paid','Display','Other'] },
    { id:'landing', label:'Landing Page URL', ops:'string', valueType:'text' },
    { id:'newret', label:'New vs Returning', ops:'enum', valueType:'select', options:['New','Returning'] },
  ]},
  { id:'user', label:'User attributes', attributes:[
    { id:'u_country', label:'Country', ops:'enum', valueType:'select', options:COUNTRIES },
    { id:'region', label:'Region / State', ops:'string', valueType:'text' },
    { id:'city', label:'City', ops:'string', valueType:'text' },
    { id:'os', label:'Operating System', ops:'enum', valueType:'select', options:['Windows','macOS','Linux','iOS','Android'] },
    { id:'screen', label:'Screen Width (px)', ops:'number', valueType:'number' },
    { id:'lang', label:'Language', ops:'enum', valueType:'select', options:['English','Spanish','French','German','Portuguese','Hindi','Japanese','Chinese (Simplified)','Other'] },
    { id:'login', label:'Logged-in State', ops:'enum', valueType:'select', options:['Logged in','Logged out'] },
  ]},
  { id:'events', label:'Events', attributes:[
    { id:'e_page', label:'Page Viewed', ops:'event' },
    { id:'e_click', label:'Element Clicked', ops:'event' },
    { id:'e_form', label:'Form Submitted', ops:'event' },
    { id:'e_cart', label:'Add to Cart', ops:'event' },
    { id:'e_checkout', label:'Checkout Started', ops:'event' },
    { id:'e_purchase', label:'Purchase Completed', ops:'event' },
    { id:'e_search', label:'Search Performed', ops:'event' },
    { id:'e_scroll', label:'Scroll Depth Reached', ops:'event' },
    { id:'e_custom', label:'Custom Event', ops:'event' },
  ]},
  { id:'campaigns', label:'Campaigns', attributes:[
    { id:'c_in', label:'Is in Campaign', ops:'enum', valueType:'select', options:['Yellow button test','Homepage hero A/B','Checkout copy test','Pricing page redesign','Mobile nav experiment'] },
    { id:'c_var', label:'Saw Variation', ops:'enum', valueType:'select', options:['Control','Variation 1','Variation 2','Variation 3'] },
    { id:'c_src', label:'UTM Source', ops:'enum', valueType:'select', options:['google','facebook','instagram','twitter','linkedin','bing','newsletter','Other'] },
    { id:'c_med', label:'UTM Medium', ops:'enum', valueType:'select', options:['cpc','organic','email','social','referral','display','affiliate','Other'] },
    { id:'c_camp', label:'UTM Campaign', ops:'string', valueType:'text' },
    { id:'c_ref', label:'Referrer Domain', ops:'string', valueType:'text' },
  ]},
  { id:'cohorts', label:'Cohorts', attributes:[
    { id:'cohort', label:'Cohort', ops:'cohort', valueType:'select', options:['High-Value Customers','Cart Abandoners','Newsletter Subscribers','Free-Trial Users','Churn Risk'] },
  ]},
];

// ── Lookup helpers ───────────────────────────────────────────────────────────
// Attribute ids are unique across categories, so a flat search is sufficient.
export function findAttribute(id: string): AttributeDef | undefined {
  for (const cat of ATTRIBUTE_CATEGORIES) {
    const attr = cat.attributes.find((a) => a.id === id);
    if (attr) return attr;
  }
  return undefined;
}

export function operatorsFor(attr: AttributeDef): OperatorDef[] {
  return OPERATORS[attr.ops];
}

export function findOperator(attr: AttributeDef, opId: string): OperatorDef | undefined {
  return OPERATORS[attr.ops].find((o) => o.id === opId);
}
