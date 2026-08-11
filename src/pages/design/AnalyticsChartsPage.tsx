import { BarChart3 } from "@/components/icons/protoLucide";
import PageHeader from "../../components/layout/PageHeader";
import AnalyticsChartGallery from "../../components/layout/AnalyticsChartGallery";

export default function AnalyticsChartsPage() {
  return (
    <div className="flex min-h-full flex-col pb-16">
      <PageHeader title="Analytics charts" icon={BarChart3} />

      <div className="mx-auto w-full max-w-6xl space-y-8 px-12 pt-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Chart types common in product analytics tools like Mixpanel and
            Amplitude. Colors use the{" "}
            <span className="font-medium text-foreground">chart token pack</span>{" "}
            (categorical, sequential, diverging, and chrome roles).
          </p>
        </div>

        <AnalyticsChartGallery />
      </div>
    </div>
  );
}
