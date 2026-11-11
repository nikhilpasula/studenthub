import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CalendarView,
  CalendarEventItem,
  CalendarTaskItem,
} from "@/components/dashboard/calendar-view";

export const metadata = {
  title: "Academic Calendar & Schedule | StudentHub",
  description: "View and organize your classes, exams, assignments, and homework deadlines.",
};

export default async function CalendarPage() {
  const user = await requireUser();

  const [rawEvents, rawTasks] = await Promise.all([
    prisma.event.findMany({
      where: { userId: user.id },
      orderBy: { startTime: "asc" },
    }),
    prisma.task.findMany({
      where: {
        userId: user.id,
        dueDate: { not: null },
      },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const events: CalendarEventItem[] = rawEvents.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    startTime: e.startTime.toISOString(),
    endTime: e.endTime.toISOString(),
    allDay: e.allDay,
    category: e.category,
    location: e.location,
    color: e.color,
  }));

  const tasks: CalendarTaskItem[] = rawTasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    dueDate: t.dueDate!.toISOString(),
    priority: t.priority,
    status: t.status,
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <CalendarView events={events} tasks={tasks} />
    </div>
  );
}
