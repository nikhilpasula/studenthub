"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { profileSchema, ProfileInput } from "@/lib/validations/profile";

const RESERVED_USERNAMES = new Set([
  "dashboard",
  "sign-in",
  "sign-up",
  "api",
  "public",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "admin",
  "login",
  "register",
]);

export async function updateProfile(data: ProfileInput) {
  const user = await requireUser();
  const validated = profileSchema.parse(data);

  const cleanUsername = validated.username?.trim().toLowerCase() || null;

  if (cleanUsername) {
    if (RESERVED_USERNAMES.has(cleanUsername)) {
      throw new Error("This username is reserved. Please pick another one.");
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        username: cleanUsername,
        NOT: { id: user.id },
      },
    });

    if (existingUser) {
      throw new Error("This username is already taken. Please pick another one.");
    }
  }

  const socialLinks = {
    github: validated.github?.trim() || null,
    linkedin: validated.linkedin?.trim() || null,
    twitter: validated.twitter?.trim() || null,
  };

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: validated.name.trim(),
        username: cleanUsername,
        bio: validated.bio?.trim() || null,
        college: validated.college?.trim() || null,
        branch: validated.branch?.trim() || null,
        year: validated.year,
        isPortfolioPublic: validated.isPortfolioPublic,
        socialLinks,
      },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, user: updatedUser };
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      throw new Error("This username is already taken. Please pick another one.");
    }
    throw err;
  }
}
