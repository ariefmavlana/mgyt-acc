import jwt from 'jsonwebtoken';

import prisma from '../../lib/prisma';

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'secret-access';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'secret-refresh';

export const signAccessToken = (payload: object) => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const signRefreshToken = async (payload: { id: string }, userAgent?: string, ipAddress?: string) => {
    const token = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    // Store in DB
    await prisma.refreshToken.create({
        data: {
            token,
            userId: payload.id,
            userAgent,
            ipAddress,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });

    return token;
};

export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch {
        return null;
    }
};

export const verifyRefreshToken = async (token: string) => {
    try {
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as { id: string };

        // Check in DB
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token }
        });

        if (!storedToken || storedToken.isRevoked) {
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
};

export const revokeRefreshToken = async (token: string) => {
    await prisma.refreshToken.update({
        where: { token },
        data: { isRevoked: true }
    });
};

export const revokeAllUserTokens = async (userId: string) => {
    await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true }
    });
};
