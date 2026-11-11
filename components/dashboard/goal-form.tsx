"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { goalSchema, GoalInput, GoalStatus } from "@/lib/validations/goal";
import { createGoal, updateGoal } from "@/lib/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Target, Plus, Edit3, Loader2, X } from "lucide-react";

export interface GoalItem {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | Date | null;
  status: GoalStatus;
  progress: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface GoalFormProps {
  goalToEdit?: GoalItem | null;
  onFinishEdit?: () => void;
}

export function GoalForm({ goalToEdit, onFinishEdit }: GoalFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(Boolean(goalToEdit));

  const isEditing = Boolean(goalToEdit);

  const initialTargetDate = goalToEdit?.targetDate
    ? format(new Date(goalToEdit.targetDate), "yyyy-MM-dd")
    : "";

  const [currentProgress, setCurrentProgress] = useState<number>(
    goalToEdit?.progress ?? 0
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goalToEdit?.title || "",
      description: goalToEdit?.description || "",
      targetDate: initialTargetDate,
      status: goalToEdit?.status || "ACTIVE",
      progress: goalToEdit?.progress ?? 0,
    },
  });

  const handleProgressChange = (val: number) => {
    setCurrentProgress(val);
    setValue("progress", val);
  };

  const onSubmit = (data: GoalInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        if (isEditing && goalToEdit) {
          await updateGoal(goalToEdit.id, data);
          onFinishEdit?.();
        } else {
          await createGoal(data);
          reset({
            title: "",
            description: "",
            targetDate: "",
            status: "ACTIVE",
            progress: 0,
          });
          setCurrentProgress(0);
          setIsExpanded(false);
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to save goal"
        );
      }
    });
  };

  const handleCancel = () => {
    if (onFinishEdit) {
      onFinishEdit();
    } else {
      reset();
      setCurrentProgress(0);
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
              <span>Edit Academic Goal</span>
            </>
          ) : (
            <>
              <Plus className="size-4 text-primary" />
              <span>Set New Goal</span>
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

          {/* Goal Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Score 9.0+ GPA this semester or Learn Next.js 16"
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
                <Label htmlFor="description">Description &amp; Action Plan</Label>
                <Textarea
                  id="description"
                  placeholder="Steps to achieve this goal, milestones, resources..."
                  rows={2}
                  {...register("description")}
                  disabled={isPending}
                />
              </div>

              {/* Target Date & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="targetDate">Target Completion Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    {...register("targetDate")}
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status">Goal Status</Label>
                  <select
                    id="status"
                    {...register("status")}
                    disabled={isPending}
                    className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-card"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ABANDONED">Abandoned</option>
                  </select>
                </div>
              </div>

              {/* Progress Slider (0-100%) */}
              <div className="space-y-2 p-3.5 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <Label htmlFor="progress-slider" className="font-semibold text-xs">
                    Current Progress:
                  </Label>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {currentProgress}%
                  </span>
                </div>

                <input
                  id="progress-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={currentProgress}
                  onChange={(e) => handleProgressChange(Number(e.target.value))}
                  disabled={isPending}
                  className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0% (Just started)</span>
                  <span>50% (Halfway)</span>
                  <span>100% (Done)</span>
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
                    <Target className="size-3.5" />
                  )}
                  <span>{isEditing ? "Update Goal" : "Save Goal"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
