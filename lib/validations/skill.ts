import { z } from "zod";

export const skillLevelEnum = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
]);

export const skillSchema = z.object({
  name: z.string().trim().min(1, "Skill name is required"),
  category: z.string().trim().optional().nullable(),
  level: skillLevelEnum,
  isPublic: z.boolean(),
});

export type SkillInput = z.infer<typeof skillSchema>;
export type SkillLevel = z.infer<typeof skillLevelEnum>;
