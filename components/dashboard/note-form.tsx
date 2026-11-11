"use client";

import { useState, useTransition } from "react";
import { createNote, updateNote } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Edit3, Loader2, Sparkles, X, Eye, FileEdit } from "lucide-react";
import ReactMarkdown from "react-markdown";

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  courseId?: string | null;
  updatedAt: string | Date;
  createdAt: string | Date;
}

interface NoteFormProps {
  noteToEdit?: NoteItem | null;
  courses?: Array<{
    id: string;
    name: string;
    code?: string | null;
  }>;
  onFinishEdit?: () => void;
}

export function NoteForm({ noteToEdit, courses = [], onFinishEdit }: NoteFormProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(noteToEdit?.title || "");
  const [content, setContent] = useState(noteToEdit?.content || "");
  const [tagsInput, setTagsInput] = useState(noteToEdit?.tags?.join(", ") || "");
  const [courseId, setCourseId] = useState(noteToEdit?.courseId || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Sync if editing note changes
  const isEditing = Boolean(noteToEdit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Please provide a note title.");
      return;
    }
    if (!content.trim()) {
      setErrorMessage("Note content cannot be empty.");
      return;
    }

    setErrorMessage(null);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        if (isEditing && noteToEdit) {
          await updateNote(noteToEdit.id, {
            title: title.trim(),
            content,
            tags,
            courseId: courseId || null,
          });
          onFinishEdit?.();
        } else {
          await createNote({
            title: title.trim(),
            content,
            tags,
            courseId: courseId || null,
          });
          setTitle("");
          setContent("");
          setTagsInput("");
          setCourseId("");
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to save note");
      }
    });
  };

  const handleCancel = () => {
    if (onFinishEdit) {
      onFinishEdit();
    } else {
      setTitle("");
      setContent("");
      setTagsInput("");
      setCourseId("");
      setErrorMessage(null);
    }
  };

  return (
    <Card className="border border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {isEditing ? (
            <>
              <Edit3 className="size-4 text-primary" />
              <span>Edit Note</span>
            </>
          ) : (
            <>
              <Plus className="size-4 text-primary" />
              <span>Create New Note</span>
            </>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setPreviewMode(!previewMode)}
            className="text-xs gap-1"
          >
            {previewMode ? (
              <>
                <FileEdit className="size-3.5" />
                <span>Write Mode</span>
              </>
            ) : (
              <>
                <Eye className="size-3.5" />
                <span>Markdown Preview</span>
              </>
            )}
          </Button>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleCancel}
              className="gap-1"
            >
              <X className="size-3.5" />
              <span>Cancel</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {errorMessage}
            </div>
          )}

          {/* Title input */}
          <div className="space-y-1.5">
            <Label htmlFor="note-title">Title *</Label>
            <Input
              id="note-title"
              placeholder="e.g., Computer Networks Lecture 4: TCP Handshake"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Content input or Markdown Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="note-content">Note Content (Markdown supported) *</Label>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3" />
                Supports # Headers, **bold**, - lists, `code`
              </span>
            </div>

            {previewMode ? (
              <div className="min-h-36 max-h-72 overflow-y-auto p-3.5 rounded-lg border border-border bg-muted/20 text-sm prose prose-sm dark:prose-invert max-w-none">
                {content.trim() ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic text-xs">Nothing to preview yet. Write some markdown content first.</p>
                )}
              </div>
            ) : (
              <Textarea
                id="note-content"
                placeholder="Write your study notes, key formulas, or bullet points here..."
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPending}
                className="font-mono text-sm leading-relaxed"
              />
            )}
          </div>

          {/* Course and Tags Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="note-course">Course (Optional)</Label>
              <select
                id="note-course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                disabled={isPending}
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-card"
              >
                <option value="">-- No Course Selected --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ? `[${c.code}] ` : ""}{c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note-tags">Tags (Comma-separated)</Label>
              <Input
                id="note-tags"
                placeholder="e.g., cs, finals, algorithms, week2"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Submit & Cancel Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
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
                  {isEditing ? <Edit3 className="size-3.5" /> : <Plus className="size-3.5" />}
                  <span>{isEditing ? "Update Note" : "Save Note"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
