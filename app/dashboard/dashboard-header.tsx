import React from "react";

interface DashboardHeaderProps {
  companyName?: string;
  currentDate: string;
}

export function DashboardHeader({
  companyName,
  currentDate,
}: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Ringkasan keuangan {companyName} per{" "}
          <span className="text-sky-500 font-bold">{currentDate}</span>
        </p>
      </div>
    </div>
  );
}
