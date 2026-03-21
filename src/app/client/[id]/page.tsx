import { notFound } from "next/navigation";
import { getCaseById } from "@/actions/cases";
import { STAGE_LABELS, JOURNEY_TYPE_LABELS, STAGE_ORDER, formatDate } from "@/lib/utils";
import { Heart, FileText, AlertTriangle, Clock, ChevronRight } from "lucide-react";
import type { CaseDetail, CaseVendor } from "@/types";

export const dynamic = "force-dynamic";

// ── Client-facing copy ────────────────────────────────────────────────────────

const STAGE_DESCRIPTIONS: Record<string, string> = {
  intake:                 "We're gathering your information and building your care plan.",
  insurance_verification: "We're reviewing your insurance coverage and confirming your benefits.",
  financing:              "We're helping arrange any financing needed for your treatment.",
  clinic_coordination:    "We're coordinating with your clinic and confirming your care team.",
  medication_protocol:    "Your care team is preparing your personalized medication schedule.",
  active_cycle:           "Your treatment cycle is actively underway. We're monitoring closely.",
  retrieval:              "Your retrieval procedure is being scheduled and coordinated.",
  transfer:               "Your embryo transfer is being prepared.",
  post_procedure:         "We're monitoring your results and providing follow-up care.",
  completed:              "Your care journey with us is complete.",
};

const VENDOR_TYPE_LABELS: Record<string, string> = {
  clinic:    "Your Clinic",
  lender:    "Financing Partner",
  pharmacy:  "Pharmacy",
  lab:       "Laboratory",
  insurance: "Insurance",
  other:     "Care Partner",
};

// ── Relevance logic ───────────────────────────────────────────────────────────

function getOrderedSections(c: CaseDetail): string[] {
  const { current_stage: stage, current_status: status } = c;

  if (stage === "completed") {
    return ["complete", "summary", "docs", "support"];
  }
  if (status === "on_hold") {
    return ["on_hold", "stage", "summary", "actions", "docs", "support"];
  }
  if (c.blocker_note) {
    // Blocked: surface the issue immediately, then show what can move forward
    return ["blocker", "stage", "actions", "vendors", "summary", "docs", "support"];
  }

  const activeStages = ["active_cycle", "medication_protocol", "retrieval", "transfer"];
  if (activeStages.includes(stage)) {
    // Critical phase: what to do right now is most important
    return ["stage", "actions", "vendors", "timeline", "summary", "docs", "support"];
  }
  if (stage === "financing") {
    // Financing: lead with the partner, then what's needed
    return ["stage", "vendors", "actions", "timeline", "summary", "docs", "support"];
  }
  if (["intake", "insurance_verification"].includes(stage)) {
    // Early stage: orientation first, then upcoming journey
    return ["stage", "timeline", "actions", "summary", "docs", "support"];
  }

  // Default
  return ["stage", "actions", "timeline", "vendors", "summary", "docs", "support"];
}

function getNextActions(c: CaseDetail) {
  return c.tasks
    .filter((t) => t.status !== "done" && t.status !== "cancelled")
    .sort((a, b) => {
      const p = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
      return (p[a.priority] ?? 3) - (p[b.priority] ?? 3);
    })
    .slice(0, 3);
}

function getRelevantVendors(c: CaseDetail): CaseVendor[] {
  const { current_stage: stage, journey_type: journey } = c;
  const stageIndex = STAGE_ORDER.indexOf(stage);

  return c.case_vendors.filter((cv) => {
    const type = cv.vendor?.vendor_type;
    if (!type) return false;
    if (type === "clinic")    return ["egg_freezing", "ivf", "iui"].includes(journey);
    if (type === "lender")    return ["egg_freezing", "ivf"].includes(journey) || ["financing", "clinic_coordination"].includes(stage);
    if (type === "pharmacy")  return ["egg_freezing", "ivf"].includes(journey) && stageIndex >= STAGE_ORDER.indexOf("medication_protocol") - 1;
    if (type === "insurance") return stageIndex <= STAGE_ORDER.indexOf("clinic_coordination");
    return true;
  });
}

