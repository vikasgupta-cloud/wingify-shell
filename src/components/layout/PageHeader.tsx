import type { LucideIcon } from "lucide-react";

export default function PageHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-2.5 pt-10 pl-12">
      {Icon && <Icon className="h-6 w-6 shrink-0 text-foreground" aria-hidden />}
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
    </div>
  );
}
