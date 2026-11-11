"use client";

import { useState } from "react";
import { NoteForm, NoteItem } from "./note-form";
import { NoteList } from "./note-list";

interface NotesViewProps {
  notes: NoteItem[];
  courses?: Array<{
    id: string;
    name: string;
    code?: string | null;
  }>;
}

export function NotesView({ notes, courses = [] }: NotesViewProps) {
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);

  const handleEdit = (note: NoteItem) => {
    setEditingNote(note);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = () => {
    setEditingNote(null);
  };

  return (
    <div className="space-y-6">
      <NoteForm
        key={editingNote?.id || "new"}
        noteToEdit={editingNote}
        courses={courses}
        onFinishEdit={handleFinish}
      />
      <NoteList notes={notes} onEditNote={handleEdit} />
    </div>
  );
}
