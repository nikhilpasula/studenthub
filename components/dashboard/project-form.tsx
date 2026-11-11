"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, ProjectInput, ProjectStatus } from "@/lib/validations/project";
import { createProject, updateProject } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FolderGit2, Plus, Edit3, Loader2, X, Star, Globe } from "lucide-react";

export interface ProjectItem {
  id: string;
  title: string;
  description: string | null;
  techStack: string[];
  role: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  imageUrl: string | null;
  status: ProjectStatus;
  isPublic: boolean;
  featured: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ProjectFormProps {
  projectToEdit?: ProjectItem | null;
  onFinishEdit?: () => void;
}

export function ProjectForm({ projectToEdit, onFinishEdit }: ProjectFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(Boolean(projectToEdit));

  const isEditing = Boolean(projectToEdit);

  const [techStackInput, setTechStackInput] = useState<string>(
    projectToEdit?.techStack?.join(", ") || ""
  );
  const [isPublic, setIsPublic] = useState<boolean>(projectToEdit?.isPublic ?? true);
  const [isFeatured, setIsFeatured] = useState<boolean>(projectToEdit?.featured ?? false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: projectToEdit?.title || "",
      description: projectToEdit?.description || "",
      techStack: projectToEdit?.techStack || [],
      role: projectToEdit?.role || "",
      githubUrl: projectToEdit?.githubUrl || "",
      liveUrl: projectToEdit?.liveUrl || "",
      imageUrl: projectToEdit?.imageUrl || "",
      status: projectToEdit?.status || "PLANNING",
      isPublic: projectToEdit?.isPublic ?? true,
      featured: projectToEdit?.featured ?? false,
    },
  });

  const handleTechStackChange = (val: string) => {
    setTechStackInput(val);
    const parsed = val
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setValue("techStack", parsed);
  };

  const handleTogglePublic = (checked: boolean) => {
    setIsPublic(checked);
    setValue("isPublic", checked);
  };

  const handleToggleFeatured = (checked: boolean) => {
    setIsFeatured(checked);
    setValue("featured", checked);
  };

  const onSubmit = (data: ProjectInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        if (isEditing && projectToEdit) {
          await updateProject(projectToEdit.id, data);
          onFinishEdit?.();
        } else {
          await createProject(data);
          reset({
            title: "",
            description: "",
            techStack: [],
            role: "",
            githubUrl: "",
            liveUrl: "",
            imageUrl: "",
            status: "PLANNING",
            isPublic: true,
            featured: false,
          });
          setTechStackInput("");
          setIsPublic(true);
          setIsFeatured(false);
          setIsExpanded(false);
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to save project"
        );
      }
    });
  };

  const handleCancel = () => {
    if (onFinishEdit) {
      onFinishEdit();
    } else {
      reset();
      setTechStackInput("");
      setIsExpanded(false);
      setErrorMessage(null);
    }
  };

  return (
    <Card className="border border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {isEditing ? (
            <>
              <Edit3 className="size-4 text-primary" />
              <span>Edit Portfolio Project</span>
            </>
          ) : (
            <>
              <Plus className="size-4 text-primary" />
              <span>Add New Project</span>
            </>
          )}
        </CardTitle>

        {!isEditing && !isExpanded && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
          >
            Expand Details
          </Button>
        )}

        {isEditing && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleCancel}
            className="gap-1 text-xs"
          >
            <X className="size-3.5" />
            <span>Cancel</span>
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {errorMessage}
            </div>
          )}

          {/* Project Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              placeholder="e.g., StudentHub - Collaborative Academic Platform"
              {...register("title")}
              disabled={isPending}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Expanded Section */}
          {(isExpanded || isEditing) && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="What does this project do, what challenges were solved, and what impact was achieved?"
                  rows={3}
                  {...register("description")}
                  disabled={isPending}
                />
              </div>

              {/* Tech Stack */}
              <div className="space-y-1.5">
                <Label htmlFor="techStack">Technologies &amp; Libraries (Comma-separated)</Label>
                <Input
                  id="techStack"
                  placeholder="e.g., Next.js, TypeScript, PostgreSQL, Tailwind CSS, Prisma"
                  value={techStackInput}
                  onChange={(e) => handleTechStackChange(e.target.value)}
                  disabled={isPending}
                />
              </div>

              {/* Role & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="role">Your Role</Label>
                  <Input
                    id="role"
                    placeholder="e.g., Full Stack Developer / Team Lead"
                    {...register("role")}
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status">Development Status</Label>
                  <select
                    id="status"
                    {...register("status")}
                    disabled={isPending}
                    className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-card"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* Links Row: GitHub & Live Demo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="githubUrl">GitHub Repository URL</Label>
                  <Input
                    id="githubUrl"
                    placeholder="https://github.com/username/project"
                    {...register("githubUrl")}
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="liveUrl">Live Demo URL</Label>
                  <Input
                    id="liveUrl"
                    placeholder="https://myproject.vercel.app"
                    {...register("liveUrl")}
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Toggles Row: Public & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 text-primary" />
                    <div>
                      <span className="text-xs font-semibold text-foreground block">
                        Public on Portfolio
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        Visible on your public student page
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => handleTogglePublic(e.target.checked)}
                      disabled={isPending}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Star className="size-4 text-amber-500" />
                    <div>
                      <span className="text-xs font-semibold text-foreground block">
                        Featured Project
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        Highlighted at the top of your portfolio
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => handleToggleFeatured(e.target.checked)}
                      disabled={isPending}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            {!isEditing && isExpanded && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                disabled={isPending}
              >
                Simple Mode
              </Button>
            )}

            {isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
              >
                Discard
              </Button>
            )}

            <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{isEditing ? "Updating..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  {isEditing ? (
                    <Edit3 className="size-3.5" />
                  ) : (
                    <FolderGit2 className="size-3.5" />
                  )}
                  <span>{isEditing ? "Update Project" : "Save Project"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
