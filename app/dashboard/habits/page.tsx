import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HabitsView } from "@/components/dashboard/habits-view";
import { HabitItem } from "@/components/dashboard/habit-form";
import { Flame } from "lucide-react";
import { subDays, format } from "date-fns";

export const metadata = {
  title: "Habit Tracker | StudentHub",
  description: "Build consistent daily study routines, track streaks, and maintain academic discipline.",
};

function calculateStreak(loggedDateStrings: Set<string>): number {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");

  // If not completed today or yesterday, streak is 0
  let currentCheck = loggedDateStrings.has(todayStr)
    ? new Date()
    : loggedDateStrings.has(yesterdayStr)
    ? subDays(new Date(), 1)
    : null;

  if (!currentCheck) return 0;

  let streak = 0;
  while (true) {
    const checkStr = format(currentCheck, "yyyy-MM-dd");
    if (loggedDateStrings.has(checkStr)) {
      streak++;
      currentCheck = subDays(currentCheck, 1);
    } else {
      break;
    }
  }

  return streak;
}

export default async function HabitsPage() {
  const user = await requireUser();

  const rawHabits = await prisma.habit.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      logs: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const habits: HabitItem[] = rawHabits.map((h) => {
    const serializedLogs = h.logs.map((l) => ({
      id: l.id,
      date: l.date.toISOString(),
      completed: l.completed,
    }));

    const dateStrings = new Set(
      h.logs.map((l) => l.date.toISOString().split("T")[0])
    );

    const isCompletedToday = dateStrings.has(todayStr);
    const streakCount = calculateStreak(dateStrings);

    return {
      id: h.id,
      name: h.name,
      description: h.description,
      frequency: h.frequency,
      targetPerWeek: h.targetPerWeek,
      color: h.color,
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
      logs: serializedLogs,
      isCompletedToday,
      streakCount,
    };
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Flame className="size-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Habit Tracker
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Track daily rituals, lock in your study habits, and keep your consistency streak alive.
        </p>
      </div>

      {/* Habits View */}
      <HabitsView habits={habits} />
    </div>
  );
}
