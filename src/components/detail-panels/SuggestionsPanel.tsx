import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Crosshair,
  FlaskConical,
  LineChart,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "../../lib/utils";
import type { Campaign } from "../../data/campaigns";
import {
  buildAbInsightCategories,
  SUGGESTION_CATEGORY_LABEL,
  useCampaignSuggestions,
  useSuggestionsStore,
  type CampaignSuggestion,
  type InsightCategoryId,
  type InsightQuestion,
  type SuggestionCategory,
} from "../../store/suggestions";

const TOP_CATEGORY_ICON: Record<SuggestionCategory, typeof Sparkles> = {
  traffic: Users,
  hypothesis: FlaskConical,
  metrics: TrendingUp,
  targeting: Target,
  learnings: Sparkles,
};

const ACCORDION_ICON: Record<InsightCategoryId, typeof BarChart3> = {
  variation: BarChart3,
  stats: LineChart,
  traffic: Users,
  metrics: TrendingUp,
  audience: Crosshair,
  learnings: FlaskConical,
};

function ThinkingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-2 py-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted">
        <Sparkles className="h-4 w-4 animate-pulse text-foreground" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Wandz is thinking…</p>
        <p className="max-w-[240px] text-xs text-muted-foreground">
          Reviewing this campaign’s setup, traffic, and decision to draft top
          insights.
        </p>
      </div>
      <div className="flex items-center gap-1.5 pt-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
            style={{
              animation: "wandz-sug-dot 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes wandz-sug-dot {
          0%, 80%, 100% { opacity: .35; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}

function TopInsightCard({
  campaignId,
  item,
}: {
  campaignId: string;
  item: CampaignSuggestion;
}) {
  const dismiss = useSuggestionsStore((s) => s.dismiss);
  const Icon = TOP_CATEGORY_ICON[item.category];

  return (
    <article className="rounded-md border border-border bg-background p-3.5">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-foreground">
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            {SUGGESTION_CATEGORY_LABEL[item.category]}
          </span>
          <h3 className="mt-1 text-sm font-medium leading-snug text-foreground">
            {item.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {item.body}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-7 px-2.5 text-muted-foreground"
            onClick={() => dismiss(campaignId, item.id)}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </article>
  );
}

function QuestionAnswer({
  question,
  onClear,
}: {
  question: InsightQuestion;
  onClear: () => void;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/40 p-3.5">
      <p className="text-sm font-medium text-foreground">{question.label}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {question.answer}
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2 h-7 px-2.5 text-muted-foreground"
        onClick={onClear}
      >
        Clear
      </Button>
    </div>
  );
}

export default function SuggestionsPanel({
  campaign,
}: {
  campaign: Campaign | null;
}) {
  const slice = useCampaignSuggestions(campaign?.id);
  const generate = useSuggestionsStore((s) => s.generate);
  const [selectedQuestion, setSelectedQuestion] =
    useState<InsightQuestion | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const categories = useMemo(
    () => (campaign ? buildAbInsightCategories(campaign) : []),
    [campaign]
  );

  useEffect(() => {
    if (!campaign) return;
    generate(campaign);
    setSelectedQuestion(null);
    setOpenCategories(["variation"]);
  }, [campaign, generate]);

  if (!campaign) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No campaign selected</p>
        <p className="text-xs text-muted-foreground">
          Open a campaign to see Wandz AI Insights for this test.
        </p>
      </div>
    );
  }

  const visible = slice.items.filter((i) => i.status !== "dismissed");
  const dismissed = slice.items.filter((i) => i.status === "dismissed");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 px-4 py-4">
          {/* Top insights — campaign-specific */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Top insights
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-muted-foreground"
                disabled={slice.pending}
                onClick={() => generate(campaign, { refresh: true })}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Regenerate
              </Button>
            </div>
            {selectedQuestion ? (
              <QuestionAnswer
                question={selectedQuestion}
                onClear={() => setSelectedQuestion(null)}
              />
            ) : null}
            {slice.pending && visible.length === 0 ? (
              <ThinkingState />
            ) : (
              <div className="space-y-2.5">
                {visible.map((item) => (
                  <TopInsightCard
                    key={item.id}
                    campaignId={campaign.id}
                    item={item}
                  />
                ))}
                {visible.length === 0 && !slice.pending ? (
                  <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
                    <p className="text-sm font-medium text-foreground">
                      No open insights
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Regenerate for a fresh Wandz AI Insights set, or pick a
                      question below.
                    </p>
                  </div>
                ) : null}
                {dismissed.length > 0 ? (
                  <p className="text-center text-[11px] text-muted-foreground">
                    {dismissed.length} dismissed
                  </p>
                ) : null}
              </div>
            )}
          </section>

          {/* A/B category accordions — GA Insights pattern */}
          <section className="space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Browse by topic
            </h2>
            <Accordion
              type="multiple"
              value={openCategories}
              onValueChange={setOpenCategories}
              className="space-y-2"
            >
              {categories.map((cat) => {
                const Icon = ACCORDION_ICON[cat.id];
                return (
                  <AccordionItem
                    key={cat.id}
                    value={cat.id}
                    className="overflow-hidden rounded-md border border-border bg-background px-0 shadow-none"
                  >
                    <AccordionTrigger
                      className={cn(
                        "px-3.5 py-3 hover:no-underline data-[state=open]:bg-muted/60"
                      )}
                    >
                      <span className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                        <Icon
                          className="h-4 w-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        {cat.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 pt-0">
                      <ul className="border-t border-border">
                        {cat.questions.map((q, i) => (
                          <li key={q.id}>
                            <button
                              type="button"
                              className={cn(
                                "w-full px-3.5 py-3 text-left text-sm leading-snug text-foreground transition-colors hover:bg-muted/50",
                                i > 0 && "border-t border-border",
                                selectedQuestion?.id === q.id && "bg-muted/40"
                              )}
                              onClick={() => setSelectedQuestion(q)}
                            >
                              {q.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </section>
        </div>
      </div>
    </div>
  );
}
