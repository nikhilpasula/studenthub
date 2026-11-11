import { z } from "zod";

export const certificateCategoryEnum = z.enum([
  "COURSE",
  "WORKSHOP",
  "COMPETITION",
  "INTERNSHIP",
  "OTHER",
]);

export const certificateSchema = z.object({
  title: z.string().trim().min(1, "Certificate title is required"),
  issuer: z.string().trim().min(1, "Issuer organization is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional().nullable(),
  credentialId: z.string().trim().optional().nullable(),
  verificationUrl: z.string().trim().optional().nullable(),
  fileUrl: z.string().trim().optional().nullable(),
  category: certificateCategoryEnum,
  isPublic: z.boolean(),
});

export type CertificateInput = z.infer<typeof certificateSchema>;
export type CertificateCategory = z.infer<typeof certificateCategoryEnum>;
