"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema, CourseInput } from "@/lib/validations/course";
import { createCourse, updateCourse } from "@/lib/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Plus, Edit3, Loader2, X } from "lucide-react";

export interface CourseItem {
  id: string;
  name: string;
  code: string | null;
  instructor: string | null;
  semester: string | null;
  credits: number | null;
  description: string | null;
  color: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    tasks: number;
    notes: number;
  };
}

interface CourseFormProps {
  courseToEdit?: CourseItem | null;
  onFinishEdit?: () => void;
}

const colorPresets = [
  { label: "Blue", color: "#3b82f6" },
  { label: "Emerald", color: "#10b981" },
  { label: "Purple", color: "#8b5cf6" },
  { label: "Amber", color: "#f59e0b" },
  { label: "Rose", color: "#f43f5e" },
  { label: "Cyan", color: "#06b6d4" },
  { label: "Indigo", color: "#6366f1" },
  { label: "Slate", color: "#64748b" },
];

export function CourseForm({ courseToEdit, onFinishEdit }: CourseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(Boolean(courseToEdit));
  const [selectedColor, setSelectedColor] = useState<string>(
    courseToEdit?.color || colorPresets[0].color
  );

  const isEditing = Boolean(courseToEdit);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: courseToEdit?.name || "",
      code: courseToEdit?.code || "",
      instructor: courseToEdit?.instructor || "",
      semester: courseToEdit?.semester || "",
      credits: courseToEdit?.credits ?? null,
      description: courseToEdit?.description || "",
      color: courseToEdit?.color || colorPresets[0].color,
    },
  });

  const handleColorSelect = (col: string) => {
    setSelectedColor(col);
    setValue("color", col);
  };

  const onSubmit = (data: CourseInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        if (isEditing && courseToEdit) {
          await updateCourse(courseToEdit.id, data);
          onFinishEdit?.();
        } else {
          await createCourse(data);
          reset({
            name: "",
            code: "",
            instructor: "",
            semester: "",
            credits: null,
            description: "",
            color: colorPresets[0].color,
          });
          setSelectedColor(colorPresets[0].color);
          setIsExpanded(false);
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to save course"
        );
      }
    });
  };

  const handleCancel = () => {
    if (onFinishEdit) {
      onFinishEdit();
    } else {
      reset();
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
              <span>Edit Course</span>
            </>
          ) : (
            <>
              <Plus className="size-4 text-primary" />
              <span>Add New Course</span>
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

          {/* Course Name (always visible) */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Course Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Data Structures & Algorithms"
              {...register("name")}
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Expanded details */}
          {(isExpanded || isEditing) && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="code">Course Code</Label>
                  <Input
                    id="code"
                    placeholder="e.g., CS201"
                    {...register("code")}
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    placeholder="e.g., Dr. Jane Smith"
                    {...register("instructor")}
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="semester">Semester / Term</Label>
                  <Input
                    id="semester"
                    placeholder="e.g., Fall 2026"
                    {...register("semester")}
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="0"
                    max="30"
                    placeholder="e.g., 4"
                    {...register("credits", {
                      setValueAs: (v) =>
                        v === "" || v === null || isNaN(Number(v)) ? null : Number(v),
                    })}
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Course Color Accent */}
              <div className="space-y-1.5">
                <Label>Course Accent Color</Label>
                <div className="flex items-center gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => handleColorSelect(preset.color)}
                      className={`size-6 rounded-full border-2 transition-all ${
                        selectedColor === preset.color
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: preset.color }}
                      aria-label={`Select ${preset.label} accent`}
                    />
                  ))}
                </div>
              </div>

              {/* Description / Syllabus */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Description / Syllabus</Label>
                <Textarea
                  id="description"
                  placeholder="Key topics, office hours, grading policy..."
                  rows={2}
                  {...register("description")}
                  disabled={isPending}
                />
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
                  <span>{isEditing ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  {isEditing ? <Edit3 className="size-3.5" /> : <BookOpen className="size-3.5" />}
                  <span>{isEditing ? "Update Course" : "Save Course"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
