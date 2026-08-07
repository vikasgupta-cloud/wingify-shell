// Dummy feature flags for Feature Management → Feature Flags.

export type FeatureFlag = {
  id: string;
  name: string;
  createdOn: string; // ISO
  createdBy: string;
  environment: "Prod" | "Staging" | "Dev" | null;
  variations: number | null;
};

function iso(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m - 1, d)).toISOString();
}

export const FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: "30",
    name: "wizard_flow_experiment",
    createdOn: iso(2026, 6, 21),
    createdBy: "Ankit Jain",
    environment: null,
    variations: null,
  },
  {
    id: "29",
    name: "Test_client_email",
    createdOn: iso(2026, 6, 21),
    createdBy: "Ankit Jain",
    environment: null,
    variations: null,
  },
  {
    id: "28",
    name: "teing 1231",
    createdOn: iso(2026, 6, 19),
    createdBy: "Ankit Jain",
    environment: null,
    variations: null,
  },
  {
    id: "27",
    name: "Testing 123",
    createdOn: iso(2026, 6, 19),
    createdBy: "Ankit Jain",
    environment: null,
    variations: null,
  },
  {
    id: "26",
    name: "Test 123",
    createdOn: iso(2026, 6, 19),
    createdBy: "Ankit Jain",
    environment: null,
    variations: null,
  },
  {
    id: "25",
    name: "Test_new_flag",
    createdOn: iso(2026, 5, 12),
    createdBy: "Divyanshu Kalra",
    environment: "Prod",
    variations: 2,
  },
  {
    id: "24",
    name: "checkout_banner",
    createdOn: iso(2026, 5, 8),
    createdBy: "Randeep",
    environment: "Prod",
    variations: 1,
  },
  {
    id: "23",
    name: "mobile_onboarding_v2",
    createdOn: iso(2026, 4, 22),
    createdBy: "Anita Shah",
    environment: "Staging",
    variations: 3,
  },
  {
    id: "22",
    name: "pricing_experiment_key",
    createdOn: iso(2026, 4, 10),
    createdBy: "Vikas Gupta",
    environment: "Dev",
    variations: 2,
  },
  {
    id: "21",
    name: "search_relevance_toggle",
    createdOn: iso(2026, 3, 28),
    createdBy: "Divyanshu Kalra",
    environment: "Prod",
    variations: 1,
  },
  {
    id: "20",
    name: "Test 1",
    createdOn: iso(2026, 3, 15),
    createdBy: "Ankit Jain",
    environment: "Prod",
    variations: 2,
  },
  {
    id: "19",
    name: "test",
    createdOn: iso(2026, 2, 2),
    createdBy: "Randeep",
    environment: "Prod",
    variations: 1,
  },
];
