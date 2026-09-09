// @summary Help / support popover — Knowledge Base + Raise Ticket stubs + contact links.
// Opens from main-nav Help and detail utility-rail Help (same pattern as Activity).
import {
  cloneElement,
  useState,
  type ReactElement,
} from "react";
import {
  BookOpen,
  ChevronRight,
  LifeBuoy,
} from "@/components/icons/protoLucide";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const SUPPORT_PHONE = "+1-415-909-4660";
const SUPPORT_EMAIL = "support@wingify.com";

function HelpActionRow({
  icon: Icon,
  label,
}: {
  icon: typeof BookOpen;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-3 text-left transition-colors hover:bg-muted"
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-foreground"
        aria-hidden
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
        {label}
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden
      />
    </button>
  );
}

function HelpPopoverContent() {
  return (
    <div className="w-[min(22rem,calc(100vw-2rem))] bg-popover">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          For Technical Queries
        </h2>
      </header>

      <div className="space-y-2 px-4 py-3">
        <HelpActionRow icon={BookOpen} label="Wingify Knowledge Base" />
        <HelpActionRow icon={LifeBuoy} label="Raise a Support Ticket" />
      </div>

      <footer className="border-t border-border px-4 py-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          You can also reach Wingify Support at
        </p>
        <div className="mt-2 flex flex-col gap-1">
          <a
            href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}
            className="text-sm font-medium text-link hover:text-link-hover hover:underline"
          >
            {SUPPORT_PHONE}
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-sm font-medium text-link hover:text-link-hover hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function HelpSupportPopover({
  children,
  side = "right",
  align = "end",
}: {
  children: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}) {
  const [open, setOpen] = useState(false);

  const trigger = cloneElement(children, {
    "aria-expanded": open,
    "aria-haspopup": "dialog",
    className: cn(
      (children.props as { className?: string }).className,
      open && "bg-muted hover:bg-muted"
    ),
  } as Partial<typeof children.props> & {
    "aria-expanded": boolean;
    "aria-haspopup": string;
    className: string;
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={10}
        collisionPadding={12}
        className="z-50 w-auto max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-lg border border-border bg-popover p-0 text-popover-foreground shadow-lg"
      >
        <HelpPopoverContent />
      </PopoverContent>
    </Popover>
  );
}
