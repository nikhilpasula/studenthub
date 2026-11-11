import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotesView } from "@/components/dashboard/notes-view";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Course Notes | StudentHub",
  description: "Create, organize, and review your markdown study notes.",
};

export default async function NotesPage() {
  const user = await requireUser();

  const [notes, courses] = await Promise.all([
    prisma.note.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="size-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Course &amp; Study Notes
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Write and review rich markdown notes with tags, key formulas, and lecture takeaways.
        </p>
      </div>

      {/* Notes interactive workspace */}
      <NotesView notes={notes} courses={courses} />
    </div>
  );
}
