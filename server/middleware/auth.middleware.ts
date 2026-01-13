import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../../lib/prisma';
import { Pengguna, AksesPengguna, Role, UserRole } from '@prisma/client';

export type AksesWithRole = AksesPengguna & {
    roleRef?: any;
};

export interface AuthRequest extends Request {
    user: any;
    akses?: AksesWithRole;
    currentCompanyId?: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        return res.status(401).json({ message: 'Anda belum login, harap login untuk mengakses.' });
    }

    const decoded = verifyAccessToken(token) as { id: string } | null;
    if (!decoded) {
        return res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
    }

    const currentUser = await prisma.pengguna.findUnique({
        where: { id: decoded.id },
        include: {
            aksesPerusahaan: {
                where: { isAktif: true },
                take: 1,
                include: {
                    roleRef: true
                }
            }
        }
    });

    if (!currentUser) {
        return res.status(401).json({ message: 'Pengguna yang terkait dengan token ini sudah tidak ada.' });
    }

    if (!currentUser.isAktif) {
        return res.status(401).json({ message: 'Akun Anda sedang tidak aktif. Silakan hubungi admin.' });
    }

    authReq.user = currentUser;
    // Default to the first active company access if available
    const aksesList = currentUser.aksesPerusahaan as AksesWithRole[];

    if (aksesList?.[0]) {
        authReq.akses = aksesList[0];
        authReq.currentCompanyId = aksesList[0].perusahaanId;
    }

    next();
};

export const restrictTo = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthRequest;
        // Check role from currently active company context
        if (!authReq.akses || !roles.includes(authReq.akses.roleEnum)) {
            return res.status(403).json({ message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' });
        }
        next();
    };
};
