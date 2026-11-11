"use client";

import { useState, useTransition } from "react";
import { toggleTask, deleteTask } from "@/lib/actions/tasks";
import { format, isPast, isToday } from "date-fns";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Calendar as CalendarIcon,
  AlertCircle,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SerializedTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  completedAt?: string | Date | null;
  createdAt: string | Date;
}

interface TaskListProps {
  tasks: SerializedTask[];
}

const priorityBadges = {
  URGENT: {
    label: "Urgent",
    className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  },
  HIGH: {
    label: "High",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  LOW: {
    label: "Low",
    className: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
  },
};

export function TaskList({ tasks }: TaskListProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "ACTIVE") return task.status !== "DONE";
    if (filter === "COMPLETED") return task.status === "DONE";
    return true;
  });

  const handleToggle = (id: string) => {
    setActiveTaskId(id);
    startTransition(async () => {
      try {
        await toggleTask(id);
      } finally {
        setActiveTaskId(null);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setActiveTaskId(id);
    startTransition(async () => {
      try {
        await deleteTask(id);
      } finally {
        setActiveTaskId(null);
      }
    });
  };

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === "DONE").length;
  const activeCount = totalCount - completedCount;

  return (
    <div className="space-y-4">
      {/* Header and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            My Tasks
          </h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted font-medium">
            {completedCount}/{totalCount} Done
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Button
            type="button"
            variant={filter === "ALL" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilter("ALL")}
          >
            All ({totalCount})
          </Button>
          <Button
            type="button"
            variant={filter === "ACTIVE" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilter("ACTIVE")}
          >
            Active ({activeCount})
          </Button>
          <Button
            type="button"
            variant={filter === "COMPLETED" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilter("COMPLETED")}
          >
            Completed ({completedCount})
          </Button>
        </div>
      </div>

      {/* Task List or Empty State */}
      {filteredTasks.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <ClipboardList className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No tasks found</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                {filter === "ALL"
                  ? "You don't have any tasks scheduled. Use the form above to add your first assignment or task."
                  : `You don't have any ${filter.toLowerCase()} tasks right now.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === "DONE";
            const isTaskPending = isPending && activeTaskId === task.id;
            const priorityConfig = priorityBadges[task.priority] || priorityBadges.MEDIUM;

            const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
            const isOverdue = dueDateObj && !isCompleted && isPast(dueDateObj) && !isToday(dueDateObj);
            const isDueToday = dueDateObj && !isCompleted && isToday(dueDateObj);

            return (
              <div
                key={task.id}
                className={cn(
                  "group flex items-start gap-3 p-3.5 rounded-xl border border-border/70 bg-card transition-all hover:border-border hover:shadow-xs",
                  isCompleted && "bg-muted/30 border-border/40 opacity-75"
                )}
              >
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggle(task.id)}
                  disabled={isTaskPending}
                  aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                  className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isTaskPending ? (
                    <Loader2 className="size-5 animate-spin text-primary" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="size-5 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Circle className="size-5 hover:text-primary" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "text-sm font-medium text-foreground break-words",
                        isCompleted && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={cn(
                        "inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] font-semibold border",
                        priorityConfig.className
                      )}
                    >
                      {priorityConfig.label}
                    </span>
                  </div>

                  {task.description && (
                    <p
                      className={cn(
                        "text-xs text-muted-foreground line-clamp-2",
                        isCompleted && "line-through opacity-70"
                      )}
                    >
                      {task.description}
                    </p>
                  )}

                  {/* Due Date Indicator */}
                  {dueDateObj && (
                    <div className="flex items-center gap-1 text-[11px] pt-0.5">
                      <CalendarIcon className="size-3 text-muted-foreground" />
                      <span
                        className={cn(
                          "font-medium",
                          isOverdue
                            ? "text-red-500 flex items-center gap-1"
                            : isDueToday
                            ? "text-amber-500"
                            : "text-muted-foreground"
                        )}
                      >
                        {isOverdue && <AlertCircle className="size-3" />}
                        {isDueToday
                          ? "Due Today"
                          : `Due ${format(dueDateObj, "MMM d, yyyy")}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions: Delete Button */}
                <div className="shrink-0 flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDelete(task.id)}
                    disabled={isTaskPending}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label="Delete task"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
