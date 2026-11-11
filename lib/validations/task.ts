import { z } from "zod";

export const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]);

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: taskPriorityEnum,
  status: taskStatusEnum,
  courseId: z.string().optional().nullable(),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskPriority = z.infer<typeof taskPriorityEnum>;
export type TaskStatus = z.infer<typeof taskStatusEnum>;
