'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ReportFilter } from '@/components/reports/report-filter';
import { FinancialReportLayout } from '@/components/reports/financial-report-layout';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { startOfYear } from 'date-fns';

interface BSAccount {
    id: string;
    kodeAkun: string;
    namaAkun: string;
    saldo: number;
}

interface BSReport {
    assets: BSAccount[];
    liabilities: BSAccount[];
    equity: BSAccount[];
    currentEarnings: number;
    summary: {
        totalAssets: number;
        totalLiabilities: number;
        totalEquity: number;
        balanceCheck: number;
    };
}

interface AccountRowProps {
    name: string;
    code: string;
    amount: number;
    isTotal?: boolean;
    level?: number;
}

const AccountRow = ({ name, code, amount, isTotal = false, level = 0 }: AccountRowProps) => (
    <div className={`flex justify-between py-1 ${isTotal ? 'font-bold border-t border-slate-300 mt-2 pt-2' : ''}`} style={{ paddingLeft: `${level * 16}px` }}>
        <div className="flex gap-4">
            <span className="text-slate-500 font-mono text-xs pt-1">{code}</span>
            <span>{name}</span>
        </div>
        <span>{formatCurrency(amount)}</span>
    </div>
);

interface SectionProps {
    title: string;
    data: BSAccount[];
    total: number;
}

const Section = ({ title, data, total }: SectionProps) => (
    <div className="mb-8">
        <h3 className="font-bold text-lg uppercase mb-4 border-b pb-2">{title}</h3>
        <div className="space-y-1">
            {data.map((acc) => (
                <AccountRow key={acc.id} name={acc.namaAkun} code={acc.kodeAkun} amount={acc.saldo} />
            ))}
        </div>
        <AccountRow name={`TOTAL ${title}`} code="" amount={total} isTotal />
    </div>
);

export default function BalanceSheetPage() {
    const [range, setRange] = useState({
        from: startOfYear(new Date()),
        to: new Date()
    });

    const { data: report, isLoading, refetch } = useQuery<BSReport>({
        queryKey: ['balance-sheet', range],
        queryFn: async () => {
            const res = await api.get('/reports/balance-sheet', {
                params: {
                    endDate: range.to.toISOString()
                }
            });
            return res.data;
        }
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Neraca Keuangan / Posisi Keuangan</h1>
            <ReportFilter
                defaultFrom={range.from}
                defaultTo={range.to}
                onGenerate={(r) => { setRange(r); setTimeout(refetch, 100); }}
                isLoading={isLoading}
            />

            {isLoading ? (
                <div className="flex h-96 justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : report ? (
                <FinancialReportLayout
                    title="Laporan Posisi Keuangan (Neraca)"
                    period={`Per Tanggal ${range.to.toLocaleDateString('id-ID')}`}
                    type="Balance Sheet"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* LEFT SIDE: ASSETS */}
                        <div>
                            <Section title="ASET" data={report.assets} total={report.summary.totalAssets} />
                        </div>

                        {/* RIGHT SIDE: LIABILITIES + EQUITY */}
                        <div>
                            <Section title="LIABILITAS" data={report.liabilities} total={report.summary.totalLiabilities} />

                            <div className="mt-8">
                                <h3 className="font-bold text-lg uppercase mb-4 border-b pb-2">EKUITAS</h3>
                                <div className="space-y-1">
                                    {report.equity.map((acc) => (
                                        <AccountRow key={acc.id} name={acc.namaAkun} code={acc.kodeAkun} amount={acc.saldo} />
                                    ))}
                                    <AccountRow
                                        name="Laba Tahun Berjalan"
                                        code="3-9999"
                                        amount={report.currentEarnings}
                                    />
                                </div>
                                <AccountRow
                                    name="TOTAL EKUITAS"
                                    code=""
                                    amount={report.summary.totalEquity}
                                    isTotal
                                />
                            </div>

                            <div className="mt-8 pt-4 border-t-2 border-slate-800">
                                <AccountRow
                                    name="TOTAL LIABILITAS & EKUITAS"
                                    code=""
                                    amount={report.summary.totalLiabilities + report.summary.totalEquity}
                                    isTotal
                                />
                            </div>
                        </div>
                    </div>
                </FinancialReportLayout>
            ) : null}
        </div>
    );
}
