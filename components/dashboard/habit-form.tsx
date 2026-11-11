"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { habitSchema, HabitInput, HabitFrequency } from "@/lib/validations/habit";
import { createHabit } from "@/lib/actions/habits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Flame, Plus, Loader2 } from "lucide-react";

export interface HabitLogItem {
  id: string;
  date: string;
  completed: boolean;
}

export interface HabitItem {
  id: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  targetPerWeek: number | null;
  color: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  logs: HabitLogItem[];
  isCompletedToday: boolean;
  streakCount: number;
}

const colorPresets = [
  { label: "Emerald", color: "#10b981" },
  { label: "Blue", color: "#3b82f6" },
  { label: "Purple", color: "#8b5cf6" },
  { label: "Amber", color: "#f59e0b" },
  { label: "Rose", color: "#f43f5e" },
  { label: "Indigo", color: "#6366f1" },
];

export function HabitForm() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(colorPresets[0].color);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<HabitInput>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
      description: "",
      frequency: "DAILY",
      targetPerWeek: 7,
      color: colorPresets[0].color,
    },
  });

  const handleColorSelect = (col: string) => {
    setSelectedColor(col);
    setValue("color", col);
  };

  const onSubmit = (data: HabitInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await createHabit(data);
        reset({
          name: "",
          description: "",
          frequency: "DAILY",
          targetPerWeek: 7,
          color: colorPresets[0].color,
        });
        setSelectedColor(colorPresets[0].color);
        setIsExpanded(false);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to create habit"
        );
      }
    });
  };

  return (
    <Card className="border border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Flame className="size-4 text-primary" />
          <span>Track New Habit</span>
        </CardTitle>

        {!isExpanded && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
          >
            Expand Details
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

          {/* Habit Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Habit Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Read Research Papers for 30 Mins, Revise DSA LeetCode"
              {...register("name")}
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Expanded fields */}
          {isExpanded && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <Label htmlFor="description">Why this habit? / Description</Label>
                <Textarea
                  id="description"
                  placeholder="Set context, target goals, or personal motivation..."
                  rows={2}
                  {...register("description")}
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="frequency">Frequency</Label>
                  <select
                    id="frequency"
                    {...register("frequency")}
                    disabled={isPending}
                    className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-card"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="targetPerWeek">Target Days / Week</Label>
                  <Input
                    id="targetPerWeek"
                    type="number"
                    min="1"
                    max="7"
                    placeholder="e.g., 5 or 7"
                    {...register("targetPerWeek", {
                      setValueAs: (v) =>
                        v === "" || v === null || isNaN(Number(v)) ? null : Number(v),
                    })}
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-1.5">
                <Label>Habit Color Accent</Label>
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
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            {isExpanded && (
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

            <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  <span>Add Habit</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
