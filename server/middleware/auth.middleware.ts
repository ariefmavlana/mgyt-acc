import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../../lib/prisma';
import { Role } from '@prisma/client';

import { Pengguna, Perusahaan } from '@prisma/client';

export interface AuthRequest extends Request {
    user: Pengguna & { perusahaan: Perusahaan };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
        include: { perusahaan: true }
    });

    if (!currentUser) {
        return res.status(401).json({ message: 'Pengguna yang terkait dengan token ini sudah tidak ada.' });
    }

    if (!currentUser.isAktif) {
        return res.status(401).json({ message: 'Akun Anda sedang tidak aktif. Silakan hubungi admin.' });
    }

    req.user = currentUser;
    next();
};

export const restrictTo = (...roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' });
        }
        next();
    };
};
