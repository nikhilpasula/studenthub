"use client";

import { useState, useTransition } from "react";
import { deleteSkill } from "@/lib/actions/skills";
import { SkillItem } from "./skill-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Award,
  Globe,
  Lock,
  Edit3,
  Trash2,
  Loader2,
} from "lucide-react";

interface SkillListProps {
  skills: SkillItem[];
  onEditSkill?: (skill: SkillItem) => void;
}

const levelConfigs = {
  BEGINNER: {
    label: "Beginner",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    bars: 1,
  },
  INTERMEDIATE: {
    label: "Intermediate",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    bars: 2,
  },
  ADVANCED: {
    label: "Advanced",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    bars: 3,
  },
  EXPERT: {
    label: "Expert",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    bars: 4,
  },
};

export function SkillList({ skills, onEditSkill }: SkillListProps) {
  const [isPending, startTransition] = useTransition();
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PUBLIC">("ALL");

  const filteredSkills = skills.filter((s) => {
    if (filter === "PUBLIC") return s.isPublic;
    return true;
  });

  // Group skills by category
  const groupedSkills = filteredSkills.reduce<Record<string, SkillItem[]>>(
    (acc, skill) => {
      const cat = skill.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    },
    {}
  );

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete skill: "${name}"?`)) return;
    setActiveSkillId(id);
    startTransition(async () => {
      try {
        await deleteSkill(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete skill");
      } finally {
        setActiveSkillId(null);
      }
    });
  };

  const categories = Object.keys(groupedSkills);
  const totalCount = skills.length;
  const publicCount = skills.filter((s) => s.isPublic).length;

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Core Competencies &amp; Skills
          </h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted font-medium">
            {publicCount}/{totalCount} Public
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant={filter === "ALL" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilter("ALL")}
          >
            All ({totalCount})
          </Button>
          <Button
            type="button"
            variant={filter === "PUBLIC" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilter("PUBLIC")}
          >
            Public ({publicCount})
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {categories.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Award className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No skills recorded</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Add programming languages, frameworks, developer tools, and certifications to build your verified skill matrix.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Categorized Groups */
        <div className="space-y-6">
          {categories.map((category) => {
            const items = groupedSkills[category];

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    {category}
                  </h3>
                  <span className="text-[10px] text-muted-foreground px-2 py-0.2 rounded-full bg-muted font-semibold">
                    {items.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((skill) => {
                    const isDeleting = isPending && activeSkillId === skill.id;
                    const config = levelConfigs[skill.level] || levelConfigs.INTERMEDIATE;

                    return (
                      <div
                        key={skill.id}
                        className="group flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-xs transition-all"
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-foreground truncate">
                              {skill.name}
                            </span>
                            <span
                              className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold border ${config.className}`}
                            >
                              {config.label}
                            </span>
                          </div>

                          {/* Level visual bar (1-4 ticks) */}
                          <div className="flex items-center gap-1 pt-0.5">
                            {[1, 2, 3, 4].map((tick) => (
                              <div
                                key={tick}
                                className={`h-1.5 w-4 rounded-full ${
                                  tick <= config.bars
                                    ? "bg-primary"
                                    : "bg-muted"
                                }`}
                              />
                            ))}
                            <span className="text-[10px] text-muted-foreground ml-1">
                              {skill.isPublic ? (
                                <Globe className="size-2.5 inline text-emerald-500" />
                              ) : (
                                <Lock className="size-2.5 inline text-muted-foreground" />
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onEditSkill?.(skill)}
                            aria-label="Edit skill"
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Edit3 className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(skill.id, skill.name)}
                            disabled={isDeleting}
                            aria-label="Delete skill"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            {isDeleting ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
