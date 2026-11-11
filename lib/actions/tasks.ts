"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { taskSchema, TaskInput } from "@/lib/validations/task";

export async function createTask(data: TaskInput) {
  const user = await requireUser();
  const validated = taskSchema.parse(data);

  const cleanCourseId = validated.courseId?.trim() || null;
  if (cleanCourseId) {
    const course = await prisma.course.findFirst({
      where: { id: cleanCourseId, userId: user.id },
    });
    if (!course) {
      throw new Error("Selected course not found or unauthorized");
    }
  }

  const task = await prisma.task.create({
    data: {
      userId: user.id,
      title: validated.title,
      description: validated.description?.trim() || null,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      priority: validated.priority,
      status: validated.status,
      courseId: cleanCourseId,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  return { success: true, task };
}

export async function toggleTask(id: string) {
  const user = await requireUser();

  const existing = await prisma.task.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Task not found or unauthorized");
  }

  const newStatus = existing.status === "DONE" ? "TODO" : "DONE";

  const updated = await prisma.task.update({
    where: {
      id: existing.id,
    },
    data: {
      status: newStatus,
      completedAt: newStatus === "DONE" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  return { success: true, task: updated };
}

export async function deleteTask(id: string) {
  const user = await requireUser();

  const existing = await prisma.task.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Task not found or unauthorized");
  }

  await prisma.task.delete({
    where: {
      id: existing.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  return { success: true };
}
