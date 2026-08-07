// Dummy data for Insights → Session Recordings (layout mirror of Figma Recordings).

export type RecordingViewStatus = "Running" | "Draft" | "Paused";

export type RecordingView = {
  id: string;
  name: string;
  url: string;
  status: RecordingViewStatus;
};

export type SessionRow = {
  id: string;
  city: string;
  country: string;
  url: string;
  company: number;
  duration: string;
  events: number;
  timestamp: string;
};

export const RECORDING_STATS = [
  { label: "Total Sessions", value: "1.67M" },
  { label: "Total Pageviews", value: "4.83M" },
  { label: "Data Retention", value: "2,190 days" },
] as const;

export const RECORDING_VIEWS: RecordingView[] = [
  {
    id: "agency",
    name: "Agency Partners",
    url: "https://vwo.com/partners/agencies",
    status: "Running",
  },
  {
    id: "signup",
    name: "New sign up-Create Acco...",
    url: "https://vwo.com*",
    status: "Running",
  },
  { id: "view-73", name: "View 73", url: "https://vwo.com", status: "Draft" },
  { id: "view-72", name: "View 72", url: "https://vwo.com", status: "Draft" },
  { id: "view-71", name: "View 71", url: "https://vwo.com", status: "Draft" },
  {
    id: "high",
    name: "High value accounts",
    url: "https://vwo.com",
    status: "Draft",
  },
  {
    id: "medium",
    name: "Medium value accounts",
    url: "https://example.com",
    status: "Draft",
  },
  {
    id: "low",
    name: "Low value accounts",
    url: "https://sampleurl.com",
    status: "Draft",
  },
  {
    id: "alfred-1",
    name: "test_Alfred_user_msg_sent",
    url: "https://vwo.com",
    status: "Paused",
  },
  {
    id: "alfred-2",
    name: "test_Alfred_user_msg_sent",
    url: "https://vwo.com",
    status: "Paused",
  },
];

const CITIES = [
  "Sunnyvale",
  "Mountain View",
  "Santa Clara",
  "San Jose",
  "Palo Alto",
  "Cupertino",
  "Milpitas",
  "Fremont",
  "Redwood City",
  "Menlo Park",
] as const;

export const SESSION_ROWS: SessionRow[] = CITIES.map((city, i) => ({
  id: `sess-${i + 1}`,
  city,
  country: "United States",
  url: "https://palash-multicurre...",
  company: 1,
  duration: `00:00:${String(12 + i * 3).padStart(2, "0")}`,
  events: 0,
  timestamp: `01 Jul, 2025 ${String(10 + (i % 5)).padStart(2, "0")}:${String(3 + i).padStart(2, "0")} AM`,
}));

export const ACTIVE_REPORT = {
  name: "Agency Partners",
  status: "Running" as const,
  createdBy: "Randeep",
  createdAt: "20 Feb, 2026 at 11:43 AM",
};
