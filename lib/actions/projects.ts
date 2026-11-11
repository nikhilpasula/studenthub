"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { projectSchema, ProjectInput } from "@/lib/validations/project";

export async function createProject(data: ProjectInput) {
  const user = await requireUser();
  const validated = projectSchema.parse(data);

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      title: validated.title,
      description: validated.description?.trim() || null,
      techStack: validated.techStack,
      role: validated.role?.trim() || null,
      githubUrl: validated.githubUrl?.trim() || null,
      liveUrl: validated.liveUrl?.trim() || null,
      imageUrl: validated.imageUrl?.trim() || null,
      status: validated.status,
      isPublic: validated.isPublic,
      featured: validated.featured,
    },
  });

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
  if (user.username) {
    revalidatePath(`/${user.username}`);
  }
  return { success: true, project };
}

export async function updateProject(id: string, data: ProjectInput) {
  const user = await requireUser();
  const validated = projectSchema.parse(data);

  const existing = await prisma.project.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Project not found or unauthorized");
  }

  const updated = await prisma.project.update({
    where: { id: existing.id },
    data: {
      title: validated.title,
      description: validated.description?.trim() || null,
      techStack: validated.techStack,
      role: validated.role?.trim() || null,
      githubUrl: validated.githubUrl?.trim() || null,
      liveUrl: validated.liveUrl?.trim() || null,
      imageUrl: validated.imageUrl?.trim() || null,
      status: validated.status,
      isPublic: validated.isPublic,
      featured: validated.featured,
    },
  });

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
  if (user.username) {
    revalidatePath(`/${user.username}`);
  }
  return { success: true, project: updated };
}

export async function deleteProject(id: string) {
  const user = await requireUser();

  const existing = await prisma.project.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Project not found or unauthorized");
  }

  await prisma.project.delete({
    where: { id: existing.id },
  });

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
  if (user.username) {
    revalidatePath(`/${user.username}`);
  }
  return { success: true };
}
