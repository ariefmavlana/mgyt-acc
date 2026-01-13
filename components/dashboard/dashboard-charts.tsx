'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DashboardStats } from '@/hooks/use-dashboard';

interface DashboardChartsProps {
    stats: DashboardStats;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function DashboardCharts({ stats }: DashboardChartsProps) {
    // 1. Prepare Data for User Roles Pie Chart
    const roleData = Object.entries(stats.usersByRole || {}).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
    }));

    // 2. Prepare Data for Financial Overview (Revenue vs Expense)
    const financialData = [
        { name: 'Pendapatan', amount: stats.revenue, fill: '#10b981' }, // Emerald-500
        { name: 'Pengeluaran', amount: stats.expense, fill: '#ef4444' }, // Red-500
        { name: 'Laba Bersih', amount: stats.netProfit, fill: '#3b82f6' }, // Blue-500
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-sm">
                    <p className="font-semibold text-slate-800 mb-1">{label || payload[0].name}</p>
                    <p className="text-slate-500">
                        {payload[0].value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                    </p>
                </div>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border border-slate-100 shadow-lg rounded-md text-xs">
                    <span className="font-medium">{payload[0].name}:</span> {payload[0].value} User
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Chart 1: Financial Overview */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800">Ringkasan Keuangan</CardTitle>
                    <CardDescription>Perbandingan pendapatan, pengeluaran, dan laba bulan ini</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    width={100}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Chart 2: User Roles Distribution */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800">Distribusi Pengguna</CardTitle>
                    <CardDescription>Komposisi pengguna aktif berdasarkan role akses</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full relative">
                        {roleData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {roleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PieTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-slate-600 text-sm ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                                Tidak ada data role tersedia
                            </div>
                        )}
                        {/* Center Text for Pie Donut */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                            <span className="text-2xl font-bold text-slate-800">
                                {roleData.reduce((acc, curr) => acc + curr.value, 0)}
                            </span>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Total</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
