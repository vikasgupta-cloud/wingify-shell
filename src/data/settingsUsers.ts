/** Dummy account users for Settings → Accounts → Users. */

export type AccountUser = {
  id: string;
  name: string;
  email: string;
  createdOn: string;
  accounts: string;
  workspacesNote: string;
  twoFaMethod: "Disabled" | "Authenticator" | "SMS";
  permissions: string;
  /** Show a small person glyph next to the name (screenshot quirk). */
  showPersonMark?: boolean;
};

export const ACCOUNT_USERS: AccountUser[] = [
  {
    id: "u1",
    name: "VWO User",
    email: "user@vwo.com",
    createdOn: "02 May 2024",
    accounts: "Feature Experimentation",
    workspacesNote: "+ All workspace(s)",
    twoFaMethod: "Disabled",
    permissions: "Owner",
    showPersonMark: true,
  },
  {
    id: "u2",
    name: "Arun Badana",
    email: "arun.badana@wingify.com",
    createdOn: "02 May 2024",
    accounts: "Feature Experimentation",
    workspacesNote: "+ All workspace(s)",
    twoFaMethod: "Disabled",
    permissions: "Admin",
    showPersonMark: true,
  },
  {
    id: "u3",
    name: "Priya Sharma",
    email: "priya.sharma@wingify.com",
    createdOn: "14 Jun 2024",
    accounts: "Web Experimentation",
    workspacesNote: "+ All workspace(s)",
    twoFaMethod: "Authenticator",
    permissions: "Admin",
  },
  {
    id: "u4",
    name: "Sam Chen",
    email: "sam.chen@wingify.com",
    createdOn: "28 Aug 2024",
    accounts: "Insights",
    workspacesNote: "+ 2 workspace(s)",
    twoFaMethod: "Disabled",
    permissions: "Browse",
  },
];
