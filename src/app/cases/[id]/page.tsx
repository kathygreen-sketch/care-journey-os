import { notFound } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StageTracker } from "@/components/cases/StageTracker";
import { StageAdvanceButton } from "@/components/cases/StageAdvanceButton";
import { CaseEditDialog } from "@/components/cases/CaseEditDialog";
import { TaskList } from "@/components/cases/TaskList";
import { NotesList } from "@/components/cases/NotesList";
import { DocumentsList } from "@/components/cases/DocumentsList";
import { VendorsList } from "@/components/cases/VendorsList";
import { AISummarySection } from "@/components/cases/AISummarySection";
import { getCaseById } from "@/actions/cases";
import { getVendors } from "@/actions/vendors";
import {
  STAGE_LABELS,
  STATUS_LABELS,
  JOURNEY_TYPE_LABELS,
  URGENCY_LABELS,
  formatDate,
} from "@/lib/utils";
import { AlertCircle, ArrowLeft, ExternalLink, User, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const [caseDetail, allVendors] = await Promise.all([
    getCaseById(params.id),
    getVendors(),
  ]);
  if (!caseDetail) notFound();

  const urgencyColors: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-slate-100 text-slate-600",
  };

  const statusVariant: Record<string, "active" | "blocked" | "on_hold" | "completed" | "cancelled"> = {
    active: "active",
    blocked: "blocked",
    on_hold: "on_hold",
    completed: "completed",
    cancelled: "cancelled",
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/cases" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Cases
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{caseDetail.client_name}</span>
          </div>
        </div>

        {/* Blocker alert — shown first if present */}
        {caseDetail.blocker_note && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Case Blocked</p>
              <p className="text-sm text-red-700 mt-0.5">{caseDetail.blocker_note}</p>
            </div>
            {/* Quick resolve — opens edit dialog pre-focused */}
            <CaseEditDialog caseData={caseDetail} />
          </div>
        )}

        {/* Overview card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">{caseDetail.client_name}</h1>
                <p className="text-muted-foreground mt-1">{JOURNEY_TYPE_LABELS[caseDetail.journey_type]}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={statusVariant[caseDetail.current_status]}>
                  {STATUS_LABELS[caseDetail.current_status]}
                </Badge>
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${urgencyColors[caseDetail.urgency]}`}>
                  {URGENCY_LABELS[caseDetail.urgency]} Urgency
                </span>
                {/* Edit button lives here */}
                <CaseEditDialog caseData={caseDetail} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Current Stage</p>
                <p className="text-sm font-medium mt-1">{STAGE_LABELS[caseDetail.current_stage]}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Case Owner</p>
                <p className="text-sm font-medium mt-1 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> {caseDetail.owner_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Opened</p>
                <p className="text-sm font-medium mt-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {formatDate(caseDetail.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Client Portal</p>
                <Link
                  href={`/client/${caseDetail.id}`}
                  target="_blank"
                  className="text-sm font-medium mt-1 flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View Portal
                </Link>
              </div>
            </div>

            {caseDetail.next_step && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Next Step</p>
                  <p className="text-sm">{caseDetail.next_step}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Main content grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left column: Stage tracker + advance button */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Stage Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <StageTracker
                  currentStage={caseDetail.current_stage}
                  history={caseDetail.stage_history}
                />
                <StageAdvanceButton
                  caseId={caseDetail.id}
                  currentStage={caseDetail.current_stage}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="col-span-2 space-y-6">
            {/* Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList tasks={caseDetail.tasks} caseId={caseDetail.id} />
              </CardContent>
            </Card>

            {/* AI Summaries */}
            <div>
              <h2 className="text-base font-semibold mb-3">AI Insights</h2>
              <AISummarySection caseDetail={caseDetail} summaries={caseDetail.ai_summaries} />
            </div>

            {/* Vendors */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <VendorsList
                  caseVendors={caseDetail.case_vendors}
                  allVendors={allVendors}
                  caseId={caseDetail.id}
                />
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <NotesList notes={caseDetail.notes} caseId={caseDetail.id} />
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentsList documents={caseDetail.documents} caseId={caseDetail.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
