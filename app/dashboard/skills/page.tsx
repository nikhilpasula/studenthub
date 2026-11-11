import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SkillsView } from "@/components/dashboard/skills-view";
import { SkillItem } from "@/components/dashboard/skill-form";
import { Award } from "lucide-react";

export const metadata = {
  title: "Skills & Proficiencies | StudentHub",
  description: "Track and organize your technical skills, developer tools, and programming competencies.",
};

export default async function SkillsPage() {
  const user = await requireUser();

  const rawSkills = await prisma.skill.findMany({
    where: {
      userId: user.id,
    },
    orderBy: [
      { category: "asc" },
      { level: "desc" },
    ],
  });

  const skills: SkillItem[] = rawSkills.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    level: s.level,
    isPublic: s.isPublic,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Award className="size-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Skills &amp; Competencies
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Group your technical proficiencies, languages, and frameworks for your portfolio resume.
        </p>
      </div>

      {/* Skills View */}
      <SkillsView skills={skills} />
    </div>
  );
}
