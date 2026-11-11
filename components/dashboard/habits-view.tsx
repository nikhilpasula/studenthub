"use client";

import { HabitForm, HabitItem } from "./habit-form";
import { HabitList } from "./habit-list";

export function HabitsView({ habits }: { habits: HabitItem[] }) {
  return (
    <div className="space-y-6">
      <HabitForm />
      <HabitList habits={habits} />
    </div>
  );
}
