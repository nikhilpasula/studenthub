"use client";

import { useState } from "react";
import { SkillForm, SkillItem } from "./skill-form";
import { SkillList } from "./skill-list";

export function SkillsView({ skills }: { skills: SkillItem[] }) {
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);

  const handleEdit = (skill: SkillItem) => {
    setEditingSkill(skill);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = () => {
    setEditingSkill(null);
  };

  return (
    <div className="space-y-6">
      <SkillForm
        key={editingSkill?.id || "new"}
        skillToEdit={editingSkill}
        onFinishEdit={handleFinish}
      />
      <SkillList skills={skills} onEditSkill={handleEdit} />
    </div>
  );
}
