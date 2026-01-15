import prisma from '../../lib/prisma';

export interface NotificationData {
    userId: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    category?: 'APPROVAL' | 'PAYMENT' | 'SYSTEM' | 'INVENTORY';
    referenceId?: string;
    urlAction?: string;
}

export class NotificationService {
    /**
     * Send in-app notification
     */
    static async send(data: NotificationData) {
        try {
            await prisma.notifikasi.create({
                data: {
                    penggunaId: data.userId,
                    judul: data.title,
                    pesan: data.message,
                    tipe: data.type,
                    kategori: data.category,
                    referensiId: data.referenceId,
                    urlAction: data.urlAction
                }
            });
        } catch (error) {
            console.error('[NotificationService] Failed to send notification:', error);
        }
    }

    /**
     * Broadcast to all admins of a company
     */
    static async notifyAdmins(perusahaanId: string, data: Omit<NotificationData, 'userId'>) {
        try {
            const admins = await prisma.aksesPengguna.findMany({
                where: {
                    perusahaanId,
                    role: { in: ['ADMIN', 'SUPERADMIN'] } // assuming these roles exist in old enum or check Role model
                },
                select: { penggunaId: true }
            });

            for (const admin of admins) {
                await this.send({ ...data, userId: admin.penggunaId });
            }
        } catch (error) {
            console.error('[NotificationService] Failed to notify admins:', error);
        }
    }
}
