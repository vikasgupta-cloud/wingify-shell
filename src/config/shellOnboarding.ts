/** Bump when onboarding copy or slides change materially. */
export const SHELL_ONBOARDING_VERSION = 5;

export type ShellOnboardingSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights?: string[];
};

export const SHELL_ONBOARDING_SLIDES: ShellOnboardingSlide[] = [
  {
    id: "welcome",
    eyebrow: "Introducing Wingify",
    title: "VWO and AB Tasty, together",
    description:
      "Two leaders in experimentation are becoming one. Wingify is your new unified home to test, personalize, analyze, and grow — without switching tools.",
  },
  {
    id: "platform",
    eyebrow: "One platform",
    title: "Everything you need, one shell",
    description:
      "Experimentation, personalization, insights, commerce, and data — connected in a single workspace built for teams who ship faster.",
    highlights: [
      "Web Experimentation",
      "Personalize",
      "Insights",
      "Commerce",
      "Data360",
      "Wandz",
    ],
  },
];
