"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventInput, EventCategory } from "@/lib/validations/event";
import { createEvent, deleteEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import classicTheme from "@fullcalendar/react/themes/classic";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

// Dynamic import for FullCalendar to avoid SSR / DOM hydration issues
const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false,
  loading: () => (
    <div className="h-[650px] flex flex-col items-center justify-center border border-border rounded-xl bg-card space-y-3">
      <Loader2 className="size-8 animate-spin text-primary" />
      <span className="text-sm font-medium text-muted-foreground">
        Loading calendar view...
      </span>
    </div>
  ),
});

export interface CalendarEventItem {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  allDay: boolean;
  category: EventCategory;
  location?: string | null;
  color?: string | null;
}

export interface CalendarTaskItem {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
}

interface CalendarViewProps {
  events: CalendarEventItem[];
  tasks: CalendarTaskItem[];
}

const categoryColors: Record<EventCategory, string> = {
  CLASS: "#3b82f6", // Blue
  EXAM: "#ef4444", // Red
  ASSIGNMENT: "#8b5cf6", // Purple
  MEETING: "#06b6d4", // Cyan
  PERSONAL: "#10b981", // Emerald
  OTHER: "#64748b", // Slate
};

const categoryLabels: Record<EventCategory, string> = {
  CLASS: "Class",
  EXAM: "Exam",
  ASSIGNMENT: "Assignment",
  MEETING: "Meeting",
  PERSONAL: "Personal",
  OTHER: "Other",
};

