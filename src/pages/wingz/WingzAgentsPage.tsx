import {
  BarChart3,
  Bot,
  CirclePlus,
  Flame,
  TrendingUp,
} from "@/components/icons/protoLucide";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TEMPLATES = [
  {
    id: "campaign-overview",
    title: "Campaign Overview",
    description:
      "Tracks your A/B tests and delivers behavior analytics on performance, winners, and recommendations.",
    icon: TrendingUp,
  },
  {
    id: "weekly-report",
    title: "Weekly Behavior Analytics Report",
    description:
      "Generates weekly summaries of your optimization campaigns with key metrics and actionable behavior analytics.",
    icon: BarChart3,
  },
  {
    id: "heatmap-analyzer",
    title: "Heatmap & Behavior Analyzer",
    description:
      "Analyzes heatmap data and user behavior patterns to uncover optimization opportunities.",
    icon: Flame,
  },
] as const;

export default function WingzAgentsPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-16">
      <PageHeader title="Agents" icon={Bot} />

      <div className="space-y-12 px-12 pt-8">
        <section className="flex flex-col items-center rounded-xl border border-dashed border-border bg-background px-8 py-14 text-center">
          <span className="mb-5 flex size-12 items-center justify-center rounded-xl border border-border bg-background text-foreground shadow-sm">
            <Bot className="size-6" aria-hidden />
          </span>
          <h2 className="font-title text-xl font-semibold tracking-tight text-foreground">
            Welcome to Wingz Agents
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Build AI agents that work for you — analyze data, generate behavior
            analytics, and deliver automated reports, all customized to your
            optimization goals.
          </p>
          <Button type="button" className="mt-7 gap-2">
            <CirclePlus className="size-4" aria-hidden />
            Create your agent
          </Button>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="font-title text-lg font-semibold tracking-tight text-foreground">
              Start with a template
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a pre-built agent, customize it to your needs, and start
              exploring.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <Card
                  key={template.id}
                  className="flex flex-col border-border bg-background shadow-none"
                >
                  <CardContent className="flex flex-1 flex-col gap-4 p-5">
                    <span className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-semibold text-foreground">
                        {template.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    <div className="mt-auto pt-2">
                      <Button type="button" variant="outline" size="sm">
                        Use now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