// ── Section components ────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-6">{children}</div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-400 mb-4">
      {children}
    </p>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ClientPortalPage({ params }: { params: { id: string } }) {
  const caseData = await getCaseById(params.id);
  if (!caseData) notFound();
  const c = caseData!;

  const currentIndex  = STAGE_ORDER.indexOf(c.current_stage);
  const progress      = Math.round(((currentIndex + 1) / STAGE_ORDER.length) * 100);
  const upcomingStages = STAGE_ORDER.slice(currentIndex + 1, currentIndex + 4);
  const nextActions   = getNextActions(c);
  const relevantVendors = getRelevantVendors(c);
  const latestSummary = c.ai_summaries.find((s) => s.summary_type === "case_summary");
  const orderedSections = getOrderedSections(c);

  function renderSection(key: string): React.ReactNode {
    switch (key) {

      // ── Status banners ──────────────────────────────────────────────────────

      case "blocker":
        return (
          <div key="blocker" className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">Your attention is needed</p>
                <p className="text-sm text-amber-800 leading-relaxed">{c.blocker_note ?? ""}</p>
              </div>
            </div>
          </div>
        );

      case "on_hold":
        return (
          <div key="on_hold" className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <p className="text-sm font-semibold text-stone-700 mb-1">Your journey is currently paused</p>
            <p className="text-sm text-stone-500 leading-relaxed">
              We're working through a few things before the next step. Your coordinator will be in touch soon.
            </p>
          </div>
        );

      case "complete":
        return (
          <div key="complete" className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
            <p className="text-2xl mb-2">🌸</p>
            <p className="text-base font-semibold text-emerald-900">Journey Complete</p>
            <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
              Congratulations, {c.client_name.split(" ")[0]}. We're proud to have supported you through this journey.
            </p>
          </div>
        );

      // ── Stage progress ──────────────────────────────────────────────────────

      case "stage": {
        const shortLabels: Record<string, string> = {
          intake:                 "Intake",
          insurance_verification: "Insurance",
          financing:              "Financing",
          clinic_coordination:    "Clinic",
          medication_protocol:    "Meds",
          active_cycle:           "Cycle",
          retrieval:              "Retrieval",
          transfer:               "Transfer",
          post_procedure:         "Follow-up",
          completed:              "Done",
        };
        return (
          <Card key="stage">
            <Label>Your Journey</Label>

            {/* Visual milestone track */}
            <div className="flex items-start">
              {STAGE_ORDER.flatMap((s, i) => {
                const isCompleted = i < currentIndex;
                const isCurrent   = i === currentIndex;
                const isLast      = i === STAGE_ORDER.length - 1;
                const elements = [
                  <div key={`node-${s}`} className="flex flex-col items-center gap-1.5" style={{ flexShrink: 0 }}>
                    {/* Node */}
                    <div className={`flex items-center justify-center rounded-full transition-all ${
                      isCurrent
                        ? "h-7 w-7 bg-primary shadow-sm ring-[3px] ring-primary/20"
                        : isCompleted
                        ? "h-5 w-5 bg-emerald-500"
                        : "h-5 w-5 bg-white border-2 border-stone-200"
                    }`}>
                      {isCompleted && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                          <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {isCurrent && (
                        <span className="text-[9px] font-bold text-white leading-none">{i + 1}</span>
                      )}
                      {!isCompleted && !isCurrent && (
                        <span className="text-[8px] font-medium text-stone-300 leading-none">{i + 1}</span>
                      )}
                    </div>
                    {/* Short label */}
                    <span
                      className={`text-[9px] leading-tight text-center ${
                        isCurrent   ? "font-semibold text-primary" :
                        isCompleted ? "text-emerald-500" :
                                      "text-stone-300"
                      }`}
                      style={{ maxWidth: 36, wordBreak: "break-word" }}
                    >
                      {shortLabels[s] ?? s}
                    </span>
                  </div>,
                ];
                if (!isLast) {
                  elements.push(
                    <div key={`line-${s}`} className={`flex-1 h-0.5 mt-[13px] self-start ${
                      i < currentIndex ? "bg-emerald-400" : "bg-stone-100"
                    }`} />
                  );
                }
                return elements;
              })}
            </div>

            {/* Current stage detail */}
            <div className="mt-6 pt-5 border-t border-stone-100">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-lg font-semibold text-stone-900">
                  {STAGE_LABELS[c.current_stage]}
                </p>
                <p className="text-[11px] text-stone-400 ml-3 shrink-0">
                  Step {currentIndex + 1} of {STAGE_ORDER.length}
                </p>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">
                {STAGE_DESCRIPTIONS[c.current_stage]}
              </p>
            </div>
          </Card>
        );
      }

      // ── Next actions ────────────────────────────────────────────────────────

      case "actions":
        if (nextActions.length === 0) return null;
        return (
          <Card key="actions">
            <Label>Your Next Steps</Label>
            <div className="space-y-5">
              {nextActions.map((task, i) => (
                <div key={task.id} className="flex items-start gap-3.5">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[11px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 leading-snug">{task.title}</p>
                    {task.due_at && (
                      <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due {formatDate(task.due_at)}
                      </p>
                    )}
                  </div>
                  {task.priority === "urgent" && (
                    <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                      Urgent
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        );

      // ── Upcoming timeline ───────────────────────────────────────────────────

      case "timeline":
        if (upcomingStages.length === 0) return null;
        return (
          <Card key="timeline">
            <Label>What Comes Next</Label>
            <div className="space-y-0">
              {upcomingStages.map((stage, i) => {
                const isLast = i === upcomingStages.length - 1;
                return (
                  <div key={stage} className="flex gap-3.5">
                    {/* Connector column */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="h-6 w-6 rounded-full border-2 border-stone-200 bg-stone-50 flex items-center justify-center">
                        <span className="text-[9px] font-semibold text-stone-400">
                          {currentIndex + i + 2}
                        </span>
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-stone-100 my-1 min-h-[20px]" />}
                    </div>
                    {/* Text */}
                    <div className={`${isLast ? "pt-0.5" : "pt-0.5 pb-5"} flex-1 min-w-0`}>
                      <p className="text-sm font-medium text-stone-600">{STAGE_LABELS[stage]}</p>
                      <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                        {STAGE_DESCRIPTIONS[stage]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );

      // ── AI journey update ───────────────────────────────────────────────────

      case "summary":
        if (!latestSummary) return null;
        return (
          <div key="summary" className="rounded-2xl bg-stone-50 border border-stone-100 p-6">
            <Label>Journey Update</Label>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
              {latestSummary.content}
            </p>
            <p className="text-[11px] text-stone-400 mt-4">
              Updated {formatDate(latestSummary.created_at)}
            </p>
          </div>
        );

      // ── Vendors ─────────────────────────────────────────────────────────────

      case "vendors":
        if (relevantVendors.length === 0) return null;
        return (
          <Card key="vendors">
            <Label>Your Care Team</Label>
            <div className="space-y-4">
              {relevantVendors.map((cv) => (
                <div key={cv.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{cv.vendor?.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {VENDOR_TYPE_LABELS[cv.vendor?.vendor_type ?? "other"]}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    cv.status === "active"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-stone-100 text-stone-500"
                  }`}>
                    {cv.status === "active" ? "Confirmed" : "In Progress"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        );

      // ── Documents ───────────────────────────────────────────────────────────

      case "docs":
        if (c.documents.length === 0) return null;
        return (
          <Card key="docs">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-400">
                Your Documents
              </p>
              <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-500">
                {c.documents.length}
              </span>
            </div>
            <div className="space-y-1">
              {c.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-stone-50 transition-colors -mx-1"
                >
                  <div className="h-8 w-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-stone-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{doc.document_type}</p>
                    <p className="text-xs text-stone-400">{formatDate(doc.created_at)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stone-300 shrink-0" />
                </a>
              ))}
            </div>
          </Card>
        );

      // ── Support ─────────────────────────────────────────────────────────────

      case "support":
        return (
          <Card key="support">
            <Label>Your Coordinator</Label>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {c.owner_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">{c.owner_name}</p>
                <p className="text-xs text-stone-400">Dedicated care coordinator</p>
              </div>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              Have a question or need to share something? Your coordinator is here at every step —
              reply to your welcome email or use the contact details we provided at intake.
            </p>
          </Card>
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-stone-100">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-2.5">
          <Heart className="h-4 w-4 text-rose-400" strokeWidth={2.5} />
          <p className="text-sm font-semibold text-stone-800">Care Journey</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8 space-y-4">
        {/* Greeting */}
        <div className="pb-2">
          <h1 className="text-2xl font-semibold text-stone-900">
            Hi, {c.client_name.split(" ")[0]}
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {JOURNEY_TYPE_LABELS[c.journey_type]} Journey
          </p>
        </div>

        {orderedSections.map((key) => renderSection(key))}
      </main>

      <footer className="max-w-lg mx-auto px-6 pb-12 pt-4">
        <p className="text-center text-[11px] text-stone-300">
          Your information is private and secure.
        </p>
      </footer>
    </div>
  );
}
