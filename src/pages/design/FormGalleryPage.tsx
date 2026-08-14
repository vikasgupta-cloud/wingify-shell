import { FileText } from "@/components/icons/protoLucide";
import PageHeader from "../../components/layout/PageHeader";
import FormGallery from "../../components/layout/FormGallery";

export default function FormGalleryPage() {
  return (
    <div className="flex min-h-full flex-col pb-16">
      <PageHeader title="Form elements" icon={FileText} />

      <div className="mx-auto w-full max-w-6xl space-y-8 px-12 pt-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Inputs, selects, comboboxes, badges, dialogs, tooltips, sliders,
            radios, checkboxes, switches, and the rest of the form set — laid
            out as a campaign setup, so theme and CTA tokens read the way they
            do in product.
          </p>
        </div>

        <FormGallery />
      </div>
    </div>
  );
}
