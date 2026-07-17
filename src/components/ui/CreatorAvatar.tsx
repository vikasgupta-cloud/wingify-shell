import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// Deterministic dummy photo per creator, with an initials fallback and a
// tooltip carrying the full name.
export default function CreatorAvatar({
  name,
  size = 24,
}: {
  name: string;
  size?: number;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar
            className="rounded-full"
            style={{ width: size, height: size }}
            aria-label={name}
          >
            <AvatarImage
              src={`https://i.pravatar.cc/64?u=${encodeURIComponent(name)}`}
              alt={name}
            />
            <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side="top">{name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
