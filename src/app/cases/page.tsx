import { AppLayout } from "@/components/layout/AppLayout";
import { CaseTable } from "@/components/cases/CaseTable";
import { CreateCaseDialog } from "@/components/cases/CreateCaseDialog";
import { getCases } from "@/actions/cases";

export const dynamic = "force-dynamic";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: { status?: string; stage?: string };
}) {
  const cases = await getCases();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Cases</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{cases.length} total</p>
          </div>
          <CreateCaseDialog />
        </div>

        <CaseTable
          cases={cases}
          initialStatus={searchParams.status ?? "all"}
          initialStage={searchParams.stage ?? "all"}
        />
      </div>
    </AppLayout>
  );
}
