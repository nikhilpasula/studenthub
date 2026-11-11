"use client";

import { useState } from "react";
import { CertificateForm, CertificateItem } from "./certificate-form";
import { CertificateList } from "./certificate-list";

export function CertificatesView({
  certificates,
}: {
  certificates: CertificateItem[];
}) {
  const [editingCert, setEditingCert] = useState<CertificateItem | null>(null);

  const handleEdit = (cert: CertificateItem) => {
    setEditingCert(cert);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = () => {
    setEditingCert(null);
  };

  return (
    <div className="space-y-6">
      <CertificateForm
        key={editingCert?.id || "new"}
        certificateToEdit={editingCert}
        onFinishEdit={handleFinish}
      />
      <CertificateList
        certificates={certificates}
        onEditCertificate={handleEdit}
      />
    </div>
  );
}
