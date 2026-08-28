/** Get Started — in-page footer links + wordmark (screenshot layout). */

import {
  Activity,
  BookOpen,
  LifeBuoy,
  Plug,
  Users,
} from "@/components/icons/protoLucide";

const footerLinkClass =
  "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground";

export default function GetStartedPageFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-background px-12 py-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <button type="button" className={footerLinkClass}>
            <LifeBuoy className="size-3.5" aria-hidden />
            Get Support
          </button>
          <button type="button" className={footerLinkClass}>
            <BookOpen className="size-3.5" aria-hidden />
            Developer resources
          </button>
          <span className={footerLinkClass}>
            +1-415-909-4660
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <button type="button" className={footerLinkClass}>
            <Users className="size-3.5" aria-hidden />
            Show logged in users
          </button>
          <button type="button" className={footerLinkClass}>
            <Activity className="size-3.5" aria-hidden />
            Uptime Status
          </button>
          <button type="button" className={footerLinkClass}>
            <Plug className="size-3.5" aria-hidden />
            Branch Information
          </button>
        </div>

        <p className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          wingify
        </p>
      </div>
    </footer>
  );
}
