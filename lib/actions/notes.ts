"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { noteSchema, NoteInput } from "@/lib/validations/note";

export async function createNote(data: NoteInput) {
  const user = await requireUser();
  const validated = noteSchema.parse(data);

  const cleanCourseId = validated.courseId?.trim() || null;
  if (cleanCourseId) {
    const course = await prisma.course.findFirst({
      where: { id: cleanCourseId, userId: user.id },
    });
    if (!course) {
      throw new Error("Selected course not found or unauthorized");
    }
  }

  const note = await prisma.note.create({
    data: {
      userId: user.id,
      title: validated.title,
      content: validated.content,
      courseId: cleanCourseId,
      tags: validated.tags || [],
    },
  });

  revalidatePath("/dashboard/notes");
  return { success: true, note };
}

export async function updateNote(id: string, data: Partial<NoteInput>) {
  const user = await requireUser();

  const existing = await prisma.note.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Note not found or unauthorized");
  }

  const cleanCourseId = data.courseId !== undefined ? (data.courseId?.trim() || null) : undefined;
  if (cleanCourseId) {
    const course = await prisma.course.findFirst({
      where: { id: cleanCourseId, userId: user.id },
    });
    if (!course) {
      throw new Error("Selected course not found or unauthorized");
    }
  }

  const updated = await prisma.note.update({
    where: {
      id: existing.id,
    },
    data: {
      ...(data.title ? { title: data.title.trim() } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(cleanCourseId !== undefined ? { courseId: cleanCourseId } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
    },
  });

  revalidatePath("/dashboard/notes");
  return { success: true, note: updated };
}

export async function deleteNote(id: string) {
  const user = await requireUser();

  const existing = await prisma.note.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Note not found or unauthorized");
  }

  await prisma.note.delete({
    where: {
      id: existing.id,
    },
  });

  revalidatePath("/dashboard/notes");
  return { success: true };
}
