/** Playground account banner — sits above TopBar on every route when Demo Workspace is active. */

import { ExternalLink } from "@/components/icons/protoLucide";
import {
  PLAYGROUND_WEBSITE_URL,
  useIsPlaygroundWorkspace,
} from "@/store/workspace";

export default function PlaygroundBanner() {
  const show = useIsPlaygroundWorkspace();
  if (!show) return null;

  return (
    <div
      role="status"
      className="flex shrink-0 items-center justify-center gap-2 border-b border-border bg-[color-mix(in_srgb,var(--canvas)_90%,var(--foreground)_10%)] px-4 py-1.5 text-center text-xs text-foreground"
    >
      <span>
        You&apos;re in a Playground account. Explore demos freely — visit the{" "}
        <a
          href={PLAYGROUND_WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-foreground"
        >
          Playground website
          <ExternalLink className="size-3" aria-hidden />
        </a>
        .
      </span>
    </div>
  );
}
