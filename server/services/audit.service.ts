import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

export interface AccessLogData {
    perusahaanId: string;
    userId: string;
    action: string;
    entity: string; // Maps to namaTabel
    entityId?: string; // Maps to idData
    module?: string; // Maps to modul
    subModule?: string; // Maps to subModul
    details?: string; // Maps to keterangan
    metadata?: Prisma.InputJsonValue; // Maps to changes/after state
    dataBefore?: Prisma.InputJsonValue; // Maps to dataSebelum
    dataAfter?: Prisma.InputJsonValue; // Maps to dataSesudah
    req?: Request;
}

export class AuditService {
    static async log(data: AccessLogData) {
        try {
            const { perusahaanId, userId, action, entity, entityId, module, subModule, details, metadata, dataBefore, dataAfter, req } = data;

            const ipAddress = req ? (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress) : undefined;
            const userAgent = req ? req.headers['user-agent'] : undefined;

            await prisma.jejakAudit.create({
                data: {
                    perusahaanId,
                    penggunaId: userId,
                    aksi: action,
                    modul: module || entity,
                    subModul: subModule,
                    namaTabel: entity,
                    idData: entityId || '',
                    keterangan: details,
                    dataSebelum: dataBefore ? dataBefore : undefined,
                    dataSesudah: dataAfter ? dataAfter : (metadata ? metadata : undefined),
                    perubahan: metadata && !dataAfter ? metadata : undefined,
                    ipAddress,
                    userAgent,
                }
            });
        } catch (error) {
            console.error('[AuditService] Failed to create audit log:', error);
            // Non-blocking: we don't throw here to avoid failing the main transaction if audit fails
        }
    }
}
