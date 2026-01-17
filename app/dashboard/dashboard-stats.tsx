import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  LucideIcon,
} from "lucide-react";
import { HelpIndicator } from "@/components/ui/help-indicator";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
  stats?: {
    revenue?: number;
    expense?: number;
    netProfit?: number;
    pendingApprovals?: number;
  };
}

interface StatCard {
  title: string;
  value: number;
  helpText: string;
  description: string;
  icon: LucideIcon;
  cardClassName: string;
  titleClassName: string;
  iconClassName: string;
  valueClassName: string;
  descriptionClassName: string;
  formatValue?: (value: number) => string;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards: StatCard[] = [
    {
      title: "Total Pendapatan",
      value: stats?.revenue || 0,
      helpText: "Total semua pendapatan yang telah diposting ke buku besar.",
      description: "Akumulasi pendapatan terposting",
      icon: DollarSign,
      cardClassName: "bg-sky-500 border-none",
      titleClassName: "text-sm font-medium text-white",
      iconClassName: "h-4 w-4 text-white",
      valueClassName: "text-2xl font-bold text-white",
      descriptionClassName: "text-xs text-white/80 mt-1",
      formatValue: formatCurrency,
    },
    {
      title: "Total Beban",
      value: stats?.expense || 0,
      helpText: "Total biaya operasional dan non-operasional.",
      description: "Akumulasi beban operasional",
      icon: TrendingDown,
      cardClassName: "bg-rose-500 border-none",
      titleClassName: "text-sm font-medium text-white",
      iconClassName: "h-4 w-4 text-white",
      valueClassName: "text-2xl font-bold text-white",
      descriptionClassName: "text-xs text-white mt-1",
      formatValue: formatCurrency,
    },
    {
      title: "Laba Bersih",
      value: stats?.netProfit || 0,
      helpText: "Pendapatan dikurangi total beban (Net Profit).",
      description: "Pendapatan - Beban",
      icon: TrendingUp,
      cardClassName: "bg-emerald-500 border-none",
      titleClassName: "text-sm font-medium text-white",
      iconClassName: "h-4 w-4 text-white",
      valueClassName: "text-2xl font-bold text-white",
      descriptionClassName: "text-xs text-white mt-1",
      formatValue: formatCurrency,
    },
    {
      title: "Pending Approval",
      value: stats?.pendingApprovals || 0,
      helpText: "Jumlah transaksi yang menunggu persetujuan Manager.",
      description: "Menunggu persetujuan",
      icon: Activity,
      cardClassName: "bg-amber-500 border-none",
      titleClassName: "text-sm font-medium text-white",
      iconClassName: "h-4 w-4 text-white",
      valueClassName: "text-2xl font-bold text-white",
      descriptionClassName: "text-xs text-white mt-1",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        const displayValue = card.formatValue
          ? card.formatValue(card.value)
          : card.value;

        return (
          <Card key={index} className={card.cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`${card.titleClassName} flex items-center gap-2`}
              >
                {card.title}
                <HelpIndicator content={card.helpText} />
              </CardTitle>
              <Icon className={card.iconClassName} />
            </CardHeader>
            <CardContent>
              <div className={card.valueClassName}>{displayValue}</div>
              <p className={card.descriptionClassName}>{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
