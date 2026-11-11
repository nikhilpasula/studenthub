"use client";

import { useState, useTransition } from "react";
import { format, isPast, isToday } from "date-fns";
import { deleteGoal } from "@/lib/actions/goals";
import { GoalItem } from "./goal-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit3,
  Trash2,
  Loader2,
  TrendingUp,
} from "lucide-react";

interface GoalListProps {
  goals: GoalItem[];
  onEditGoal?: (goal: GoalItem) => void;
}

const statusBadges = {
  ACTIVE: {
    label: "Active",
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  ABANDONED: {
    label: "Abandoned",
    className: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
  },
};

export function GoalList({ goals, onEditGoal }: GoalListProps) {
  const [isPending, startTransition] = useTransition();
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  const filteredGoals = goals.filter((g) => {
    if (filter === "ACTIVE") return g.status === "ACTIVE";
    if (filter === "COMPLETED") return g.status === "COMPLETED";
    return true;
  });

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete goal: "${title}"?`)) return;
    setActiveGoalId(id);
    startTransition(async () => {
      try {
        await deleteGoal(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete goal");
      } finally {
        setActiveGoalId(null);
      }
    });
  };

  const totalCount = goals.length;
  const activeCount = goals.filter((g) => g.status === "ACTIVE").length;
  const completedCount = goals.filter((g) => g.status === "COMPLETED").length;

  return (
    <div className="space-y-4">
      {/* Header and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Academic &amp; Career Goals
          </h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted font-medium">
            {completedCount}/{totalCount} Completed
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

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Target className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No goals found</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                {filter === "ALL"
                  ? "Set your first academic or semester target to keep yourself accountable and track your progress."
                  : `You don't have any ${filter.toLowerCase()} goals right now.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => {
            const isDeleting = isPending && activeGoalId === goal.id;
            const targetDateObj = goal.targetDate ? new Date(goal.targetDate) : null;
            const isOverdue =
              targetDateObj &&
              goal.status === "ACTIVE" &&
              isPast(targetDateObj) &&
              !isToday(targetDateObj);

            const badgeConfig = statusBadges[goal.status] || statusBadges.ACTIVE;

            return (
              <Card
                key={goal.id}
                className="group flex flex-col justify-between border border-border/70 bg-card hover:border-primary/40 hover:shadow-xs transition-all overflow-hidden"
              >
                <div>
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {goal.title}
                      </CardTitle>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badgeConfig.className}`}
                      >
                        {badgeConfig.label}
                      </span>
                    </div>

                    {/* Target Date */}
                    {targetDateObj && (
                      <div className="flex items-center gap-1.5 text-[11px] pt-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        <span
                          className={
                            isOverdue
                              ? "text-red-500 font-semibold flex items-center gap-1"
                              : "text-muted-foreground"
                          }
                        >
                          {isOverdue && <AlertCircle className="size-3" />}
                          {isOverdue
                            ? `Overdue (${format(targetDateObj, "MMM d, yyyy")})`
                            : `Target: ${format(targetDateObj, "MMM d, yyyy")}`}
                        </span>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3.5 pb-3">
                    {/* Progress Bar & Percentage */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <TrendingUp className="size-3.5 text-primary" />
                          Progress
                        </span>
                        <span className="font-bold text-foreground">
                          {goal.progress}%
                        </span>
                      </div>

                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            goal.progress === 100
                              ? "bg-emerald-500"
                              : goal.progress >= 50
                              ? "bg-primary"
                              : "bg-blue-400"
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    {goal.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/20 p-2.5 rounded-lg border border-border/30">
                        {goal.description}
                      </p>
                    )}
                  </CardContent>
                </div>

                {/* Footer Controls */}
                <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {goal.status === "COMPLETED" ? (
                      <span className="text-emerald-500 flex items-center gap-1 font-medium text-[11px]">
                        <CheckCircle2 className="size-3.5" /> Accomplished
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="size-3.5" /> In progress
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onEditGoal?.(goal)}
                      aria-label="Edit goal"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Edit3 className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(goal.id, goal.title)}
                      disabled={isDeleting}
                      aria-label="Delete goal"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      {isDeleting ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
