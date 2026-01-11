'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ReportFilter } from '@/components/reports/report-filter';
import { FinancialReportLayout } from '@/components/reports/financial-report-layout';
import { Loader2 } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';

export default function IncomeStatementPage() {
    const [range, setRange] = useState({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
    });

    const { data: report, isLoading, refetch } = useQuery({
        queryKey: ['income-statement', range],
        queryFn: async () => {
            const res = await api.get('/reports/income-statement', {
                params: {
                    startDate: range.from.toISOString(),
                    endDate: range.to.toISOString()
                }
            });
            return res.data;
        }
    });

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const AccountRow = ({ name, code, amount, isTotal = false, level = 0, isNegative = false }: any) => (
        <div className={`flex justify-between py-1 ${isTotal ? 'font-bold border-t border-slate-300 mt-2 pt-2' : ''}`} style={{ paddingLeft: `${level * 16}px` }}>
            <div className="flex gap-4">
                <span className="text-slate-500 font-mono text-xs pt-1 w-16">{code}</span>
                <span>{name}</span>
            </div>
            <span className={isNegative ? 'text-red-600' : ''}>
                {isNegative && amount > 0 ? `(${formatMoney(amount).replace('Rp', '')})` : formatMoney(amount)}
            </span>
        </div>
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Laporan Laba Rugi</h1>
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
                    title="Laporan Laba Rugi (Income Statement)"
                    period={`${range.from.toLocaleDateString('id-ID')} s/d ${range.to.toLocaleDateString('id-ID')}`}
                    type="Income Statement"
                >
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* REVENUE */}
                        <div>
                            <h3 className="font-bold text-lg uppercase mb-4 border-b pb-2 bg-slate-50 p-2">Pendapatan (Revenue)</h3>
                            <div className="space-y-1 px-4">
                                {report.revenue.map((acc: any) => (
                                    <AccountRow key={acc.id} name={acc.namaAkun} code={acc.kodeAkun} amount={acc.saldo} />
                                ))}
                            </div>
                            <div className="px-4 mt-4">
                                <AccountRow name="TOTAL PENDAPATAN" code="" amount={report.summary.totalRevenue} isTotal />
                            </div>
                        </div>

                        {/* EXPENSE */}
                        <div>
                            <h3 className="font-bold text-lg uppercase mb-4 border-b pb-2 bg-slate-50 p-2">Beban (Expenses)</h3>
                            <div className="space-y-1 px-4">
                                {report.expense.map((acc: any) => (
                                    <AccountRow key={acc.id} name={acc.namaAkun} code={acc.kodeAkun} amount={acc.saldo} />
                                ))}
                            </div>
                            <div className="px-4 mt-4">
                                <AccountRow name="TOTAL BEBAN" code="" amount={report.summary.totalExpense} isTotal />
                            </div>
                        </div>

                        {/* NET INCOME */}
                        <div className="mt-8 pt-4 border-t-4 border-double border-slate-800 bg-slate-100 p-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>LABA / (RUGI) BERSIH</span>
                                <span className={report.summary.netIncome < 0 ? 'text-red-600' : 'text-green-700'}>
                                    {formatMoney(report.summary.netIncome)}
                                </span>
                            </div>
                        </div>

                    </div>
                </FinancialReportLayout>
            ) : null}
        </div>
    );
}
