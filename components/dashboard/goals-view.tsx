"use client";

import { useState } from "react";
import { GoalForm, GoalItem } from "./goal-form";
import { GoalList } from "./goal-list";

export function GoalsView({ goals }: { goals: GoalItem[] }) {
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);

  const handleEdit = (goal: GoalItem) => {
    setEditingGoal(goal);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = () => {
    setEditingGoal(null);
  };

  return (
    <div className="space-y-6">
      <GoalForm
        key={editingGoal?.id || "new"}
        goalToEdit={editingGoal}
        onFinishEdit={handleFinish}
      />
      <GoalList goals={goals} onEditGoal={handleEdit} />
    </div>
  );
}
