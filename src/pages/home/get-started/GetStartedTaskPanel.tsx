/** Get Started — Basic Setup task rows (screenshot layout). */

import { CheckCircle2, Lock, Zap } from "@/components/icons/protoLucide";
import { Badge } from "@/components/ui/badge";
import type { GetStartedTask } from "@/data/getStarted";
import { cn } from "@/lib/utils";

type GetStartedTaskPanelProps = {
  label: string;
  durationLabel?: string;
  tasks: GetStartedTask[];
  activeTaskId: string | null;
  onTaskSelect: (id: string) => void;
};

function TaskRow({
  task,
  selected,
  onSelect,
}: {
  task: GetStartedTask;
  selected: boolean;
  onSelect: () => void;
}) {
  const completed = task.status === "completed";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-md border border-border bg-background px-4 py-3.5 text-left transition-colors",
        completed && "border-b-2 border-b-success-solid",
        selected && "bg-secondary",
        !selected && "hover:bg-muted/50"
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {task.restricted && (
          <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <span className="text-sm font-medium text-foreground">{task.label}</span>
        {task.restricted && (
          <Badge tone="neutral" fill="light" size="sm">
            Not allowed for your role
          </Badge>
        )}
      </div>
      {completed ? (
        <CheckCircle2
          className="size-4 shrink-0 text-success-fg"
          aria-label="Completed"
        />
      ) : task.duration ? (
        <span className="shrink-0 text-sm text-muted-foreground">
          {task.duration}
        </span>
      ) : null}
    </button>
  );
}

export default function GetStartedTaskPanel({
  label,
  durationLabel,
  tasks,
  activeTaskId,
  onTaskSelect,
}: GetStartedTaskPanelProps) {
  return (
    <div className="min-w-0 flex-1 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-success-bg text-success-fg">
            <Zap className="size-4" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold text-foreground">{label}</h2>
        </div>
        {durationLabel && (
          <p className="text-sm italic text-muted-foreground">{durationLabel}</p>
        )}
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskRow
              task={task}
              selected={activeTaskId === task.id}
              onSelect={() => onTaskSelect(task.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
