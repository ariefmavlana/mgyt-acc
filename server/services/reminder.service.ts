import { differenceInDays, startOfDay } from 'date-fns';
import prisma from '../../lib/prisma';

export interface ReminderResult {
    invoiceId: string;
    nomorInvoice: string;
    pelangganNama: string;
    type: 'UPCOMING' | 'DUE' | 'OVERDUE';
    days: number;
    emailSent: boolean;
}

export class ReminderService {
    static async processReminders() {
        const today = startOfDay(new Date());

        // Find all unpaid invoices
        const unpaidPiutangs = await prisma.piutang.findMany({
            where: {
                sisaPiutang: { gt: 0 },
            },
            include: {
                pelanggan: {
                    select: { nama: true, email: true }
                },
                transaksi: {
                    select: { nomorTransaksi: true }
                }
            }
        });

        const results: ReminderResult[] = [];

        for (const p of unpaidPiutangs) {
            const dueDate = startOfDay(new Date(p.tanggalJatuhTempo));
            const diff = differenceInDays(dueDate, today);

            let reminderType: 'UPCOMING' | 'DUE' | 'OVERDUE' | null = null;
            let days = 0;

            // Logic:
            // 3 days before: UPCOMING
            // On due date: DUE
            // 7, 14, 30 days after: OVERDUE

            if (diff === 3) {
                reminderType = 'UPCOMING';
                days = 3;
            } else if (diff === 0) {
                reminderType = 'DUE';
                days = 0;
            } else if (diff === -7 || diff === -14 || diff === -30) {
                reminderType = 'OVERDUE';
                days = Math.abs(diff);
            }

            if (reminderType && p.transaksi) {
                const emailSent = await this.sendMockEmail({
                    to: p.pelanggan?.email || 'N/A',
                    subject: this.getSubject(reminderType, days),
                    body: this.getBody(p.pelanggan?.nama || 'Pelanggan', p.transaksi.nomorTransaksi, reminderType, days, Number(p.sisaPiutang))
                });

                results.push({
                    invoiceId: p.transaksiId || '',
                    nomorInvoice: p.transaksi.nomorTransaksi,
                    pelangganNama: p.pelanggan?.nama || 'N/A',
                    type: reminderType,
                    days,
                    emailSent
                });
            }
        }

        return results;
    }

    private static getSubject(type: 'UPCOMING' | 'DUE' | 'OVERDUE', days: number) {
        if (type === 'UPCOMING') return `Reminder: Invoice bapak/ibu jatuh tempo dalam ${days} hari`;
        if (type === 'DUE') return `PENTING: Invoice bapak/ibu jatuh tempo HARI INI`;
        return `PERINGATAN: Invoice bapak/ibu sudah jatuh tempo ${days} hari`;
    }

    private static getBody(name: string, invNo: string, type: 'UPCOMING' | 'DUE' | 'OVERDUE', days: number, amount: number) {
        const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
        return `Halo ${name},\n\nKami mengingatkan bahwa invoice ${invNo} sebesar ${formattedAmount} ${type === 'UPCOMING' ? `akan jatuh tempo dalam ${days} hari.` : type === 'DUE' ? 'jatuh tempo hari ini.' : `telah terlambat ${days} hari.`}\n\nMohon segera lakukan pembayaran.\n\nTerima kasih,\nTim Keuangan`;
    }

    private static async sendMockEmail(data: { to: string, subject: string, body: string }) {
        console.log(`[EMAIL SEND] To: ${data.to} | Subject: ${data.subject}`);
        console.log(`Body: ${data.body}`);
        return true; // Mock success
    }
}
