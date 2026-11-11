"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { goalSchema, GoalInput } from "@/lib/validations/goal";

export async function createGoal(data: GoalInput) {
  const user = await requireUser();
  const validated = goalSchema.parse(data);

  const status = validated.progress === 100 ? "COMPLETED" : validated.status;

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: validated.title,
      description: validated.description?.trim() || null,
      targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
      status,
      progress: validated.progress,
    },
  });

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
  return { success: true, goal };
}

export async function updateGoal(id: string, data: GoalInput) {
  const user = await requireUser();
  const validated = goalSchema.parse(data);

  const existing = await prisma.goal.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Goal not found or unauthorized");
  }

  // If progress is set to 100%, automatically change status to COMPLETED
  let nextStatus = validated.status;
  if (validated.progress === 100) {
    nextStatus = "COMPLETED";
  }

  const updated = await prisma.goal.update({
    where: { id: existing.id },
    data: {
      title: validated.title,
      description: validated.description?.trim() || null,
      targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
      status: nextStatus,
      progress: validated.progress,
    },
  });

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
  return { success: true, goal: updated };
}

export async function deleteGoal(id: string) {
  const user = await requireUser();

  const existing = await prisma.goal.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Goal not found or unauthorized");
  }

  await prisma.goal.delete({
    where: { id: existing.id },
  });

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
  return { success: true };
}
