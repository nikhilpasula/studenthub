"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { eventSchema, EventInput } from "@/lib/validations/event";

export async function createEvent(data: EventInput) {
  const user = await requireUser();
  const validated = eventSchema.parse(data);

  const event = await prisma.event.create({
    data: {
      userId: user.id,
      title: validated.title,
      description: validated.description?.trim() || null,
      startTime: new Date(validated.startTime),
      endTime: new Date(validated.endTime),
      allDay: validated.allDay,
      category: validated.category,
      location: validated.location?.trim() || null,
      color: validated.color?.trim() || null,
    },
  });

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
  return { success: true, event };
}

export async function deleteEvent(id: string) {
  const user = await requireUser();

  const existing = await prisma.event.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Event not found or unauthorized");
  }

  await prisma.event.delete({
    where: {
      id: existing.id,
    },
  });

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}
