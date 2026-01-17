import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface SystemStatusProps {
  user?: {
    perusahaan?: {
      nama?: string;
    };
  } | null; // Tambahkan | null
  stats?: {
    activeUsers?: number;
    usersByRole?: Record<string, number>;
    cashBalance?: number;
  };
}

export function SystemStatus({ user, stats }: SystemStatusProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Status Sistem</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-slate-600">
              Perusahaan
            </span>
            <span className="font-semibold text-slate-900">
              {user?.perusahaan?.nama || "-"}
            </span>
          </div>

          {/* Active Users Section with Breakdown */}
          <div className="p-3 bg-slate-50 rounded-lg space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-sm font-medium text-slate-600">
                Pengguna Aktif
              </span>
              <span className="font-semibold text-slate-900">
                {stats?.activeUsers || 0} User
              </span>
            </div>
            {stats?.usersByRole && Object.keys(stats.usersByRole).length > 0 ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {Object.entries(stats.usersByRole).map(([role, count]) => (
                  <div key={role} className="flex justify-between text-xs">
                    <span className="text-slate-500 capitalize">
                      {role.toLowerCase()}
                    </span>
                    <span className="font-medium text-slate-700">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic text-center">
                Tidak ada data role
              </div>
            )}
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-slate-600">
              Saldo Kas
            </span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(stats?.cashBalance || 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
