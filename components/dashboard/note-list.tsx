"use client";

import { useState, useTransition } from "react";
import { deleteNote } from "@/lib/actions/notes";
import { format } from "date-fns";
import {
  FileText,
  Trash2,
  Edit3,
  Calendar,
  Tag,
  Loader2,
  BookOpen,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { NoteItem } from "./note-form";
import ReactMarkdown from "react-markdown";

interface NoteListProps {
  notes: NoteItem[];
  onEditNote?: (note: NoteItem) => void;
}

export function NoteList({ notes, onEditNote }: NoteListProps) {
  const [isPending, startTransition] = useTransition();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [readingNote, setReadingNote] = useState<NoteItem | null>(null);
  const [searchTag, setSearchTag] = useState<string | null>(null);

  const filteredNotes = searchTag
    ? notes.filter((n) => n.tags.some((t) => t.toLowerCase() === searchTag.toLowerCase()))
    : notes;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this note?")) return;

    setActiveNoteId(id);
    startTransition(async () => {
      try {
        await deleteNote(id);
        if (readingNote?.id === id) {
          setReadingNote(null);
        }
      } finally {
        setActiveNoteId(null);
      }
    });
  };

  const handleEdit = (note: NoteItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditNote?.(note);
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            My Study Notes
          </h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted font-medium">
            {notes.length} {notes.length === 1 ? "Note" : "Notes"}
          </span>
          {searchTag && (
            <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md">
              <span>Tag: #{searchTag}</span>
              <button
                type="button"
                onClick={() => setSearchTag(null)}
                className="hover:opacity-75 cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <FileText className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {searchTag ? `No notes tagged with #${searchTag}` : "No notes created yet"}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Use the form above to jot down key takeaways, study guides, or lecture summaries.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const isDeleting = isPending && activeNoteId === note.id;
            const updatedDate = note.updatedAt ? new Date(note.updatedAt) : new Date();

            return (
              <Card
                key={note.id}
                onClick={() => setReadingNote(note)}
                className="group flex flex-col justify-between border border-border/70 bg-card hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer"
              >
                <div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {note.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Calendar className="size-3" />
                      <span>{format(updatedDate, "MMM d, yyyy")}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-3">
                    {/* Content snippet */}
                    <div className="text-xs text-muted-foreground line-clamp-4 font-mono leading-relaxed bg-muted/20 p-2.5 rounded-lg border border-border/30">
                      {note.content}
                    </div>

                    {/* Tag chips */}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {note.tags.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchTag(t);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/40 transition-colors"
                          >
                            <Tag className="size-2.5" />
                            <span>{t}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>

                <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground flex items-center gap-1">
                    <BookOpen className="size-3" />
                    <span>Click to read</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => handleEdit(note, e)}
                      aria-label="Edit note"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Edit3 className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => handleDelete(note.id, e)}
                      disabled={isDeleting}
                      aria-label="Delete note"
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

      {/* Note Reader Modal */}
      {readingNote && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setReadingNote(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] bg-card border border-border rounded-xl shadow-lg flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  {readingNote.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>Last updated {format(new Date(readingNote.updatedAt), "MMMM d, yyyy")}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setReadingNote(null)}
                aria-label="Close reader"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Modal Body / Markdown Content */}
            <div className="p-5 sm:p-6 overflow-y-auto prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
              <ReactMarkdown>{readingNote.content}</ReactMarkdown>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-border bg-muted/20 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {readingNote.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const toEdit = readingNote;
                    setReadingNote(null);
                    onEditNote?.(toEdit);
                  }}
                  className="gap-1.5"
                >
                  <Edit3 className="size-3.5" />
                  <span>Edit Note</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setReadingNote(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
