import { z } from "zod";

export const projectStatusEnum = z.enum([
  "PLANNING",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
]);

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Project title is required"),
  description: z.string().trim().optional().nullable(),
  techStack: z.array(z.string()),
  role: z.string().trim().optional().nullable(),
  githubUrl: z.string().trim().optional().nullable(),
  liveUrl: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  status: projectStatusEnum,
  isPublic: z.boolean(),
  featured: z.boolean(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectStatus = z.infer<typeof projectStatusEnum>;
