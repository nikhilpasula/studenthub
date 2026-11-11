import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CertificatesView } from "@/components/dashboard/certificates-view";
import { CertificateItem } from "@/components/dashboard/certificate-form";
import { Award } from "lucide-react";

export const metadata = {
  title: "Certificates & Credentials | StudentHub",
  description: "Track and verify your professional course certificates, hackathon honors, and licenses.",
};

export default async function CertificatesPage() {
  const user = await requireUser();

  const rawCerts = await prisma.certificate.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      issueDate: "desc",
    },
  });

  const certificates: CertificateItem[] = rawCerts.map((c) => ({
    id: c.id,
    title: c.title,
    issuer: c.issuer,
    issueDate: c.issueDate.toISOString(),
    expiryDate: c.expiryDate ? c.expiryDate.toISOString() : null,
    credentialId: c.credentialId,
    verificationUrl: c.verificationUrl,
    fileUrl: c.fileUrl,
    category: c.category,
    isPublic: c.isPublic,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Award className="size-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Certificates &amp; Credentials
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Document your verified certifications, course badges, and credentials with verification links.
        </p>
      </div>

      {/* Certificates View */}
      <CertificatesView certificates={certificates} />
    </div>
  );
}
