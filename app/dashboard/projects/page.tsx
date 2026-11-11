import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectsView } from "@/components/dashboard/projects-view";
import { ProjectItem } from "@/components/dashboard/project-form";
import { FolderGit2 } from "lucide-react";

export const metadata = {
  title: "Portfolio Projects | StudentHub",
  description: "Manage and showcase your development, design, and academic projects.",
};

export default async function ProjectsPage() {
  const user = await requireUser();

  const rawProjects = await prisma.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: [
      { featured: "desc" },
      { createdAt: "desc" },
    ],
  });

  const projects: ProjectItem[] = rawProjects.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    techStack: p.techStack,
    role: p.role,
    githubUrl: p.githubUrl,
    liveUrl: p.liveUrl,
    imageUrl: p.imageUrl,
    status: p.status,
    isPublic: p.isPublic,
    featured: p.featured,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FolderGit2 className="size-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Portfolio Projects
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Document your software applications, research initiatives, and open-source contributions.
        </p>
      </div>

      {/* Projects interactive workspace */}
      <ProjectsView projects={projects} />
    </div>
  );
}
