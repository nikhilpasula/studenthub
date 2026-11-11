import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskList } from "@/components/dashboard/task-list";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  BookOpen,
  Flame,
  Target,
  Globe,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Dashboard Overview | StudentHub",
  description: "Productivity metrics, tasks summary, and upcoming deadlines.",
};

export default async function DashboardPage() {
  const user = await requireUser();

  const [totalTasks, completedTasks, pendingTasks, highPriorityTasks, recentTasks] =
    await Promise.all([
      prisma.task.count({
        where: { userId: user.id },
      }),
      prisma.task.count({
        where: { userId: user.id, status: "DONE" },
      }),
      prisma.task.count({
        where: { userId: user.id, status: { not: "DONE" } },
      }),
      prisma.task.count({
        where: {
          userId: user.id,
          status: { not: "DONE" },
          priority: { in: ["HIGH", "URGENT"] },
        },
      }),
      prisma.task.findMany({
        where: { userId: user.id },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }],
        take: 5,
      }),
    ]);

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {user.name || "Student"}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            {pendingTasks === 0
              ? "All caught up! You have no pending tasks right now."
              : `You have ${pendingTasks} pending ${pendingTasks === 1 ? "task" : "tasks"} to tackle.`}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/dashboard/tasks">
            <Button className="gap-2 shadow-xs">
              Manage Tasks <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Portfolio Alert Banner if Public */}
      {user.isPortfolioPublic && user.username && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Globe className="size-3.5" />
            </div>
            <span>
              Your public student portfolio is live and verified at{" "}
              <Link
                href={`/@${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary underline underline-offset-2"
              >
                /@{user.username}
              </Link>
            </span>
          </div>
          <Link
            href={`/@${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline self-start sm:self-auto"
          >
            <span>View Public Profile</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <Card className="border border-border/70 hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Tasks
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <CheckSquare className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalTasks}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Assignments &amp; todos</p>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="border border-border/70 hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pending
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingTasks}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Remaining to finish</p>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card className="border border-border/70 hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Completed
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completedTasks}</div>
            <p className="text-[11px] text-muted-foreground mt-1">{completionRate}% completion rate</p>
          </CardContent>
        </Card>

        {/* High / Urgent Priority */}
        <Card className="border border-border/70 hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              High / Urgent
            </CardTitle>
            <div className="size-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
              <AlertTriangle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{highPriorityTasks}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/dashboard/tasks" className="group">
          <div className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckSquare className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Tasks &amp; Homework</h3>
                <p className="text-xs text-muted-foreground">Manage your assignments</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        <Link href="/dashboard/calendar" className="group">
          <div className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Schedule &amp; Calendar</h3>
                <p className="text-xs text-muted-foreground">View upcoming class events</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        <Link href="/dashboard/courses" className="group">
          <div className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Course Hub</h3>
                <p className="text-xs text-muted-foreground">Manage semester subjects</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        <Link href="/dashboard/notes" className="group">
          <div className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Course Notes</h3>
                <p className="text-xs text-muted-foreground">Access your study material</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        <Link href="/dashboard/habits" className="group">
          <div className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Flame className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Daily Habits</h3>
                <p className="text-xs text-muted-foreground">Lock in study streaks</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        <Link href="/dashboard/goals" className="group">
          <div className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Target className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Target Goals</h3>
                <p className="text-xs text-muted-foreground">Track semester milestones</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>
      </div>

      {/* Recent Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Recent Tasks Preview</h2>
          <Link href="/dashboard/tasks">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <span>View All Tasks</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        <TaskList tasks={recentTasks} />
      </div>
    </div>
  );
}
