import { z } from "zod";

export const habitFrequencyEnum = z.enum(["DAILY", "WEEKLY"]);

export const habitSchema = z.object({
  name: z.string().trim().min(1, "Habit name is required"),
  description: z.string().trim().optional().nullable(),
  frequency: habitFrequencyEnum,
  targetPerWeek: z.number().int().min(1).max(7).optional().nullable(),
  color: z.string().trim().optional().nullable(),
});

export type HabitInput = z.infer<typeof habitSchema>;
export type HabitFrequency = z.infer<typeof habitFrequencyEnum>;
