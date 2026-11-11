import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoalsView } from "@/components/dashboard/goals-view";
import { Target } from "lucide-react";

export const metadata = {
  title: "Academic & Career Goals | StudentHub",
  description: "Track your semester objectives, GPA milestones, and study goals with live progress bars.",
};

export default async function GoalsPage() {
  const user = await requireUser();

  const rawGoals = await prisma.goal.findMany({
    where: {
      userId: user.id,
    },
    orderBy: [
      { status: "asc" },
      { targetDate: "asc" },
    ],
  });

  const goals = rawGoals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    targetDate: g.targetDate ? g.targetDate.toISOString() : null,
    status: g.status,
    progress: g.progress,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Target className="size-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Goals &amp; Milestones
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Define measurable study goals, set target completion dates, and track your progress percentage.
        </p>
      </div>

      {/* Goals View */}
      <GoalsView goals={goals} />
    </div>
  );
}
