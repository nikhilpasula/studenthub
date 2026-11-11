import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().min(1, "Content cannot be empty"),
  courseId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export type NoteInput = z.infer<typeof noteSchema>;
