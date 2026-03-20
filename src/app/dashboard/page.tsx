import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentCases } from "@/components/dashboard/RecentCases";
import { BlockedCases } from "@/components/dashboard/BlockedCases";
import { OverdueTasks } from "@/components/dashboard/OverdueTasks";
import { getDashboardStats, getRecentCases, getBlockedCases, getOverdueTasks } from "@/actions/cases";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, recentCases, blockedCases, overdueTasks] = await Promise.all([
    getDashboardStats(),
    getRecentCases(6),
    getBlockedCases(),
    getOverdueTasks(),
  ]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Operational overview</p>
        </div>

        <StatsCards stats={stats} />

        <div className="grid grid-cols-3 gap-6">
          {/* Recent cases — 2/3 width */}
          <div className="col-span-2">
            <RecentCases cases={recentCases} />
          </div>

          {/* Attention column — blocked + overdue stacked */}
          <div className="space-y-4">
            <BlockedCases cases={blockedCases} />
            <OverdueTasks tasks={overdueTasks} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
