/** Dashboard trial-expired alert — shown above Meet Wandz when Trial Over workspace is active. */

import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { useIsTrialOverWorkspace } from "@/store/workspace";

export default function TrialExpiredBanner() {
  const show = useIsTrialOverWorkspace();
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div
      role="alert"
      className="flex flex-col gap-4 rounded-lg border border-danger-fg/25 bg-danger-bg px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <AlertTriangle
          className="mt-0.5 size-4 shrink-0 text-danger-fg"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-danger-fg">
            Free Trial has expired.
          </p>
          <p className="mt-1 text-sm leading-relaxed text-danger-fg/80">
            Your Wingify Free Trial has expired and all your campaigns have been
            paused. Purchase now to keep optimizing your website.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="shrink-0 self-start hover:bg-background sm:self-center"
        onClick={() => navigate("/upgrade")}
      >
        Purchase Now
      </Button>
    </div>
  );
}
