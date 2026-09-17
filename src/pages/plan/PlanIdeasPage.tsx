/** Plan → Ideas. Tabs only for v1; body uses the shared coming-soon blank. */
import { useState } from "react";
import { Sparkles } from "@/components/icons/protoLucide";
import ComingSoonState from "@/components/empty/ComingSoonState";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const IDEA_TABS = [
  { id: "wingz", label: "Wingz Generated", icon: true },
  { id: "gallery", label: "Ideas Gallery", icon: false },
  { id: "cases", label: "Case Studies", icon: false },
  { id: "resources", label: "Resources and Articles", icon: false },
] as const;

export default function PlanIdeasPage() {
  const [tab, setTab] = useState<(typeof IDEA_TABS)[number]["id"]>("wingz");
  const activeLabel =
    IDEA_TABS.find((item) => item.id === tab)?.label ?? "Ideas";

  return (
    <div className="flex min-h-full flex-col">
      <div className="shrink-0 border-b border-border bg-background px-8 pt-4">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as (typeof IDEA_TABS)[number]["id"])}
        >
          <TabsList className="h-auto w-full justify-start gap-1 rounded-none bg-transparent p-0">
            {IDEA_TABS.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className={cn(
                  "gap-1.5 rounded-none border-b-2 border-transparent px-3 pb-3 pt-1 text-sm data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  item.id === "wingz" &&
                    "data-[state=active]:border-[var(--status-analysis-fg)] data-[state=active]:text-[var(--status-analysis-fg)]"
                )}
              >
                {item.icon ? (
                  <Sparkles className="size-3.5" strokeWidth={1.75} aria-hidden />
                ) : null}
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <ComingSoonState title={activeLabel} icon={Sparkles} />
    </div>
  );
}
