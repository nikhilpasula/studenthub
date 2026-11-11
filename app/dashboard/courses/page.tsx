import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CoursesView } from "@/components/dashboard/courses-view";
import { BookOpen } from "lucide-react";

export const metadata = {
  title: "Course Hub | StudentHub",
  description: "Organize your academic subjects, course credits, instructors, and syllabus.",
};

export default async function CoursesPage() {
  const user = await requireUser();

  const courses = await prisma.course.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          tasks: true,
          notes: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="size-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Academic Courses &amp; Modules
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Track semester subjects, instructors, and credit units, and link tasks and study notes to each course.
        </p>
      </div>

      {/* Courses View */}
      <CoursesView courses={courses} />
    </div>
  );
}
