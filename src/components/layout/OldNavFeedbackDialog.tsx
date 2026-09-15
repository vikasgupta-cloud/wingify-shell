// @summary Two-column feedback dialog for “Switch to old Navigation”.
// Left: benefits of new nav + deprecation date. Right: reason form (confirm is a no-op stub).
// Mounted from ExpandedNav so closing the JD flyout does not unmount it.
import { useEffect, useState } from "react";
import { Check } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const OLD_NAV_REASONS = [
  { value: "prefer-layout", label: "I prefer the previous layout" },
  { value: "harder-to-find", label: "Harder to find things in the new navigation" },
  { value: "missing-features", label: "Missing features from the old navigation" },
  { value: "familiarity", label: "More familiar with the old design" },
  { value: "performance", label: "The new navigation feels slower" },
  { value: "other", label: "Other" },
] as const;

const NEW_NAV_BENEFITS = [
  "Faster switching between products",
  "Breadcrumbs for help and quick navigation",
  "Cleaner, clutter-free UI",
  "Pin and unpin items in the navigation",
] as const;

const OLD_NAV_DEPRECATION_DATE = "October 30, 2026";

export default function OldNavFeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setDetails("");
    }
  }, [open]);

  const confirmFeedback = () => {
    // Stub: collect feedback only — do not switch navigation.
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0 sm:rounded-lg">
        <div className="grid min-h-[360px] md:grid-cols-2">
          {/* Benefits + deprecation */}
          <aside className="flex flex-col gap-5 border-b border-border bg-muted/40 p-6 md:border-b-0 md:border-r">
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">
                Why stay with the new navigation
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Built to help you move faster across products with less clutter.
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              {NEW_NAV_BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2.5 text-sm text-foreground"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-foreground">
                    <Check className="size-3" strokeWidth={2.25} aria-hidden />
                  </span>
                  <span className="leading-snug">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto rounded-md border border-border bg-background px-3.5 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
                Old navigation ends
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {OLD_NAV_DEPRECATION_DATE}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                After this date, the previous navigation will no longer be
                available.
              </p>
            </div>
          </aside>

          {/* Feedback form */}
          <div className="flex flex-col gap-5 p-6">
            <DialogHeader className="space-y-1.5 text-left">
              <DialogTitle>Switch to old Navigation?</DialogTitle>
              <DialogDescription>
                Tell us why you want to go back. Your feedback helps us improve.
              </DialogDescription>
            </DialogHeader>

            <div className="grid flex-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="old-nav-reason">Reason</Label>
                <Select value={reason || undefined} onValueChange={setReason}>
                  <SelectTrigger id="old-nav-reason" className="w-full">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {OLD_NAV_REASONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="old-nav-details">Additional feedback</Label>
                <Textarea
                  id="old-nav-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Add more detail (optional)"
                  className="min-h-[120px] resize-y"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="button" disabled={!reason} onClick={confirmFeedback}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
