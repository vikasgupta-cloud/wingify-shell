// Shared types/config for Feature Management report listings:
// Rollouts, Testing, Multivariate, Personalize.

import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Binary, GitBranch, Target } from "lucide-react";

export type FlagReportKind =
  | "rollout"
  | "testing"
  | "multivariate"
  | "personalize";

export type FlagReportStatus =
  | "Draft"
  | "Running"
  | "Paused"
  | "Archived"
  | "Trashed";

export const FLAG_REPORT_STATUSES: FlagReportStatus[] = [
  "Draft",
  "Running",
  "Paused",
  "Archived",
  "Trashed",
];

export type FlagReportColumnId =
  | "name"
  | "id"
  | "vitals"
  | "environment"
  | "rules"
  | "variations"
  | "combinations"
  | "visitors"
  | "uniqueConversions"
  | "startedOn"
  | "createdOnBy";

export type FlagReportColumnDef = {
  id: FlagReportColumnId;
  label: string;
  locked?: boolean;
  sortable: boolean;
  align?: "left" | "right" | "center";
  width: number;
};

export type FlagReportRow = {
  id: string;
  name: string;
  status: FlagReportStatus;
  environment: "Prod" | "Staging" | "Dev";
  rules: number | null;
  variations: number | null;
  combinations: number | null;
  visitors: number;
  uniqueConversions: number;
  startedOn: string | null;
  createdOn: string;
  createdBy: string;
  vitals: "healthy" | "unhealthy" | null;
};

export type FlagReportFilterField =
  | "status"
  | "creationDate"
  | "environment"
  | "createdBy"
  | "startDate";

export type FlagReportFilterOp = "isAnyOf" | "isNoneOf" | "is";

export type FlagReportFilter = {
  field: FlagReportFilterField;
  op: FlagReportFilterOp;
  value: string[] | string;
};

export type FlagReportConfig = {
  kind: FlagReportKind;
  path: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  columns: FlagReportColumnDef[];
  defaultVisible: FlagReportColumnId[];
  /** Filter fields shown in Add filter (order matters). */
  filterFields: FlagReportFilterField[];
  /** Prefixed filter chips always available as dashed buttons when empty. */
  quickFilters: FlagReportFilterField[];
};

const COL = {
  name: {
    id: "name" as const,
    label: "Flag Name",
    locked: true,
    sortable: true,
    width: 280,
  },
  id: { id: "id" as const, label: "ID", sortable: true, width: 90 },
  vitals: {
    id: "vitals" as const,
    label: "Vitals",
    sortable: false,
    align: "center" as const,
    width: 80,
  },
  environment: {
    id: "environment" as const,
    label: "Environment",
    sortable: false,
    width: 120,
  },
  rules: {
    id: "rules" as const,
    label: "Rules",
    sortable: true,
    align: "right" as const,
    width: 90,
  },
  variations: {
    id: "variations" as const,
    label: "Variations",
    sortable: true,
    align: "right" as const,
    width: 110,
  },
  combinations: {
    id: "combinations" as const,
    label: "Combinations",
    sortable: true,
    align: "right" as const,
    width: 130,
  },
  visitors: {
    id: "visitors" as const,
    label: "Visitors",
    sortable: false,
    align: "right" as const,
    width: 100,
  },
  uniqueConversions: {
    id: "uniqueConversions" as const,
    label: "Unique Conversions",
    sortable: false,
    align: "right" as const,
    width: 150,
  },
  startedOn: {
    id: "startedOn" as const,
    label: "Started On",
    sortable: true,
    width: 130,
  },
  createdOnBy: {
    id: "createdOnBy" as const,
    label: "Created On",
    sortable: true,
    width: 180,
  },
};

export const FLAG_REPORT_CONFIG: Record<FlagReportKind, FlagReportConfig> = {
  rollout: {
    kind: "rollout",
    path: "/feature-management/flag-rollout",
    title: "Feature Flags Rollouts",
    subtitle: "Deliver a new feature in incremental phases.",
    icon: ArrowUpRight,
    columns: [
      COL.name,
      COL.id,
      COL.environment,
      COL.rules,
      COL.visitors,
      COL.uniqueConversions,
      COL.startedOn,
    ],
    defaultVisible: [
      "name",
      "id",
      "environment",
      "rules",
      "visitors",
      "uniqueConversions",
      "startedOn",
    ],
    filterFields: [
      "status",
      "creationDate",
      "environment",
      "createdBy",
      "startDate",
    ],
    quickFilters: ["status", "creationDate", "environment"],
  },
  testing: {
    kind: "testing",
    path: "/feature-management/flag-testing",
    title: "Flag Testing",
    subtitle:
      "Create variations using different variables to test and identify which one converts the best.",
    icon: Binary,
    columns: [
      COL.name,
      COL.id,
      COL.vitals,
      COL.environment,
      COL.variations,
      COL.visitors,
      COL.uniqueConversions,
      COL.startedOn,
    ],
    defaultVisible: [
      "name",
      "id",
      "vitals",
      "environment",
      "variations",
      "visitors",
      "uniqueConversions",
      "startedOn",
    ],
    filterFields: ["status", "creationDate", "environment", "createdBy"],
    quickFilters: ["status", "creationDate"],
  },
  multivariate: {
    kind: "multivariate",
    path: "/feature-management/flag-multivariate",
    title: "Flag Multivariate Test",
    subtitle:
      "Create combinations using different variables to test and identify which one converts the best.",
    icon: GitBranch,
    columns: [
      COL.name,
      COL.id,
      COL.vitals,
      COL.environment,
      COL.combinations,
      COL.visitors,
      COL.uniqueConversions,
      COL.createdOnBy,
    ],
    defaultVisible: [
      "name",
      "id",
      "vitals",
      "environment",
      "combinations",
      "visitors",
      "uniqueConversions",
      "createdOnBy",
    ],
    filterFields: ["status", "creationDate", "environment", "createdBy"],
    quickFilters: ["status", "creationDate"],
  },
  personalize: {
    kind: "personalize",
    path: "/feature-management/flag-personalize",
    title: "Flag Personalize",
    subtitle: "Show targeted offers/experiences to a specific visitor group.",
    icon: Target,
    columns: [
      COL.name,
      COL.id,
      COL.environment,
      COL.rules,
      COL.visitors,
      COL.uniqueConversions,
      COL.createdOnBy,
    ],
    defaultVisible: [
      "name",
      "id",
      "environment",
      "rules",
      "visitors",
      "uniqueConversions",
      "createdOnBy",
    ],
    filterFields: ["status", "creationDate", "environment", "createdBy"],
    quickFilters: ["status", "creationDate"],
  },
};

export const FILTER_FIELD_LABEL: Record<FlagReportFilterField, string> = {
  status: "Status",
  creationDate: "Creation Date",
  environment: "Environments",
  createdBy: "Campaign Creator",
  startDate: "Start Date",
};
