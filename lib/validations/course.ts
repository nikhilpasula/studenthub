import { z } from "zod";

export const courseSchema = z.object({
  name: z.string().trim().min(1, "Course name is required"),
  code: z.string().trim().optional().nullable(),
  instructor: z.string().trim().optional().nullable(),
  semester: z.string().trim().optional().nullable(),
  credits: z.number().int().min(0).max(30).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  color: z.string().trim().optional().nullable(),
});

export type CourseInput = z.infer<typeof courseSchema>;