export function CalendarView({ events, tasks }: CalendarViewProps) {
  const [isPending, startTransition] = useTransition();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{
    type: "event" | "task";
    event?: CalendarEventItem;
    task?: CalendarTaskItem;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Map events from DB
  const mappedEvents = events.map((event) => {
    const bg = event.color || categoryColors[event.category] || "#3b82f6";
    return {
      id: `event-${event.id}`,
      title: event.title,
      start: event.startTime,
      end: event.endTime,
      allDay: event.allDay,
      backgroundColor: bg,
      borderColor: bg,
      textColor: "#ffffff",
      extendedProps: {
        type: "event" as const,
        rawEvent: event,
      },
    };
  });

  // Map tasks with due dates
  const mappedTasks = tasks.map((task) => {
    const isDone = task.status === "DONE";
    const bg = isDone ? "#10b981" : "#f59e0b";
    return {
      id: `task-${task.id}`,
      title: `📋 ${task.title}`,
      start: task.dueDate,
      allDay: true,
      backgroundColor: bg,
      borderColor: isDone ? "#059669" : "#d97706",
      textColor: "#ffffff",
      extendedProps: {
        type: "task" as const,
        rawTask: task,
      },
    };
  });

  const fullCalendarEvents = [...mappedEvents, ...mappedTasks];

  // React Hook Form for Add Event Modal
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("CLASS");
  const [selectedColor, setSelectedColor] = useState<string>(categoryColors.CLASS);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: format(new Date(), "yyyy-MM-dd'T'09:00"),
      endTime: format(new Date(), "yyyy-MM-dd'T'10:00"),
      allDay: false,
      category: "CLASS",
      location: "",
      color: categoryColors.CLASS,
    },
  });

  const openAddModal = (dateStr?: string) => {
    setFormError(null);
    setSelectedCategory("CLASS");
    setSelectedColor(categoryColors.CLASS);
    if (dateStr) {
      // User clicked on date cell
      const start = `${dateStr}T09:00`;
      const end = `${dateStr}T10:00`;
      setValue("startTime", start);
      setValue("endTime", end);
    } else {
      const now = new Date();
      setValue("startTime", format(now, "yyyy-MM-dd'T'09:00"));
      setValue("endTime", format(now, "yyyy-MM-dd'T'10:00"));
    }
    setValue("category", "CLASS");
    setValue("color", categoryColors.CLASS);
    setIsAddModalOpen(true);
  };

  const onAddSubmit = (data: EventInput) => {
    setFormError(null);
    startTransition(async () => {
      try {
        await createEvent(data);
        reset();
        setIsAddModalOpen(false);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Failed to create event");
      }
    });
  };

  const handleDeleteEvent = (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    startTransition(async () => {
      try {
        await deleteEvent(id);
        setSelectedDetail(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete event");
      }
    });
  };

  // When category changes, auto-suggest default category color if not customized
  const handleCategoryChange = (cat: EventCategory) => {
    setSelectedCategory(cat);
    setSelectedColor(categoryColors[cat]);
    setValue("category", cat);
    setValue("color", categoryColors[cat]);
  };

  const handleColorChange = (c: string) => {
    setSelectedColor(c);
    setValue("color", c);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CalendarDays className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Academic Schedule</h2>
            <p className="text-xs text-muted-foreground">
              Classes, deadlines, exams, and homework synchronized in one calendar.
            </p>
          </div>
        </div>

        <Button onClick={() => openAddModal()} size="sm" className="gap-1.5 self-start sm:self-auto">
          <Plus className="size-4" />
          <span>Add Event</span>
        </Button>
      </div>

      {/* Legend chips */}
      <div className="flex flex-wrap items-center gap-3 px-1 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
          Legend:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#f59e0b]" />
          <span>Tasks (Pending)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#10b981]" />
          <span>Tasks (Done)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#3b82f6]" />
          <span>Class</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ef4444]" />
          <span>Exam</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#8b5cf6]" />
          <span>Assignment</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#06b6d4]" />
          <span>Meeting</span>
        </div>
      </div>

      {/* FullCalendar Container */}
      <Card className="border border-border/80 p-3 sm:p-5 overflow-hidden">
        <CardContent className="p-0">
          <div className="calendar-container [&_.fc]:text-foreground [&_.fc-toolbar-title]:text-base sm:[&_.fc-toolbar-title]:text-lg [&_.fc-toolbar-title]:font-bold [&_.fc-button]:text-xs [&_.fc-button]:px-2.5 [&_.fc-button]:py-1 [&_.fc-button]:rounded-md [&_.fc-button-primary]:bg-primary [&_.fc-button-primary]:border-primary [&_.fc-button-primary]:text-primary-foreground [&_.fc-daygrid-day-number]:text-xs [&_.fc-daygrid-day-number]:font-medium [&_.fc-col-header-cell-cushion]:text-xs [&_.fc-col-header-cell-cushion]:font-semibold [&_.fc-event]:cursor-pointer [&_.fc-event]:rounded-md [&_.fc-event]:px-1 [&_.fc-event]:text-xs">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, classicTheme]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={fullCalendarEvents}
              editable={false}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={3}
              dateClick={(arg) => openAddModal(arg.dateStr)}
              eventClick={(info) => {
                const props = info.event.extendedProps;
                if (props.type === "event") {
                  setSelectedDetail({
                    type: "event",
                    event: props.rawEvent as CalendarEventItem,
                  });
                } else if (props.type === "task") {
                  setSelectedDetail({
                    type: "task",
                    task: props.rawTask as CalendarTaskItem,
                  });
                }
              }}
              height="auto"
            />
          </div>
        </CardContent>
      </Card>

      {/* Event / Task Detail Modal */}
      {selectedDetail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedDetail(null)}
        >
          <div
            className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {selectedDetail.type === "event"
                    ? `Event • ${categoryLabels[selectedDetail.event!.category] || selectedDetail.event!.category}`
                    : "Academic Task"}
                </span>
                <h3 className="text-base font-bold text-foreground">
                  {selectedDetail.type === "event"
                    ? selectedDetail.event?.title
                    : selectedDetail.task?.title}
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSelectedDetail(null)}
                aria-label="Close details"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 text-xs text-muted-foreground">
              {selectedDetail.type === "event" && selectedDetail.event && (
                <>
                  <div className="flex items-center gap-2 text-foreground">
                    <Clock className="size-4 text-primary shrink-0" />
                    <span>
                      {format(new Date(selectedDetail.event.startTime), "PPp")} —{" "}
                      {format(new Date(selectedDetail.event.endTime), "PPp")}
                    </span>
                  </div>

                  {selectedDetail.event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-muted-foreground shrink-0" />
                      <span>{selectedDetail.event.location}</span>
                    </div>
                  )}

                  {selectedDetail.event.description && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedDetail.event.description}
                    </div>
                  )}
                </>
              )}

              {selectedDetail.type === "task" && selectedDetail.task && (
                <>
                  <div className="flex items-center gap-2 text-foreground">
                    <CalendarIcon className="size-4 text-primary shrink-0" />
                    <span>
                      Due on {format(new Date(selectedDetail.task.dueDate), "PPP")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedDetail.task.status === "DONE" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="size-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <AlertCircle className="size-3.5" /> Pending ({selectedDetail.task.priority} Priority)
                      </span>
                    )}
                  </div>

                  {selectedDetail.task.description && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedDetail.task.description}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between">
              {selectedDetail.type === "event" && selectedDetail.event ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteEvent(selectedDetail.event!.id)}
                  disabled={isPending}
                  className="gap-1.5"
                >
                  {isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  <span>Delete Event</span>
                </Button>
              ) : (
                <div />
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedDetail(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-card border border-border rounded-xl shadow-lg flex flex-col overflow-hidden max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Plus className="size-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">Add Calendar Event</h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit(onAddSubmit)} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {formError && (
                <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Database Systems Midterm Exam"
                  {...register("title")}
                  disabled={isPending}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value as EventCategory)}
                  disabled={isPending}
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-card"
                >
                  <option value="CLASS">Class</option>
                  <option value="EXAM">Exam</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="MEETING">Meeting</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Date/Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    {...register("startTime")}
                    disabled={isPending}
                  />
                  {errors.startTime && (
                    <p className="text-xs text-destructive">{errors.startTime.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    {...register("endTime")}
                    disabled={isPending}
                  />
                  {errors.endTime && (
                    <p className="text-xs text-destructive">{errors.endTime.message}</p>
                  )}
                </div>
              </div>

              {/* All Day Checkbox & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Room 302 or Zoom link"
                    {...register("location")}
                    disabled={isPending}
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="allDay"
                    {...register("allDay")}
                    disabled={isPending}
                    className="size-4 rounded border-border text-primary focus:ring-primary/50"
                  />
                  <Label htmlFor="allDay" className="cursor-pointer">
                    All-day event
                  </Label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Notes, agenda, or syllabus coverage..."
                  rows={2}
                  {...register("description")}
                  disabled={isPending}
                />
              </div>

              {/* Color Presets */}
              <div className="space-y-1.5">
                <Label>Event Color</Label>
                <div className="flex items-center gap-2">
                  {[
                    { label: "Blue", color: "#3b82f6" },
                    { label: "Red", color: "#ef4444" },
                    { label: "Purple", color: "#8b5cf6" },
                    { label: "Cyan", color: "#06b6d4" },
                    { label: "Emerald", color: "#10b981" },
                    { label: "Amber", color: "#f59e0b" },
                  ].map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => handleColorChange(preset.color)}
                      className={`size-6 rounded-full border-2 transition-all ${
                        selectedColor === preset.color
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: preset.color }}
                      aria-label={`Select ${preset.label} color`}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      <span>Save Event</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
