/** Dummy active products for Settings → My Subscription. */

import type { LucideIcon } from "@/components/icons/protoLucide";
import {
  BarChart3,
  FlaskConical,
  Rocket,
  Smartphone,
} from "@/components/icons/protoLucide";

export type SubscriptionProduct = {
  id: string;
  name: string;
  icon: LucideIcon;
  badges: { label: string; hasInfo?: boolean }[];
  metricLabel: string;
  metricValue: string;
  metricDetail: string;
  renewalDate: string;
  billingFrequency: string;
};

export const ACTIVE_SUBSCRIPTION_PRODUCTS: SubscriptionProduct[] = [
  {
    id: "web-exp",
    name: "Web Experimentation & Rollout",
    icon: FlaskConical,
    badges: [
      { label: "Enterprise plan" },
      { label: "Has extension", hasInfo: true },
    ],
    metricLabel: "MTU consumed",
    metricValue: "1K",
    metricDetail: "of 1.20M, expires on Jul 27, 2029",
    renewalDate: "Jul 27, 2029",
    billingFrequency: "Annually",
  },
  {
    id: "feature-mgmt",
    name: "Feature Management",
    icon: Rocket,
    badges: [
      { label: "Enterprise plan" },
      { label: "Has extension", hasInfo: true },
    ],
    metricLabel: "MTU consumed",
    metricValue: "50K",
    metricDetail: "of 1.20M, expires on Jul 27, 2029",
    renewalDate: "Jul 27, 2029",
    billingFrequency: "Annually",
  },
  {
    id: "behavior-analytics",
    name: "Behavior Analytics",
    icon: BarChart3,
    badges: [
      { label: "Enterprise plan" },
      { label: "Has extension", hasInfo: true },
    ],
    metricLabel: "Sampled MTU consumed",
    metricValue: "0",
    metricDetail: "of 100K, resets on Sep 24, 2026",
    renewalDate: "Jul 27, 2029",
    billingFrequency: "Annually",
  },
  {
    id: "mobile-insights",
    name: "Wingify Insights - Mobile App",
    icon: Smartphone,
    badges: [
      { label: "Enterprise plan" },
      { label: "Has extension", hasInfo: true },
    ],
    metricLabel: "Sampled MTU consumed",
    metricValue: "0",
    metricDetail: "of 100K, resets on Sep 24, 2026",
    renewalDate: "Jul 27, 2029",
    billingFrequency: "Annually",
  },
];
