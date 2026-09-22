/** Dummy page groups for Configuration → Pages. */

export type PageUrlRule = {
  id: string;
  operator: "URL contains";
  value: string;
};

export type PageGroup = {
  id: string;
  name: string;
  included: PageUrlRule[];
  excluded: PageUrlRule[];
  defaultUrl: string;
  archived?: boolean;
};

export const PAGE_GROUPS: PageGroup[] = [
  {
    id: "demo-trial-cta",
    name: "Demo/Trial CTA Pages",
    defaultUrl: "https://vwo.com",
    included: [
      { id: "i1", operator: "URL contains", value: "/demo" },
      { id: "i2", operator: "URL contains", value: "request-demo" },
      { id: "i3", operator: "URL contains", value: "book-a-demo" },
      { id: "i4", operator: "URL contains", value: "see-a-demo" },
      { id: "i5", operator: "URL contains", value: "schedule-demo" },
      { id: "i6", operator: "URL contains", value: "/trial" },
      { id: "i7", operator: "URL contains", value: "free-trial" },
      { id: "i8", operator: "URL contains", value: "start-trial" },
    ],
    excluded: [
      { id: "e1", operator: "URL contains", value: "thank-you" },
      { id: "e2", operator: "URL contains", value: "confirmation" },
      { id: "e3", operator: "URL contains", value: "success" },
    ],
  },
  {
    id: "wingify-careers",
    name: "Wingify Careers",
    defaultUrl: "https://wingify.com/careers",
    included: [
      { id: "c1", operator: "URL contains", value: "/careers" },
      { id: "c2", operator: "URL contains", value: "jobs" },
      { id: "c3", operator: "URL contains", value: "openings" },
    ],
    excluded: [
      { id: "c4", operator: "URL contains", value: "thank-you" },
    ],
  },
];

/** Archived count shown on the collapsed Archived section (list not expanded). */
export const ARCHIVED_PAGE_GROUPS_COUNT = 13;

export function getPageGroupById(id: string): PageGroup | undefined {
  return PAGE_GROUPS.find((g) => g.id === id);
}
