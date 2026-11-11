"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { skillSchema, SkillInput } from "@/lib/validations/skill";

export async function createSkill(data: SkillInput) {
  const user = await requireUser();
  const validated = skillSchema.parse(data);

  const skill = await prisma.skill.create({
    data: {
      userId: user.id,
      name: validated.name,
      category: validated.category?.trim() || "General",
      level: validated.level,
      isPublic: validated.isPublic,
    },
  });

  revalidatePath("/dashboard/skills");
  revalidatePath("/dashboard");
  if (user.username) {
    revalidatePath(`/${user.username}`);
  }
  return { success: true, skill };
}

export async function updateSkill(id: string, data: SkillInput) {
  const user = await requireUser();
  const validated = skillSchema.parse(data);

  const existing = await prisma.skill.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Skill not found or unauthorized");
  }

  const updated = await prisma.skill.update({
    where: { id: existing.id },
    data: {
      name: validated.name,
      category: validated.category?.trim() || "General",
      level: validated.level,
      isPublic: validated.isPublic,
    },
  });

  revalidatePath("/dashboard/skills");
  revalidatePath("/dashboard");
  if (user.username) {
    revalidatePath(`/${user.username}`);
  }
  return { success: true, skill: updated };
}

export async function deleteSkill(id: string) {
  const user = await requireUser();

  const existing = await prisma.skill.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Skill not found or unauthorized");
  }

  await prisma.skill.delete({
    where: { id: existing.id },
  });

  revalidatePath("/dashboard/skills");
  revalidatePath("/dashboard");
  if (user.username) {
    revalidatePath(`/${user.username}`);
  }
  return { success: true };
}
