// Core domain types for Care Journey OS

export type JourneyType =
  | "egg_freezing"
  | "ivf"
  | "iui"
  | "surrogacy"
  | "donor_egg"
  | "other";

export type CaseStage =
  | "intake"
  | "insurance_verification"
  | "financing"
  | "clinic_coordination"
  | "medication_protocol"
  | "active_cycle"
  | "retrieval"
  | "transfer"
  | "post_procedure"
  | "completed"
  | "on_hold";

export type CaseStatus = "active" | "blocked" | "on_hold" | "completed" | "cancelled";

export type Urgency = "low" | "medium" | "high" | "critical";

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type NoteType = "general" | "clinical" | "financial" | "vendor" | "client_communication";

export type VendorType = "clinic" | "lender" | "pharmacy" | "lab" | "insurance" | "other";

export type VendorStatus = "active" | "pending" | "inactive";

export type AISummaryType = "case_summary" | "next_step_plan" | "notes_summary";

// Database row types
export interface Case {
  id: string;
  client_name: string;
  journey_type: JourneyType;
  current_stage: CaseStage;
  current_status: CaseStatus;
  owner_name: string;
  urgency: Urgency;
  next_step: string | null;
  blocker_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseStageHistory {
  id: string;
  case_id: string;
  stage_name: CaseStage;
  entered_at: string;
  exited_at: string | null;
  notes: string | null;
}

export interface Task {
  id: string;
  case_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  owner_name: string | null;
  due_at: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Note {
  id: string;
  case_id: string;
  author_name: string;
  body: string;
  note_type: NoteType;
  created_at: string;
}

export interface Document {
  id: string;
  case_id: string;
  document_type: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  vendor_type: VendorType;
  name: string;
  notes: string | null;
}

export interface CaseVendor {
  id: string;
  case_id: string;
  vendor_id: string;
  status: VendorStatus;
  notes: string | null;
  vendor?: Vendor;
}

export interface AISummary {
  id: string;
  case_id: string;
  summary_type: AISummaryType;
  content: string;
  created_at: string;
}

// Composite types for page data
export interface CaseDetail extends Case {
  stage_history: CaseStageHistory[];
  tasks: Task[];
  notes: Note[];
  documents: Document[];
  case_vendors: CaseVendor[];
  ai_summaries: AISummary[];
}

// Dashboard stats
export interface DashboardStats {
  total_cases: number;
  active_cases: number;
  blocked_cases: number;
  overdue_tasks: number;
}

// Overdue task with joined case client_name
export interface OverdueCaseTask extends Task {
  cases: { client_name: string } | null;
}
