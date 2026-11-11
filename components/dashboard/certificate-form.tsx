"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  certificateSchema,
  CertificateInput,
  CertificateCategory,
} from "@/lib/validations/certificate";
import { createCertificate, updateCertificate } from "@/lib/actions/certificates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Award, Plus, Edit3, Loader2, X, Globe } from "lucide-react";

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string | Date;
  expiryDate: string | Date | null;
  credentialId: string | null;
  verificationUrl: string | null;
  fileUrl: string | null;
  category: CertificateCategory;
  isPublic: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface CertificateFormProps {
  certificateToEdit?: CertificateItem | null;
  onFinishEdit?: () => void;
}

export function CertificateForm({
  certificateToEdit,
  onFinishEdit,
}: CertificateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(Boolean(certificateToEdit));
  const [isPublic, setIsPublic] = useState<boolean>(
    certificateToEdit?.isPublic ?? true
  );

  const isEditing = Boolean(certificateToEdit);

  const initialIssueDate = certificateToEdit?.issueDate
    ? format(new Date(certificateToEdit.issueDate), "yyyy-MM-dd")
    : format(new Date(), "yyyy-MM-dd");

  const initialExpiryDate = certificateToEdit?.expiryDate
    ? format(new Date(certificateToEdit.expiryDate), "yyyy-MM-dd")
    : "";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CertificateInput>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      title: certificateToEdit?.title || "",
      issuer: certificateToEdit?.issuer || "",
      issueDate: initialIssueDate,
      expiryDate: initialExpiryDate,
      credentialId: certificateToEdit?.credentialId || "",
      verificationUrl: certificateToEdit?.verificationUrl || "",
      fileUrl: certificateToEdit?.fileUrl || "",
      category: certificateToEdit?.category || "COURSE",
      isPublic: certificateToEdit?.isPublic ?? true,
    },
  });

  const handleTogglePublic = (checked: boolean) => {
    setIsPublic(checked);
    setValue("isPublic", checked);
  };

  const onSubmit = (data: CertificateInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        if (isEditing && certificateToEdit) {
          await updateCertificate(certificateToEdit.id, data);
          onFinishEdit?.();
        } else {
          await createCertificate(data);
          reset({
            title: "",
            issuer: "",
            issueDate: format(new Date(), "yyyy-MM-dd"),
            expiryDate: "",
            credentialId: "",
            verificationUrl: "",
            fileUrl: "",
            category: "COURSE",
            isPublic: true,
          });
          setIsPublic(true);
          setIsExpanded(false);
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to save certificate"
        );
      }
    });
  };

  const handleCancel = () => {
    if (onFinishEdit) {
      onFinishEdit();
    } else {
      reset();
      setIsExpanded(false);
      setErrorMessage(null);
    }
  };

  return (
    <Card className="border border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {isEditing ? (
            <>
              <Edit3 className="size-4 text-primary" />
              <span>Edit Certificate</span>
            </>
          ) : (
            <>
              <Plus className="size-4 text-primary" />
              <span>Add Verified Certificate / Credential</span>
            </>
          )}
        </CardTitle>

        {!isEditing && !isExpanded && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
          >
            Expand Details
          </Button>
        )}

        {isEditing && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleCancel}
            className="gap-1 text-xs"
          >
            <X className="size-3.5" />
            <span>Cancel</span>
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {errorMessage}
            </div>
          )}

          {/* Title & Issuer Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Certificate Title *</Label>
              <Input
                id="title"
                placeholder="e.g., AWS Certified Solutions Architect"
                {...register("title")}
                disabled={isPending}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="issuer">Issuing Organization *</Label>
              <Input
                id="issuer"
                placeholder="e.g., Amazon Web Services (AWS), Coursera, Meta"
                {...register("issuer")}
                disabled={isPending}
              />
              {errors.issuer && (
                <p className="text-xs text-destructive">{errors.issuer.message}</p>
              )}
            </div>
          </div>

          {/* Expanded Section */}
          {(isExpanded || isEditing) && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              {/* Category & Dates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    {...register("category")}
                    disabled={isPending}
                    className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-card"
                  >
                    <option value="COURSE">Online Course</option>
                    <option value="WORKSHOP">Workshop / Bootcamp</option>
                    <option value="COMPETITION">Hackathon / Competition</option>
                    <option value="INTERNSHIP">Internship Certificate</option>
                    <option value="OTHER">Other Credential</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    {...register("issueDate")}
                    disabled={isPending}
                  />
                  {errors.issueDate && (
                    <p className="text-xs text-destructive">
                      {errors.issueDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    {...register("expiryDate")}
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Credential ID & Verification URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="credentialId">Credential ID (Optional)</Label>
                  <Input
                    id="credentialId"
                    placeholder="e.g., AWS-PSA-1094827"
                    {...register("credentialId")}
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="verificationUrl">Verification URL (Optional)</Label>
                  <Input
                    id="verificationUrl"
                    placeholder="https://credly.com/badges/..."
                    {...register("verificationUrl")}
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* File URL */}
              <div className="space-y-1.5">
                <Label htmlFor="fileUrl">Certificate Document Link / File URL (Optional)</Label>
                <Input
                  id="fileUrl"
                  placeholder="https://drive.google.com/... or hosted PDF link"
                  {...register("fileUrl")}
                  disabled={isPending}
                />
              </div>

              {/* Public Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-primary" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Public Certificate
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Display on your public student portfolio profile
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => handleTogglePublic(e.target.checked)}
                    disabled={isPending}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            {!isEditing && isExpanded && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                disabled={isPending}
              >
                Simple Mode
              </Button>
            )}

            {isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
              >
                Discard
              </Button>
            )}

            <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>{isEditing ? "Updating..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  {isEditing ? (
                    <Edit3 className="size-3.5" />
                  ) : (
                    <Award className="size-3.5" />
                  )}
                  <span>{isEditing ? "Update Certificate" : "Save Certificate"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
