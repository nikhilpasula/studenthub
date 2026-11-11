import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskForm } from "@/components/dashboard/task-form";
import { TaskList } from "@/components/dashboard/task-list";
import { CheckSquare } from "lucide-react";

export const metadata = {
  title: "Tasks & Assignments | StudentHub",
  description: "Manage your academic tasks, homework, and priorities.",
};

export default async function TasksPage() {
  const user = await requireUser();

  const [tasks, courses] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
      ],
    }),
    prisma.course.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Title & Description */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <CheckSquare className="size-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Tasks &amp; Assignments
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Track deadlines, organize coursework tasks, and keep up with your academic priorities.
        </p>
      </div>

      {/* Task Creation Form */}
      <TaskForm courses={courses} />

      {/* Task List */}
      <TaskList tasks={tasks} />
    </div>
  );
}
