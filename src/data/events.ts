// Dummy events for Data 360 → Events (Standard, My Event, Computed Event).

export type EventKind = "Standard" | "My Event" | "Computed Event";
export type EventDataType = "Text" | "Number" | "Boolean" | "Date";

export type EventProperty = {
  name: string;
  dataType: EventDataType;
  apiName?: string;
  description?: string;
  filtering?: string;
  /** Computed events: originating event names. */
  sourceEvents?: string[];
  /** Computed events: property names from each source. */
  sourceProperties?: string[];
};

export type UnregisteredProperty = {
  apiName: string;
  dataType: EventDataType;
};

export type EventSample = {
  name: string;
  props: Record<string, string | number | boolean>;
};

export type EventDefinition = {
  operator: "OR" | "AND";
  events: string[];
};

export type DataEvent = {
  id: string;
  name: string;
  apiName: string;
  kind: EventKind;
  description: string;
  createdBy: string;
  createdOn: string; // ISO
  lastModified?: string; // ISO
  properties: EventProperty[];
  unregisteredProperties?: UnregisteredProperty[];
  sampleValues?: EventSample[];
  definition?: EventDefinition;
};

function iso(y: number, m: number, d: number, h = 12, min = 0) {
  return new Date(Date.UTC(y, m - 1, d, h, min)).toISOString();
}

