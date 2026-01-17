"use client";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { useDashboard } from "@/hooks/use-dashboard";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DashboardHeader } from "./dashboard-header";
import { DashboardStats } from "./dashboard-stats";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { SystemStatus } from "./system-status";
import { QuickActions } from "./quick-actions";

export default function DashboardPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { data: stats, isLoading: statsLoading } = useDashboard();

  if (authLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white flex flex-col gap-6 p-6 rounded-2xl">
        <DashboardHeader
          companyName={user?.perusahaan?.nama}
          currentDate={format(new Date(), "dd MMMM yyyy", { locale: id })}
        />

        <DashboardStats stats={stats} />

        {stats && <DashboardCharts stats={stats} />}

        <div className="grid gap-6 md:grid-cols-2">
          <SystemStatus user={user} stats={stats} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
