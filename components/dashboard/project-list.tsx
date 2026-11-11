"use client";

import { useState, useTransition } from "react";
import { deleteProject } from "@/lib/actions/projects";
import { ProjectItem } from "./project-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  FolderGit2,
  Code2,
  ExternalLink,
  Star,
  Globe,
  Lock,
  Edit3,
  Trash2,
  Loader2,
} from "lucide-react";

interface ProjectListProps {
  projects: ProjectItem[];
  onEditProject?: (project: ProjectItem) => void;
}

const statusBadges = {
  PLANNING: {
    label: "Planning",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
};

export function ProjectList({ projects, onEditProject }: ProjectListProps) {
  const [isPending, startTransition] = useTransition();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "FEATURED" | "PUBLIC">("ALL");

  const filteredProjects = projects.filter((p) => {
    if (filter === "FEATURED") return p.featured;
    if (filter === "PUBLIC") return p.isPublic;
    return true;
  });

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete project: "${title}"?`)) return;
    setActiveProjectId(id);
    startTransition(async () => {
      try {
        await deleteProject(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete project");
      } finally {
        setActiveProjectId(null);
      }
    });
  };

  const totalCount = projects.length;
  const featuredCount = projects.filter((p) => p.featured).length;
  const publicCount = projects.filter((p) => p.isPublic).length;

  return (
    <div className="space-y-4">
      {/* Header and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Portfolio Projects
          </h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted font-medium">
            {publicCount}/{totalCount} Public
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
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
            variant={filter === "FEATURED" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilter("FEATURED")}
          >
            Featured ({featuredCount})
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

      {/* Projects Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <FolderGit2 className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No projects found</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                {filter === "ALL"
                  ? "Add your academic projects, hackathon prototypes, and open source work to showcase on your portfolio."
                  : `You don't have any ${filter.toLowerCase()} projects right now.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const isDeleting = isPending && activeProjectId === project.id;
            const statusConfig = statusBadges[project.status] || statusBadges.PLANNING;

            return (
              <Card
                key={project.id}
                className="group flex flex-col justify-between border border-border/70 bg-card hover:border-primary/40 hover:shadow-xs transition-all overflow-hidden"
              >
                <div>
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {project.featured && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              <Star className="size-3 fill-amber-500" />
                              Featured
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] font-semibold border ${statusConfig.className}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>

                        <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {project.title}
                        </CardTitle>

                        {project.role && (
                          <p className="text-xs text-muted-foreground font-medium">
                            {project.role}
                          </p>
                        )}
                      </div>

                      {/* Visibility indicator */}
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          project.isPublic
                            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                            : "text-muted-foreground bg-muted"
                        }`}
                      >
                        {project.isPublic ? (
                          <>
                            <Globe className="size-2.5" /> Public
                          </>
                        ) : (
                          <>
                            <Lock className="size-2.5" /> Private
                          </>
                        )}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-3 text-xs">
                    {/* Description */}
                    {project.description && (
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                    )}

                    {/* Tech Stack Pills */}
                    {project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary text-secondary-foreground border border-border/40"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* Footer Links & Actions */}
                <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-medium transition-colors"
                      >
                        <Code2 className="size-3.5" />
                        <span>Code</span>
                      </a>
                    )}

                    {project.githubUrl && project.liveUrl && (
                      <span className="text-muted-foreground/40">•</span>
                    )}

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium transition-colors"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onEditProject?.(project)}
                      aria-label="Edit project"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Edit3 className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(project.id, project.title)}
                      disabled={isDeleting}
                      aria-label="Delete project"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      {isDeleting ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
