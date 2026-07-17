import type { UrlPredicate } from "../store/config";

export type PredicateDef = {
  id: UrlPredicate;
  label: string;
  description: string;
  example: string;
};

export const URL_PREDICATES: PredicateDef[] = [
  {
    id: "URL matches",
    label: "URL matches",
    description: "Use 'matches' to specify a particular URL.",
    example: "Specify a URL like https://example.com",
  },
  {
    id: "URL matches pattern",
    label: "URL matches pattern",
    description: "Use 'matches pattern' to define URLs following a specific format.",
    example: "Specify multiple URLs like https://example.com/products/*",
  },
  {
    id: "URL contains",
    label: "URL contains",
    description: "Use this to find URLs containing a specific text string.",
    example:
      "Specify a particular section of your website. Eg. /blog/ will target all blog pages.",
  },
  {
    id: "URL starts with",
    label: "URL starts with",
    description: "Use this for URLs beginning with a specific string.",
    example: "Include all pages of a directory. Eg. https://example.com/product",
  },
  {
    id: "URL ends with",
    label: "URL ends with",
    description: "Use this for URLs ending with a specific string.",
    example: "Specify pages that use /thankyou at the end of their URLs.",
  },
  {
    id: "URL matches regex",
    label: "URL matches regex",
    description: "Use this for URLs matching a specific regular expression pattern.",
    example:
      "^https://example.com/products/[0-9]+$ matches URLs starting with https://example.com/products/ followed by one or more digits.",
  },
  {
    id: "Page group is",
    label: "Page group is",
    description: "Use this to target a saved page.",
    example: "Page group is: Checkout",
  },
];

export const PAGE_GROUPS = [
  "Checkout",
  "Cart",
  "Product pages",
  "Blog",
  "Homepage",
  "Account",
];
