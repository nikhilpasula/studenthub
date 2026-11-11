import { z } from "zod";

export const goalStatusEnum = z.enum(["ACTIVE", "COMPLETED", "ABANDONED"]);

export const goalSchema = z.object({
  title: z.string().trim().min(1, "Goal title is required"),
  description: z.string().trim().optional().nullable(),
  targetDate: z.string().optional().nullable(),
  status: goalStatusEnum,
  progress: z.number().int().min(0).max(100),
});

export type GoalInput = z.infer<typeof goalSchema>;
export type GoalStatus = z.infer<typeof goalStatusEnum>;
