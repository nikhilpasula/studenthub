"use client";

import { useState } from "react";
import { ProjectForm, ProjectItem } from "./project-form";
import { ProjectList } from "./project-list";

export function ProjectsView({ projects }: { projects: ProjectItem[] }) {
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  const handleEdit = (project: ProjectItem) => {
    setEditingProject(project);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = () => {
    setEditingProject(null);
  };

  return (
    <div className="space-y-6">
      <ProjectForm
        key={editingProject?.id || "new"}
        projectToEdit={editingProject}
        onFinishEdit={handleFinish}
      />
      <ProjectList projects={projects} onEditProject={handleEdit} />
    </div>
  );
}
