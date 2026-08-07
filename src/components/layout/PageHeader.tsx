import type { LucideIcon } from "lucide-react";

export default function PageHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-3 px-12 pt-10">
      {Icon && (
        <Icon
          className="h-6 w-6 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden
        />
      )}
      <h1 className="font-title text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
    </div>
  );
}
