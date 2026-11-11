import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  username: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9_-]*$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .optional()
    .nullable(),
  bio: z.string().trim().max(500, "Bio must be under 500 characters").optional().nullable(),
  college: z.string().trim().optional().nullable(),
  branch: z.string().trim().optional().nullable(),
  year: z.number().int().min(1).max(8).optional().nullable(),
  github: z.string().trim().optional().nullable(),
  linkedin: z.string().trim().optional().nullable(),
  twitter: z.string().trim().optional().nullable(),
  isPortfolioPublic: z.boolean(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
