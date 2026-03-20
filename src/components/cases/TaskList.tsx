"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import { TASK_STATUS_LABELS, formatDate, isOverdue, cn } from "@/lib/utils";
import { createTask, updateTask } from "@/actions/tasks";
import { Plus, Clock, Pencil, CircleDot, CheckCircle2, Circle, XCircle } from "lucide-react";

const priorityColors: Record<string, string> = {
  urgent: "text-red-600",
  high: "text-orange-600",
  medium: "text-yellow-600",
  low: "text-slate-500",
};

const statusCycle: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
  cancelled: "todo",
};

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === "done") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "in_progress") return <CircleDot className="h-4 w-4 text-blue-500" />;
  if (status === "cancelled") return <XCircle className="h-4 w-4 text-slate-400" />;
  return <Circle className="h-4 w-4 text-slate-300 hover:text-slate-500" />;
}

// ── Edit Dialog ──────────────────────────────────────────────────────────────
function TaskEditDialog({ task, caseId }: { task: Task; caseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [ownerName, setOwnerName] = useState(task.owner_name ?? "");
  const [dueAt, setDueAt] = useState(task.due_at ? task.due_at.split("T")[0] : "");
  const [status, setStatus] = useState<TaskStatus>(task.status);

  function handleSave() {
    if (!title.trim()) return;
    startTransition(async () => {
      await updateTask(task.id, caseId, {
        title: title.trim(),
        description: description || undefined,
        priority,
        owner_name: ownerName || null,
        due_at: dueAt || null,
        status,
      });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Input
            placeholder="Owner (optional)"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Due date</label>
            <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={!title.trim() || isPending} className="flex-1">
              {isPending ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Task Row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, caseId }: { task: Task; caseId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const overdue = isOverdue(task.due_at) && task.status !== "done" && task.status !== "cancelled";

  function handleCycleStatus() {
    const next = statusCycle[task.status];
    startTransition(async () => {
      await updateTask(task.id, caseId, { status: next });
      router.refresh();
    });
  }

  function handleCancel() {
    startTransition(async () => {
      await updateTask(task.id, caseId, { status: "cancelled" });
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 transition-colors",
        overdue ? "border-red-200 bg-red-50/50" : "hover:bg-accent/30",
        task.status === "done" && "opacity-60",
        task.status === "cancelled" && "opacity-40"
      )}
    >
      <button
        onClick={handleCycleStatus}
        disabled={isPending || task.status === "cancelled"}
        className="mt-0.5 shrink-0 disabled:cursor-default"
      >
        <StatusIcon status={task.status} />
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", task.status === "done" && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
        )}
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <span className={cn("text-xs font-medium", priorityColors[task.priority])}>
            {task.priority}
          </span>
          {task.owner_name && (
            <span className="text-xs text-muted-foreground">{task.owner_name}</span>
          )}
          {task.due_at && (
            <span className={cn("flex items-center gap-1 text-xs", overdue ? "text-red-600 font-medium" : "text-muted-foreground")}>
              <Clock className="h-3 w-3" />
              {overdue && "Overdue · "}
              {formatDate(task.due_at)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Badge variant="outline" className="text-xs hidden sm:flex">
          {TASK_STATUS_LABELS[task.status]}
        </Badge>
        <TaskEditDialog task={task} caseId={caseId} />
        {task.status !== "cancelled" && task.status !== "done" && (
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
            title="Cancel task"
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Create Dialog ─────────────────────────────────────────────────────────────
function CreateTaskDialog({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [ownerName, setOwnerName] = useState("");
  const [dueAt, setDueAt] = useState("");

  function handleCreate() {
    if (!title.trim()) return;
    startTransition(async () => {
      await createTask(caseId, {
        title: title.trim(),
        description: description || undefined,
        priority,
        owner_name: ownerName || undefined,
        due_at: dueAt || undefined,
      });
      setTitle("");
      setDescription("");
      setOwnerName("");
      setDueAt("");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </div>
          <Input
            placeholder="Owner (optional)"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
          <Button onClick={handleCreate} disabled={!title.trim() || isPending} className="w-full">
            {isPending ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
type Tab = "open" | "completed";

export function TaskList({ tasks, caseId }: { tasks: Task[]; caseId: string }) {
  const [tab, setTab] = useState<Tab>("open");

  const openTasks = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
  const completedTasks = tasks.filter((t) => t.status === "done" || t.status === "cancelled");
  const displayed = tab === "open" ? openTasks : completedTasks;

  const overdueCount = openTasks.filter((t) => isOverdue(t.due_at)).length;

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border p-0.5 bg-muted/40">
          <button
            onClick={() => setTab("open")}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-colors",
              tab === "open"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Open
            {openTasks.length > 0 && (
              <span className="ml-1.5 text-muted-foreground">{openTasks.length}</span>
            )}
            {overdueCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold w-4 h-4">
                {overdueCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("completed")}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-colors",
              tab === "completed"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Done
            {completedTasks.length > 0 && (
              <span className="ml-1.5 text-muted-foreground">{completedTasks.length}</span>
            )}
          </button>
        </div>
        <CreateTaskDialog caseId={caseId} />
      </div>

      {/* Task rows */}
      <div className="space-y-1.5">
        {displayed.map((task) => (
          <TaskRow key={task.id} task={task} caseId={caseId} />
        ))}
        {displayed.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            {tab === "open" ? "No open tasks." : "No completed tasks yet."}
          </p>
        )}
      </div>
    </div>
  );
}