export const EVENTS: DataEvent[] = [
  // ── Standard ──────────────────────────────────────────────
  {
    id: "std-page-visit",
    name: "Page Visit",
    apiName: "pageVisit",
    kind: "Standard",
    description: "Event of a page being loaded (or reloaded) in a browser",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      {
        name: "Page URL",
        dataType: "Text",
        description: "Page URL for standard events",
      },
      {
        name: "Referrer Url",
        dataType: "Text",
        description: "URL of the previous page",
      },
      {
        name: "Title",
        dataType: "Text",
        description: "Document title of the page",
      },
      {
        name: "Auxiliary Event",
        dataType: "Boolean",
        description: "Whether this was fired as an auxiliary event",
      },
    ],
  },
  {
    id: "std-click",
    name: "Click",
    apiName: "click",
    kind: "Standard",
    description: "Visitor clicked an element on the page",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      { name: "CSS Selector", dataType: "Text", description: "Selector of the clicked element" },
      { name: "Page URL", dataType: "Text", description: "Page where the click occurred" },
      { name: "Tag Name", dataType: "Text", description: "HTML tag of the clicked element" },
    ],
  },
  {
    id: "std-form",
    name: "Form Submission",
    apiName: "formSubmission",
    kind: "Standard",
    description: "A form on the page was submitted",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      { name: "Form ID", dataType: "Text", description: "ID attribute of the form" },
      { name: "Page URL", dataType: "Text", description: "Page containing the form" },
    ],
  },
  {
    id: "std-engagement",
    name: "Engagement",
    apiName: "engagement",
    kind: "Standard",
    description: "Visitor engaged with the page beyond a simple bounce",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      { name: "Page URL", dataType: "Text", description: "Engaged page URL" },
      { name: "Time on Page", dataType: "Number", description: "Seconds spent before engagement" },
    ],
  },
  {
    id: "std-session",
    name: "When a new session is created",
    apiName: "newSession",
    kind: "Standard",
    description: "Fired when a new visitor session starts",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      { name: "Landing Page URL", dataType: "Text", description: "First page of the session" },
      { name: "Referrer", dataType: "Text", description: "External referrer if any" },
    ],
  },
  {
    id: "std-scroll",
    name: "Page scroll",
    apiName: "pageScroll",
    kind: "Standard",
    description: "Visitor scrolled past a defined threshold on the page",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      { name: "Scroll Percent", dataType: "Number", description: "Scroll depth percentage" },
      { name: "Page URL", dataType: "Text", description: "Scrolled page" },
    ],
  },
  {
    id: "std-leave",
    name: "Leave Intent",
    apiName: "leaveIntent",
    kind: "Standard",
    description: "Visitor showed intent to leave the page (e.g. cursor toward close)",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      { name: "Page URL", dataType: "Text", description: "Page where leave intent was detected" },
    ],
  },
  {
    id: "std-custom-trigger",
    name: "Custom trigger",
    apiName: "customTrigger",
    kind: "Standard",
    description: "A custom JavaScript trigger condition evaluated to true",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      { name: "Trigger Name", dataType: "Text", description: "Name of the custom trigger" },
    ],
  },
  {
    id: "std-variation",
    name: "When a campaign variation is applied",
    apiName: "campaignVariationApplied",
    kind: "Standard",
    description: "A campaign variation was applied for the visitor",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      { name: "Campaign ID", dataType: "Number", description: "Campaign identifier" },
      { name: "Variation ID", dataType: "Number", description: "Variation identifier" },
    ],
  },
  {
    id: "std-goal",
    name: "When a campaign goal is executed",
    apiName: "campaignGoalExecuted",
    kind: "Standard",
    description: "A campaign conversion goal was recorded",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      { name: "Campaign ID", dataType: "Number", description: "Campaign identifier" },
      { name: "Goal ID", dataType: "Number", description: "Goal identifier" },
    ],
  },
  {
    id: "std-unload",
    name: "Page Unload",
    apiName: "pageUnload",
    kind: "Standard",
    description: "The page is being unloaded or navigated away from",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      { name: "Page URL", dataType: "Text", description: "Page being unloaded" },
      { name: "Time on Page", dataType: "Number", description: "Seconds spent on the page" },
    ],
  },
  {
    id: "std-dead-click",
    name: "Dead Click",
    apiName: "deadClick",
    kind: "Standard",
    description: "Click on a non-interactive element that produced no response",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      { name: "CSS Selector", dataType: "Text", description: "Element that received the dead click" },
      { name: "Page URL", dataType: "Text", description: "Page URL" },
    ],
  },
  {
    id: "std-rage-click",
    name: "Rage Click",
    apiName: "rageClick",
    kind: "Standard",
    description: "Rapid repeated clicks in the same area, often indicating frustration",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      { name: "Click Count", dataType: "Number", description: "Clicks in the rage burst" },
      { name: "Page URL", dataType: "Text", description: "Page URL" },
    ],
  },
  {
    id: "std-error-clicks",
    name: "Error Clicks",
    apiName: "errorClicks",
    kind: "Standard",
    description: "Clicks associated with a client-side error state",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    properties: [
      { name: "Error Message", dataType: "Text", description: "Error text if available" },
      { name: "Page URL", dataType: "Text", description: "Page URL" },
    ],
  },

  // ── My Events ─────────────────────────────────────────────
  {
    id: "my-ua-parser",
    name: "ABTasty UA parser Match",
    apiName: "abTastyUaParserMatch",
    kind: "My Event",
    description: "",
    createdBy: "Ankit Jain",
    createdOn: iso(2026, 7, 21),
    lastModified: iso(2026, 7, 21, 13, 42),
    properties: [
      { name: "abtBrowser", dataType: "Text", apiName: "abtBrowser" },
      { name: "abtOs", dataType: "Text", apiName: "abtOs" },
      { name: "vwoDeviceType", dataType: "Text", apiName: "vwoDeviceType" },
      { name: "abtBrowserVersion", dataType: "Text", apiName: "abtBrowserVersion" },
      { name: "abtDeviceType", dataType: "Text", apiName: "abtDeviceType" },
      { name: "abtIp", dataType: "Text", apiName: "abtIp" },
      { name: "visIp", dataType: "Text", apiName: "visIp" },
      { name: "vwoBrowser", dataType: "Text", apiName: "vwoBrowser" },
      { name: "vwoOs", dataType: "Text", apiName: "vwoOs" },
      { name: "abtCountry", dataType: "Text", apiName: "abtCountry" },
    ],
    sampleValues: [
      {
        name: "abTastyUaParserMatch",
        props: {
          abtBrowser: "Chrome",
          abtBrowserVersion: "147",
          abtDeviceType: "Desktop",
          abtIp: "182.74.243.49",
          abtOs: "Linux",
        },
      },
      {
        name: "abTastyUaParserMatch",
        props: {
          visIp: "49.36.112.8",
          vwoBrowser: "Chrome",
          vwoOs: "Windows",
          abtDeviceType: "Desktop",
        },
      },
      {
        name: "abTastyUaParserMatch",
        props: {
          abtBrowser: "Safari",
          abtOs: "iOS",
          abtDeviceType: "Mobile",
          abtBrowserVersion: "18",
        },
      },
    ],
  },
  {
    id: "my-location",
    name: "ABTasty location match",
    apiName: "abTastyLocationMatch",
    kind: "My Event",
    description: "Fired when visitor geo matches a configured location rule",
    createdBy: "Ankit Jain",
    createdOn: iso(2026, 6, 10),
    lastModified: iso(2026, 7, 2, 9, 15),
    properties: [
      { name: "country", dataType: "Text", apiName: "country", description: "ISO country code" },
      { name: "city", dataType: "Text", apiName: "city" },
      { name: "region", dataType: "Text", apiName: "region" },
    ],
    sampleValues: [
      {
        name: "abTastyLocationMatch",
        props: { country: "IN", city: "Bengaluru", region: "KA" },
      },
    ],
  },
  {
    id: "my-rd-step1",
    name: "Event RD Step 1 Inline Form Success",
    apiName: "eventRdStep1InlineFormSuccess",
    kind: "My Event",
    description: "",
    createdBy: "Priya Sharma",
    createdOn: iso(2026, 5, 4),
    lastModified: iso(2026, 5, 18, 11, 20),
    properties: [],
    unregisteredProperties: [{ apiName: "type", dataType: "Text" }],
    sampleValues: [
      {
        name: "eventRdStep1InlineFormSuccess",
        props: { type: "inline" },
      },
    ],
  },
  {
    id: "my-transaction",
    name: "Transaction",
    apiName: "transaction",
    kind: "My Event",
    description: "Checkout completed successfully",
    createdBy: "Sarah Chen",
    createdOn: iso(2025, 11, 12),
    lastModified: iso(2026, 1, 8, 16, 5),
    properties: [
      { name: "orderId", dataType: "Text", apiName: "orderId", description: "Order identifier" },
      { name: "revenue", dataType: "Number", apiName: "revenue", description: "Order total" },
      { name: "currency", dataType: "Text", apiName: "currency" },
    ],
    sampleValues: [
      {
        name: "transaction",
        props: { orderId: "ORD-1042", revenue: 129.99, currency: "USD" },
      },
    ],
  },
  {
    id: "my-booking",
    name: "booking_successful",
    apiName: "bookingSuccessful",
    kind: "My Event",
    description: "Booking flow completed",
    createdBy: "James Okonkwo",
    createdOn: iso(2025, 9, 22),
    lastModified: iso(2026, 2, 14, 10, 0),
    properties: [
      { name: "bookingId", dataType: "Text", apiName: "bookingId" },
      { name: "amount", dataType: "Number", apiName: "amount" },
    ],
  },
  {
    id: "my-thankyou",
    name: "tnakyou_page",
    apiName: "thankYouPage",
    kind: "My Event",
    description: "Thank-you page view after conversion",
    createdBy: "Sarah Chen",
    createdOn: iso(2025, 8, 1),
    properties: [
      { name: "pageUrl", dataType: "Text", apiName: "pageUrl" },
    ],
  },
  {
    id: "my-total-purchase",
    name: "total_purchase",
    apiName: "totalPurchase",
    kind: "My Event",
    description: "Purchase event with total cart value",
    createdBy: "Ankit Jain",
    createdOn: iso(2025, 7, 19),
    lastModified: iso(2026, 1, 27, 21, 46),
    properties: [
      { name: "total_price", dataType: "Number", apiName: "total_price" },
      { name: "items", dataType: "Number", apiName: "items" },
    ],
  },
  {
    id: "my-calendar",
    name: "Event Calendar Booked",
    apiName: "eventCalendarBooked",
    kind: "My Event",
    description: "Calendar slot booked from the product page",
    createdBy: "Priya Sharma",
    createdOn: iso(2026, 3, 11),
    properties: [
      { name: "slotId", dataType: "Text", apiName: "slotId" },
      { name: "durationMin", dataType: "Number", apiName: "durationMin" },
    ],
  },
  {
    id: "my-ft-form",
    name: "Event Free Trial Form Success",
    apiName: "eventFreeTrialFormSuccess",
    kind: "My Event",
    description: "Free trial signup form submitted",
    createdBy: "James Okonkwo",
    createdOn: iso(2026, 4, 2),
    properties: [
      { name: "emailDomain", dataType: "Text", apiName: "emailDomain" },
      { name: "plan", dataType: "Text", apiName: "plan" },
    ],
  },
  {
    id: "my-modal-click",
    name: "Event click on modal",
    apiName: "eventClickOnModal",
    kind: "My Event",
    description: "CTA click inside a promotional modal",
    createdBy: "Sarah Chen",
    createdOn: iso(2026, 2, 28),
    properties: [
      { name: "modalId", dataType: "Text", apiName: "modalId" },
      { name: "ctaLabel", dataType: "Text", apiName: "ctaLabel" },
    ],
  },
  {
    id: "my-freemail-error",
    name: "Freemail Error Message",
    apiName: "freemailErrorMessage",
    kind: "My Event",
    description: "Shown when a freemail address is blocked on signup",
    createdBy: "Ankit Jain",
    createdOn: iso(2026, 1, 9),
    properties: [
      { name: "errorCode", dataType: "Text", apiName: "errorCode" },
    ],
  },

  // ── Computed (listed under My Events in the rail) ─────────
  {
    id: "cmp-purchase",
    name: "purchase computed",
    apiName: "purchaseComputed",
    kind: "Computed Event",
    description: "",
    createdBy: "Ankit Jain",
    createdOn: iso(2026, 1, 27),
    lastModified: iso(2026, 1, 27, 21, 46),
    definition: {
      operator: "OR",
      events: ["Purchase", "total_purchase"],
    },
    properties: [
      {
        name: "revenue",
        dataType: "Number",
        sourceEvents: ["Purchase", "total_purchase"],
        sourceProperties: ["Price", "total_price"],
      },
    ],
  },
  {
    id: "cmp-aov",
    name: "Purchase AOV > 10",
    apiName: "purchaseAovGt10",
    kind: "Computed Event",
    description: "Computed when purchase average order value exceeds 10",
    createdBy: "Priya Sharma",
    createdOn: iso(2026, 2, 5),
    lastModified: iso(2026, 3, 1, 8, 30),
    definition: {
      operator: "AND",
      events: ["Transaction", "total_purchase"],
    },
    properties: [
      {
        name: "aov",
        dataType: "Number",
        sourceEvents: ["Transaction"],
        sourceProperties: ["revenue"],
      },
    ],
  },
  {
    id: "cmp-ft-rd",
    name: "FT + RD Step 1 submission",
    apiName: "ftRdStep1Submission",
    kind: "Computed Event",
    description: "",
    createdBy: "James Okonkwo",
    createdOn: iso(2026, 4, 20),
    lastModified: iso(2026, 5, 1, 14, 10),
    definition: {
      operator: "OR",
      events: ["Event Free Trial Form Success", "Event RD Step 1 Inline Form Success"],
    },
    properties: [
      {
        name: "source",
        dataType: "Text",
        sourceEvents: ["Event Free Trial Form Success", "Event RD Step 1 Inline Form Success"],
        sourceProperties: ["plan", "type"],
      },
    ],
  },
];
