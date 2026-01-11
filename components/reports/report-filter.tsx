'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Card,
    CardContent,
} from '@/components/ui/card';

interface ReportFilterProps {
    onGenerate: (range: { from: Date; to: Date }) => void;
    defaultFrom?: Date;
    defaultTo?: Date;
    isLoading?: boolean;
}

export function ReportFilter({ onGenerate, defaultFrom, defaultTo, isLoading }: ReportFilterProps) {
    const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: defaultFrom,
        to: defaultTo,
    });

    const handleApply = () => {
        if (date.from && date.to) {
            onGenerate({ from: date.from, to: date.to });
        }
    };

    return (
        <Card className="mb-6">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-muted-foreground mr-4">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filter Laporan:</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[300px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLO dd, y")} -{" "}
                                                {format(date.to, "LLO dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLO dd, y")
                                        )
                                    ) : (
                                        <span>Pilih Rentang Tanggal</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={(range) => setDate({ from: range?.from, to: range?.to })}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <Button onClick={handleApply} disabled={isLoading || !date.from || !date.to}>
                    {isLoading ? 'Memproses...' : 'Terapkan & Buat Laporan'}
                </Button>
            </CardContent>
        </Card>
    );
}
