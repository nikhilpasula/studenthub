"use client";

import { useState } from "react";
import { CourseForm, CourseItem } from "./course-form";
import { CourseList } from "./course-list";

export function CoursesView({ courses }: { courses: CourseItem[] }) {
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);

  const handleEdit = (course: CourseItem) => {
    setEditingCourse(course);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = () => {
    setEditingCourse(null);
  };

  return (
    <div className="space-y-6">
      <CourseForm
        key={editingCourse?.id || "new"}
        courseToEdit={editingCourse}
        onFinishEdit={handleFinish}
      />
      <CourseList courses={courses} onEditCourse={handleEdit} />
    </div>
  );
}
