"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { certificateSchema, CertificateInput } from "@/lib/validations/certificate";

export async function createCertificate(data: CertificateInput) {
  const user = await requireUser();
  const validated = certificateSchema.parse(data);

  const certificate = await prisma.certificate.create({
    data: {
      userId: user.id,
      title: validated.title,
      issuer: validated.issuer,
      issueDate: new Date(validated.issueDate),
      expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
      credentialId: validated.credentialId?.trim() || null,
      verificationUrl: validated.verificationUrl?.trim() || null,
      fileUrl: validated.fileUrl?.trim() || null,
      category: validated.category,
      isPublic: validated.isPublic,
    },
  });

  revalidatePath("/dashboard/certificates");
  revalidatePath("/dashboard");
  if (user.username) {
    revalidatePath(`/${user.username}`);
  }
  return { success: true, certificate };
}

export async function updateCertificate(id: string, data: CertificateInput) {
  const user = await requireUser();
  const validated = certificateSchema.parse(data);

  const existing = await prisma.certificate.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Certificate not found or unauthorized");
  }

  const updated = await prisma.certificate.update({
    where: { id: existing.id },
    data: {
      title: validated.title,
      issuer: validated.issuer,
      issueDate: new Date(validated.issueDate),
      expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
      credentialId: validated.credentialId?.trim() || null,
      verificationUrl: validated.verificationUrl?.trim() || null,
      fileUrl: validated.fileUrl?.trim() || null,
      category: validated.category,
      isPublic: validated.isPublic,
    },
  });

  revalidatePath("/dashboard/certificates");
  revalidatePath("/dashboard");
  if (user.username) {
    revalidatePath(`/${user.username}`);
  }
  return { success: true, certificate: updated };
}

export async function deleteCertificate(id: string) {
  const user = await requireUser();

  const existing = await prisma.certificate.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existing) {
    throw new Error("Certificate not found or unauthorized");
  }

  await prisma.certificate.delete({
    where: { id: existing.id },
  });

  revalidatePath("/dashboard/certificates");
  revalidatePath("/dashboard");
  if (user.username) {
    revalidatePath(`/${user.username}`);
  }
  return { success: true };
}
