"use client";

import { useState, useTransition } from "react";
import { format, subDays } from "date-fns";
import { toggleHabitToday, deleteHabit } from "@/lib/actions/habits";
import { HabitItem } from "./habit-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Flame,
  Check,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";

interface HabitListProps {
  habits: HabitItem[];
}

export function HabitList({ habits }: HabitListProps) {
  const [isPending, startTransition] = useTransition();
  const [activeHabitId, setActiveHabitId] = useState<string | null>(null);

  // Generate last 7 days array for visual consistency tracking
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      dateStr: format(d, "yyyy-MM-dd"),
      dayLabel: format(d, "EEE")[0], // 'M', 'T', 'W'...
      isToday: i === 6,
    };
  });

  const handleToggle = (id: string) => {
    setActiveHabitId(id);
    startTransition(async () => {
      try {
        await toggleHabitToday(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to log habit");
      } finally {
        setActiveHabitId(null);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete habit: "${name}"?`)) return;
    setActiveHabitId(id);
    startTransition(async () => {
      try {
        await deleteHabit(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete habit");
      } finally {
        setActiveHabitId(null);
      }
    });
  };

  const completedTodayCount = habits.filter((h) => h.isCompletedToday).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            My Daily Habits
          </h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted font-medium">
            {completedTodayCount}/{habits.length} Done Today
          </span>
        </div>
      </div>

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Flame className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No habits created yet</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Build positive study rituals, track daily revision, and maintain accountability streaks.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => {
            const isHabitPending = isPending && activeHabitId === habit.id;
            const accentColor = habit.color || "#10b981";
            const loggedDatesSet = new Set(
              habit.logs.map((l) => l.date.split("T")[0])
            );

            return (
              <Card
                key={habit.id}
                className="group flex flex-col justify-between border border-border/70 bg-card hover:border-primary/40 hover:shadow-xs transition-all overflow-hidden"
              >
                <div>
                  {/* Top Color Accent Line */}
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: accentColor }}
                  />

                  <CardHeader className="pb-2 pt-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-bold text-foreground line-clamp-1">
                          {habit.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="px-1.5 py-0.2 rounded bg-muted font-medium">
                            {habit.frequency}
                          </span>
                          {habit.targetPerWeek && (
                            <span>Target: {habit.targetPerWeek}d/wk</span>
                          )}
                        </div>
                      </div>

                      {/* Streak Badge */}
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                        <Flame className="size-3.5 fill-amber-500 text-amber-500" />
                        <span>{habit.streakCount}d</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3.5 pb-3">
                    {/* Description */}
                    {habit.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/20 p-2 rounded-md border border-border/30">
                        {habit.description}
                      </p>
                    )}

                    {/* 7-Day History Bubbles */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Past 7 Days
                      </span>
                      <div className="flex items-center justify-between gap-1">
                        {last7Days.map((day) => {
                          const isDoneOnDay = loggedDatesSet.has(day.dateStr);

                          return (
                            <div
                              key={day.dateStr}
                              className="flex flex-col items-center gap-1"
                            >
                              <span className="text-[10px] text-muted-foreground font-medium">
                                {day.dayLabel}
                              </span>
                              <div
                                className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                  isDoneOnDay
                                    ? "bg-emerald-500 text-white shadow-xs"
                                    : day.isToday
                                    ? "border-2 border-dashed border-primary/50 text-muted-foreground bg-primary/5"
                                    : "bg-muted/60 text-muted-foreground/50 border border-border/50"
                                }`}
                              >
                                {isDoneOnDay ? (
                                  <Check className="size-3 stroke-[3]" />
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Primary "Log Today" Action Button */}
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant={habit.isCompletedToday ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggle(habit.id)}
                        disabled={isHabitPending}
                        className={`w-full gap-2 transition-all font-semibold ${
                          habit.isCompletedToday
                            ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                            : "shadow-xs"
                        }`}
                      >
                        {isHabitPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : habit.isCompletedToday ? (
                          <>
                            <Check className="size-4 stroke-[3]" />
                            <span>Done for Today! (Click to undo)</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-4" />
                            <span>Mark Done Today</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </div>

                {/* Footer Controls */}
                <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{habit.logs.length} total completions</span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDelete(habit.id, habit.name)}
                    disabled={isHabitPending}
                    aria-label="Delete habit"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    {isHabitPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
