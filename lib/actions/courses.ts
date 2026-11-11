"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { courseSchema, CourseInput } from "@/lib/validations/course";

export async function createCourse(data: CourseInput) {
  const user = await requireUser();
  const validated = courseSchema.parse(data);

  const course = await prisma.course.create({
    data: {
      userId: user.id,
      name: validated.name,
      code: validated.code?.trim() || null,
      instructor: validated.instructor?.trim() || null,
      semester: validated.semester?.trim() || null,
      credits: validated.credits,
      description: validated.description?.trim() || null,
      color: validated.color?.trim() || null,
    },
  });

  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/notes");
  revalidatePath("/dashboard");
  return { success: true, course };
}

export async function updateCourse(id: string, data: CourseInput) {
  const user = await requireUser();
  const validated = courseSchema.parse(data);

  const existing = await prisma.course.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Course not found or unauthorized");
  }

  const updated = await prisma.course.update({
    where: { id: existing.id },
    data: {
      name: validated.name,
      code: validated.code?.trim() || null,
      instructor: validated.instructor?.trim() || null,
      semester: validated.semester?.trim() || null,
      credits: validated.credits,
      description: validated.description?.trim() || null,
      color: validated.color?.trim() || null,
    },
  });

  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/notes");
  revalidatePath("/dashboard");
  return { success: true, course: updated };
}

export async function deleteCourse(id: string) {
  const user = await requireUser();

  const existing = await prisma.course.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Course not found or unauthorized");
  }

  await prisma.course.delete({
    where: { id: existing.id },
  });

  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/notes");
  revalidatePath("/dashboard");
  return { success: true };
}
