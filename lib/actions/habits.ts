"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { habitSchema, HabitInput } from "@/lib/validations/habit";

function getNormalizedToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function createHabit(data: HabitInput) {
  const user = await requireUser();
  const validated = habitSchema.parse(data);

  const habit = await prisma.habit.create({
    data: {
      userId: user.id,
      name: validated.name,
      description: validated.description?.trim() || null,
      frequency: validated.frequency,
      targetPerWeek: validated.targetPerWeek,
      color: validated.color?.trim() || null,
    },
  });

  revalidatePath("/dashboard/habits");
  revalidatePath("/dashboard");
  return { success: true, habit };
}

export async function toggleHabitToday(habitId: string) {
  const user = await requireUser();

  const habit = await prisma.habit.findFirst({
    where: {
      id: habitId,
      userId: user.id,
    },
  });

  if (!habit) {
    throw new Error("Habit not found or unauthorized");
  }

  const todayDate = getNormalizedToday();

  const existingLog = await prisma.habitLog.findUnique({
    where: {
      userId_habitId_date: {
        userId: user.id,
        habitId: habit.id,
        date: todayDate,
      },
    },
  });

  let loggedToday = false;
  if (existingLog) {
    // If already logged today, toggle it off (delete log)
    try {
      await prisma.habitLog.delete({
        where: {
          id: existingLog.id,
        },
      });
      loggedToday = false;
    } catch {
      // Safely handle concurrent delete
      loggedToday = false;
    }
  } else {
    // Log habit completed for today
    try {
      await prisma.habitLog.create({
        data: {
          userId: user.id,
          habitId: habit.id,
          date: todayDate,
          completed: true,
        },
      });
      loggedToday = true;
    } catch {
      // If unique constraint @@unique([userId, habitId, date]) fails due to double-click race condition, safely treat as completed
      loggedToday = true;
    }
  }

  revalidatePath("/dashboard/habits");
  revalidatePath("/dashboard");
  return { success: true, loggedToday };
}

export async function deleteHabit(id: string) {
  const user = await requireUser();

  const existing = await prisma.habit.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Habit not found or unauthorized");
  }

  await prisma.habit.delete({
    where: { id: existing.id },
  });

  revalidatePath("/dashboard/habits");
  revalidatePath("/dashboard");
  return { success: true };
}
