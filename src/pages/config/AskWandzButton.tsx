import { Sparkles } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// A small ghost Sparkles button used beside section/field labels. Opens the
// Wandz chat sheet via the onClick supplied by each section.
export default function AskWandzButton({
  label = "Ask Wandz",
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            onClick={onClick}
            className="h-6 w-6 text-muted-foreground [&_svg]:size-3.5"
          >
            <Sparkles />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
