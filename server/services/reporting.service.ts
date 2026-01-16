import { differenceInDays, startOfDay } from 'date-fns';
import prisma from '../../lib/prisma';

export interface AgingBucket {
    current: number;
    days1_30: number;
    days31_60: number;
    days61_90: number;
    days90plus: number;
    total: number;
}

export interface CustomerAging extends AgingBucket {
    pelangganId: string;
    pelangganNama: string;
}

export interface SupplierAging extends AgingBucket {
    pemasokId: string;
    pemasokNama: string;
}

export class ReportingService {
    static async calculateARAging(perusahaanId: string, cabangId?: string) {
        const piutangs = await prisma.piutang.findMany({
            where: {
                perusahaanId,
                sisaPiutang: { gt: 0 },
                transaksi: cabangId ? { cabangId } : undefined
            },
            include: {
                pelanggan: {
                    select: { id: true, nama: true }
                }
            }
        });

        const today = startOfDay(new Date());
        const report: Record<string, CustomerAging> = {};

        for (const p of piutangs) {
            if (!p.pelanggan) continue;

            const dueDate = startOfDay(new Date(p.tanggalJatuhTempo));
            const daysOverdue = differenceInDays(today, dueDate);
            const amount = Number(p.sisaPiutang);
            const cid = p.pelangganId;

            if (!report[cid]) {
                report[cid] = {
                    pelangganId: cid,
                    pelangganNama: p.pelanggan.nama,
                    current: 0,
                    days1_30: 0,
                    days31_60: 0,
                    days61_90: 0,
                    days90plus: 0,
                    total: 0
                };
            }

            report[cid].total += amount;

            if (daysOverdue <= 0) {
                report[cid].current += amount;
            } else if (daysOverdue <= 30) {
                report[cid].days1_30 += amount;
            } else if (daysOverdue <= 60) {
                report[cid].days31_60 += amount;
            } else if (daysOverdue <= 90) {
                report[cid].days61_90 += amount;
            } else {
                report[cid].days90plus += amount;
            }
        }

        return Object.values(report);
    }

    static async calculateAPAging(perusahaanId: string, cabangId?: string) {
        const hutangs = await prisma.hutang.findMany({
            where: {
                perusahaanId,
                sisaHutang: { gt: 0 },
                transaksi: cabangId ? { cabangId } : undefined
            },
            include: {
                pemasok: {
                    select: { id: true, nama: true }
                }
            }
        });

        const today = startOfDay(new Date());
        const report: Record<string, SupplierAging> = {};

        for (const h of hutangs) {
            if (!h.pemasok) continue;

            const dueDate = startOfDay(new Date(h.tanggalJatuhTempo));
            const daysOverdue = differenceInDays(today, dueDate);
            const amount = Number(h.sisaHutang);
            const sid = h.pemasokId;

            if (!report[sid]) {
                report[sid] = {
                    pemasokId: sid,
                    pemasokNama: h.pemasok.nama,
                    current: 0,
                    days1_30: 0,
                    days31_60: 0,
                    days61_90: 0,
                    days90plus: 0,
                    total: 0
                };
            }

            report[sid].total += amount;

            if (daysOverdue <= 0) {
                report[sid].current += amount;
            } else if (daysOverdue <= 30) {
                report[sid].days1_30 += amount;
            } else if (daysOverdue <= 60) {
                report[sid].days31_60 += amount;
            } else if (daysOverdue <= 90) {
                report[sid].days61_90 += amount;
            } else {
                report[sid].days90plus += amount;
            }
        }

        return Object.values(report);
    }
}
