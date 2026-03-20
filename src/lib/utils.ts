import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), "MMM d, yyyy");
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function isOverdue(dueDateString: string | null): boolean {
  if (!dueDateString) return false;
  return isPast(new Date(dueDateString));
}

// Human-readable labels for enum values
export const STAGE_LABELS: Record<string, string> = {
  intake: "Intake",
  insurance_verification: "Insurance Verification",
  financing: "Financing",
  clinic_coordination: "Clinic Coordination",
  medication_protocol: "Medication Protocol",
  active_cycle: "Active Cycle",
  retrieval: "Retrieval",
  transfer: "Transfer",
  post_procedure: "Post Procedure",
  completed: "Completed",
  on_hold: "On Hold",
};

export const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  blocked: "Blocked",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const URGENCY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const JOURNEY_TYPE_LABELS: Record<string, string> = {
  egg_freezing: "Egg Freezing",
  ivf: "IVF",
  iui: "IUI",
  surrogacy: "Surrogacy",
  donor_egg: "Donor Egg",
  other: "Other",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

export const NOTE_TYPE_LABELS: Record<string, string> = {
  general: "General",
  clinical: "Clinical",
  financial: "Financial",
  vendor: "Vendor",
  client_communication: "Client Communication",
};

export const VENDOR_TYPE_LABELS: Record<string, string> = {
  clinic: "Clinic",
  lender: "Lender",
  pharmacy: "Pharmacy",
  lab: "Lab",
  insurance: "Insurance",
  other: "Other",
};

// Ordered stages for the tracker
export const STAGE_ORDER: string[] = [
  "intake",
  "insurance_verification",
  "financing",
  "clinic_coordination",
  "medication_protocol",
  "active_cycle",
  "retrieval",
  "transfer",
  "post_procedure",
  "completed",
];
