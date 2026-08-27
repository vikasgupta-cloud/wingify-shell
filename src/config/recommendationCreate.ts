/** Create-strategy wizard + rule-picker options (screenshot copy, stubs). */

import type { RecommendationLocation } from "@/data/recommendations";

export type CreateLocationOption = {
  id: Extract<
    RecommendationLocation,
    "Home page" | "Landing page" | "Category page" | "Product page"
  >;
  label: string;
  icon: "home" | "landing" | "category" | "product";
};

export const CREATE_LOCATION_OPTIONS: CreateLocationOption[] = [
  { id: "Home page", label: "Home page", icon: "home" },
  { id: "Landing page", label: "Landing page", icon: "landing" },
  { id: "Category page", label: "Category page", icon: "category" },
  { id: "Product page", label: "Product page", icon: "product" },
];

export type StrategyTemplate = {
  id: string;
  title: string;
  description: string;
  icon: "bestsellers" | "consulted" | "repurchase";
};

/** Recommended templates — stubs until wired. */
export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: "best-sellers",
    title: "Best sellers",
    description:
      "Push products that did the best number of sales over the last 7 / 14 / 30 days.",
    icon: "bestsellers",
  },
  {
    id: "most-consulted",
    title: "Most consulted products",
    description:
      "Push products that were the most viewed over the last 7 / 14 / 30 days.",
    icon: "consulted",
  },
  {
    id: "repurchase",
    title: "Repurchase recommendations",
    description:
      "Recommend products the user is likely to buy again.",
    icon: "repurchase",
  },
];

export type RuleOption = {
  id: string;
  title: string;
  description: string;
  unavailable?: boolean;
};

export type RuleSection = {
  id: string;
  label: string;
  options: RuleOption[];
};

export const RULE_SECTIONS: RuleSection[] = [
  {
    id: "basics",
    label: "Basics",
    options: [
      {
        id: "best-sellers",
        title: "Best sellers",
        description:
          "Promote the products that did the best sales over the last days.",
      },
      {
        id: "most-consulted",
        title: "Most consulted products",
        description:
          "Promote the products that were the most viewed over the last days.",
      },
      {
        id: "repurchase",
        title: "Repurchase recommendations",
        description:
          "Recommande les produits que l'utilisateur est susceptible de racheter.",
      },
    ],
  },
  {
    id: "dynamic",
    label: "Dynamic",
    options: [
      {
        id: "associated",
        title: "Products associated to …",
        description: "Push products that are often bought with another product",
      },
      {
        id: "viewed-together",
        title: "Products viewed together with …",
        description: "Push products that are often viewed with another product",
      },
      {
        id: "semantic-similar",
        title: "Products semantically similar to … (Unavailable)",
        description:
          "Push products that are semantically similar to another product",
        unavailable: true,
      },
      {
        id: "semantic",
        title: "semantic",
        description: "Custom rule",
      },
    ],
  },
  {
    id: "customizable",
    label: "Customizable",
    options: [
      {
        id: "sorted-by",
        title: "Products sorted by …",
        description: "Push products sorted by the catalog field you want …",
      },
      {
        id: "from-variable",
        title: "Products from variable …",
        description: "Reuse products from variables …",
      },
      {
        id: "handpicked",
        title: "Handpicked products",
        description: "Push products selected manually",
      },
    ],
  },
  {
    id: "advanced",
    label: "Advanced",
    options: [
      {
        id: "from-strategy",
        title: "Products from strategy …",
        description: "Reuse another strategy as a child rule",
      },
      {
        id: "conditional",
        title: "Conditional rule",
        description: "Push different products based on custom conditions",
      },
    ],
  },
];
