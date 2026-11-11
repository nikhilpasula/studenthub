import { z } from "zod";

export const eventCategoryEnum = z.enum([
  "CLASS",
  "EXAM",
  "ASSIGNMENT",
  "MEETING",
  "PERSONAL",
  "OTHER",
]);

export const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  allDay: z.boolean(),
  category: eventCategoryEnum,
  location: z.string().optional(),
  color: z.string().optional(),
});

export type EventInput = z.infer<typeof eventSchema>;
export type EventCategory = z.infer<typeof eventCategoryEnum>;
