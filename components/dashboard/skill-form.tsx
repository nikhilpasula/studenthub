"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillSchema, SkillInput, SkillLevel } from "@/lib/validations/skill";
import { createSkill, updateSkill } from "@/lib/actions/skills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Award, Plus, Edit3, Loader2, X, Globe } from "lucide-react";

export interface SkillItem {
  id: string;
  name: string;
  category: string | null;
  level: SkillLevel;
  isPublic: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface SkillFormProps {
  skillToEdit?: SkillItem | null;
  onFinishEdit?: () => void;
}

const categoryPresets = [
  "Languages",
  "Frontend",
  "Backend",
  "Databases",
  "Cloud & DevOps",
  "Tools & Platforms",
  "Soft Skills",
  "General",
];

export function SkillForm({ skillToEdit, onFinishEdit }: SkillFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(skillToEdit?.isPublic ?? true);

  const isEditing = Boolean(skillToEdit);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SkillInput>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: skillToEdit?.name || "",
      category: skillToEdit?.category || "Languages",
      level: skillToEdit?.level || "INTERMEDIATE",
      isPublic: skillToEdit?.isPublic ?? true,
    },
  });

  const handleTogglePublic = (checked: boolean) => {
    setIsPublic(checked);
    setValue("isPublic", checked);
  };

  const onSubmit = (data: SkillInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        if (isEditing && skillToEdit) {
          await updateSkill(skillToEdit.id, data);
          onFinishEdit?.();
        } else {
          await createSkill(data);
          reset({
            name: "",
            category: "Languages",
            level: "INTERMEDIATE",
            isPublic: true,
          });
          setIsPublic(true);
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to save skill"
        );
      }
    });
  };

  const handleCancel = () => {
    if (onFinishEdit) {
      onFinishEdit();
    } else {
      reset();
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
              <span>Edit Skill</span>
            </>
          ) : (
            <>
              <Plus className="size-4 text-primary" />
              <span>Add Technical or Core Skill</span>
            </>
          )}
        </CardTitle>

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Skill Name */}
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="name">Skill Name *</Label>
              <Input
                id="name"
                placeholder="e.g., TypeScript, Python, Docker"
                {...register("name")}
                disabled={isPending}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                list="category-suggestions"
                placeholder="e.g., Frontend or Languages"
                {...register("category")}
                disabled={isPending}
              />
              <datalist id="category-suggestions">
                {categoryPresets.map((preset) => (
                  <option key={preset} value={preset} />
                ))}
              </datalist>
            </div>

            {/* Level */}
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="level">Proficiency Level</Label>
              <select
                id="level"
                {...register("level")}
                disabled={isPending}
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-card"
              >
                <option value="BEGINNER">Beginner (Foundational)</option>
                <option value="INTERMEDIATE">Intermediate (Competent)</option>
                <option value="ADVANCED">Advanced (Proficient)</option>
                <option value="EXPERT">Expert (Mastery)</option>
              </select>
            </div>
          </div>

          {/* Visibility toggle & action button row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-border/50">
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => handleTogglePublic(e.target.checked)}
                  disabled={isPending}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="size-3" />
                <span>Show publicly on student portfolio</span>
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
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
                      <Award className="size-3.5" />
                    )}
                    <span>{isEditing ? "Update Skill" : "Save Skill"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
