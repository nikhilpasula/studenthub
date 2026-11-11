"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { deleteCertificate } from "@/lib/actions/certificates";
import { CertificateItem } from "./certificate-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Award,
  Calendar,
  ExternalLink,
  Globe,
  Lock,
  Edit3,
  Trash2,
  Loader2,
  FileText,
  BadgeCheck,
} from "lucide-react";

interface CertificateListProps {
  certificates: CertificateItem[];
  onEditCertificate?: (certificate: CertificateItem) => void;
}

const categoryLabels: Record<string, string> = {
  COURSE: "Course",
  WORKSHOP: "Workshop",
  COMPETITION: "Competition",
  INTERNSHIP: "Internship",
  OTHER: "Certification",
};

export function CertificateList({
  certificates,
  onEditCertificate,
}: CertificateListProps) {
  const [isPending, startTransition] = useTransition();
  const [activeCertificateId, setActiveCertificateId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PUBLIC">("ALL");

  const filteredCertificates = certificates.filter((c) => {
    if (filter === "PUBLIC") return c.isPublic;
    return true;
  });

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete certificate: "${title}"?`)) return;
    setActiveCertificateId(id);
    startTransition(async () => {
      try {
        await deleteCertificate(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete certificate");
      } finally {
        setActiveCertificateId(null);
      }
    });
  };

  const totalCount = certificates.length;
  const publicCount = certificates.filter((c) => c.isPublic).length;

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Verified Credentials &amp; Certifications
          </h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted font-medium">
            {publicCount}/{totalCount} Public
          </span>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Button
            type="button"
            variant={filter === "ALL" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilter("ALL")}
          >
            All ({totalCount})
          </Button>
          <Button
            type="button"
            variant={filter === "PUBLIC" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilter("PUBLIC")}
          >
            Public ({publicCount})
          </Button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredCertificates.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Award className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No certificates found</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Add your verified course completions, cloud certifications, and workshop honors to display on your student portfolio.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertificates.map((cert) => {
            const isDeleting = isPending && activeCertificateId === cert.id;
            const issueDateObj = new Date(cert.issueDate);

            return (
              <Card
                key={cert.id}
                className="group flex flex-col justify-between border border-border/70 bg-card hover:border-primary/40 hover:shadow-xs transition-all overflow-hidden"
              >
                <div>
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                            {categoryLabels[cert.category] || cert.category}
                          </span>
                        </div>

                        <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {cert.title}
                        </CardTitle>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <BadgeCheck className="size-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{cert.issuer}</span>
                        </div>
                      </div>

                      {/* Visibility indicator */}
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          cert.isPublic
                            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                            : "text-muted-foreground bg-muted"
                        }`}
                      >
                        {cert.isPublic ? (
                          <>
                            <Globe className="size-2.5" /> Public
                          </>
                        ) : (
                          <>
                            <Lock className="size-2.5" /> Private
                          </>
                        )}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2.5 pb-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-foreground/70 shrink-0" />
                      <span>Issued: {format(issueDateObj, "MMMM d, yyyy")}</span>
                    </div>

                    {cert.credentialId && (
                      <p className="text-[11px] font-mono text-muted-foreground bg-muted/30 p-1.5 rounded border border-border/30 truncate">
                        ID: {cert.credentialId}
                      </p>
                    )}
                  </CardContent>
                </div>

                {/* Footer Links & Actions */}
                <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {cert.verificationUrl && (
                      <a
                        href={cert.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Verify</span>
                      </a>
                    )}

                    {cert.verificationUrl && cert.fileUrl && (
                      <span className="text-muted-foreground/40">•</span>
                    )}

                    {cert.fileUrl && (
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-medium"
                      >
                        <FileText className="size-3.5" />
                        <span>Document</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onEditCertificate?.(cert)}
                      aria-label="Edit certificate"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Edit3 className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(cert.id, cert.title)}
                      disabled={isDeleting}
                      aria-label="Delete certificate"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      {isDeleting ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
