"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Note, NoteType } from "@/types";
import { NOTE_TYPE_LABELS, formatDateTime } from "@/lib/utils";
import { createNote, deleteNote } from "@/actions/notes";
import { MessageSquare, Trash2 } from "lucide-react";

const noteTypeColors: Record<NoteType, string> = {
  general:              "bg-slate-100 text-slate-700",
  clinical:             "bg-blue-100 text-blue-700",
  financial:            "bg-green-100 text-green-700",
  vendor:               "bg-purple-100 text-purple-700",
  client_communication: "bg-rose-100 text-rose-700",
};

function NoteRow({ note, caseId }: { note: Note; caseId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteNote(note.id, caseId);
      router.refresh();
    });
  }

  return (
    <div className="group rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">{note.author_name}</span>
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${noteTypeColors[note.note_type]}`}>
            {NOTE_TYPE_LABELS[note.note_type]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatDateTime(note.created_at)}</span>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent text-muted-foreground hover:text-destructive"
            title="Delete note"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="text-sm whitespace-pre-wrap text-foreground/90">{note.body}</p>
    </div>
  );
}

export function NotesList({ notes, caseId }: { notes: Note[]; caseId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("general");
  const [authorName, setAuthorName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!body.trim() || !authorName.trim()) return;
    startTransition(async () => {
      await createNote(caseId, { body: body.trim(), note_type: noteType, author_name: authorName.trim() });
      setBody("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <div className="rounded-lg border p-4 space-y-3">
        <Textarea
          placeholder="Add a note..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
        />
        <div className="flex items-center gap-2">
          <Input
            className="flex-1"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
          <Select value={noteType} onValueChange={(v) => setNoteType(v as NoteType)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(NOTE_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleSubmit}
            disabled={!body.trim() || !authorName.trim() || isPending}
            size="sm"
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Notes log */}
      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteRow key={note.id} note={note} caseId={caseId} />
          ))}
        </div>
      )}
    </div>
  );
}
