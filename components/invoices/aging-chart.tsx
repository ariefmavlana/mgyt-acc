'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AgingData {
    pelangganNama: string;
    current: number;
    days1_30: number;
    days31_60: number;
    days61_90: number;
    days90plus: number;
    total: number;
}

interface AgingChartProps {
    data: AgingData[];
}

export function AgingChart({ data }: AgingChartProps) {
    // Transform data for chart if needed, or use as is
    // We want to Stacked Bar Chart by Aging Buckets per Customer or Aggregate?
    // User asked for "Aging Reports".
    // Let's show Aggregate Aging (Total for company) by Bucket.

    const aggregatedData = [
        { name: 'Current', amount: data.reduce((acc, curr) => acc + curr.current, 0) },
        { name: '1-30 Days', amount: data.reduce((acc, curr) => acc + curr.days1_30, 0) },
        { name: '31-60 Days', amount: data.reduce((acc, curr) => acc + curr.days31_60, 0) },
        { name: '61-90 Days', amount: data.reduce((acc, curr) => acc + curr.days61_90, 0) },
        { name: '> 90 Days', amount: data.reduce((acc, curr) => acc + curr.days90plus, 0) },
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `Rp${value / 1000}k`}
                />
                <Tooltip
                    formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                    cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="amount" fill="#adfa1d" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
