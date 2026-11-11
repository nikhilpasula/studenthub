"use client";

import { useState, useTransition } from "react";
import { deleteCourse } from "@/lib/actions/courses";
import { CourseItem } from "./course-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  BookOpen,
  User,
  Calendar,
  Award,
  CheckSquare,
  FileText,
  Edit3,
  Trash2,
  Loader2,
} from "lucide-react";

interface CourseListProps {
  courses: CourseItem[];
  onEditCourse?: (course: CourseItem) => void;
}

export function CourseList({ courses, onEditCourse }: CourseListProps) {
  const [isPending, startTransition] = useTransition();
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    setActiveCourseId(id);
    startTransition(async () => {
      try {
        await deleteCourse(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete course");
      } finally {
        setActiveCourseId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Enrolled Courses
          </h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted font-medium">
            {courses.length} {courses.length === 1 ? "Course" : "Courses"}
          </span>
        </div>
      </div>

      {/* Courses Grid or Empty State */}
      {courses.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <BookOpen className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No courses added yet</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Add your current academic subjects, courses, and modules to connect your assignments, study notes, and lecture materials.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const isDeleting = isPending && activeCourseId === course.id;
            const accentColor = course.color || "#3b82f6";

            return (
              <Card
                key={course.id}
                className="group flex flex-col justify-between border border-border/70 bg-card hover:border-primary/40 hover:shadow-xs transition-all overflow-hidden"
              >
                <div>
                  {/* Top Color Accent Line */}
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: accentColor }}
                  />

                  <CardHeader className="pb-2 pt-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        {course.code && (
                          <span
                            className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-white"
                            style={{ backgroundColor: accentColor }}
                          >
                            {course.code}
                          </span>
                        )}
                        <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {course.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-3 text-xs">
                    {/* Course Metadata (Instructor, Semester, Credits) */}
                    <div className="space-y-1.5 text-muted-foreground">
                      {course.instructor && (
                        <div className="flex items-center gap-1.5">
                          <User className="size-3.5 text-foreground/70 shrink-0" />
                          <span className="truncate">{course.instructor}</span>
                        </div>
                      )}

                      {course.semester && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-foreground/70 shrink-0" />
                          <span>{course.semester}</span>
                        </div>
                      )}

                      {course.credits !== null && course.credits !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <Award className="size-3.5 text-foreground/70 shrink-0" />
                          <span>{course.credits} Credits</span>
                        </div>
                      )}
                    </div>

                    {/* Course Description */}
                    {course.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 bg-muted/20 p-2 rounded-md border border-border/30">
                        {course.description}
                      </p>
                    )}

                    {/* Linked Tasks and Notes Badges */}
                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        <CheckSquare className="size-3" />
                        <span>{course._count?.tasks ?? 0} Tasks</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        <FileText className="size-3" />
                        <span>{course._count?.notes ?? 0} Notes</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Footer Actions */}
                <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEditCourse?.(course)}
                    aria-label="Edit course"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    <Edit3 className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDelete(course.id, course.name)}
                    disabled={isDeleting}
                    aria-label="Delete course"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    {isDeleting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
