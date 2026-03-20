import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/types";
import { FolderOpen, Activity, AlertCircle, Clock } from "lucide-react";

interface StatConfig {
  key: keyof DashboardStats;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  href: string;
  alertWhenNonZero?: boolean;
}

const statConfig: StatConfig[] = [
  {
    key: "total_cases",
    label: "Total Cases",
    icon: FolderOpen,
    color: "text-slate-600",
    bg: "bg-slate-50",
    href: "/cases",
  },
  {
    key: "active_cases",
    label: "Active Cases",
    icon: Activity,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    href: "/cases?status=active",
  },
  {
    key: "blocked_cases",
    label: "Blocked",
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    href: "/cases?status=blocked",
    alertWhenNonZero: true,
  },
  {
    key: "overdue_tasks",
    label: "Overdue Tasks",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    href: "/cases",
    alertWhenNonZero: true,
  },
];

export function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {statConfig.map((config) => {
        const value = stats[config.key];
        const isAlert = config.alertWhenNonZero && value > 0;

        return (
          <Link key={config.key} href={config.href} className="block group">
            <Card className={`transition-shadow hover:shadow-md ${isAlert ? "border-red-200" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className={`mt-1 text-2xl font-semibold ${isAlert ? "text-red-700" : ""}`}>
                      {value}
                    </p>
                    {isAlert && (
                      <p className="text-xs text-red-600 mt-0.5">Needs attention</p>
                    )}
                  </div>
                  <div className={`rounded-lg p-2.5 ${config.bg} group-hover:scale-105 transition-transform`}>
                    <config.icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
