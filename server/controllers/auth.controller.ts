import { Request, Response } from 'express';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import prisma from '../../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { Role } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for refresh token
};

const accessTokenOptions = {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // 15 minutes
};

export const register = async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const existingUser = await prisma.pengguna.findFirst({
            where: {
                OR: [
                    { email: validatedData.email },
                    { username: validatedData.username }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email atau username sudah terdaftar' });
        }

        const hashedPassword = await hashPassword(validatedData.password);

        // Create Company and User in a transaction
        const result = await prisma.$transaction(async (tx) => {
            let perusahaanId: string;

            if (validatedData.namaPerusahaan) {
                const perusahaan = await tx.perusahaan.create({
                    data: {
                        nama: validatedData.namaPerusahaan,
                        kode: validatedData.namaPerusahaan.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000),
                    }
                });
                perusahaanId = perusahaan.id;
            } else {
                // Find existing or create a default "Personal" company
                const defaultCo = await tx.perusahaan.findFirst({ where: { kode: 'DEF-ACC' } });
                if (defaultCo) {
                    perusahaanId = defaultCo.id;
                } else {
                    const newCo = await tx.perusahaan.create({
                        data: { nama: 'Default Company', kode: 'DEF-ACC' }
                    });
                    perusahaanId = newCo.id;
                }
            }

            const newUser = await tx.pengguna.create({
                data: {
                    namaLengkap: validatedData.namaLengkap,
                    username: validatedData.username,
                    email: validatedData.email,
                    password: hashedPassword,
                    role: validatedData.role as Role,
                    perusahaanId,
                },
                include: { perusahaan: true }
            });

            return newUser;
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = result;
        res.status(201).json({
            message: 'Pendaftaran berhasil. Silakan login dengan akun Anda.',
            user: userWithoutPassword
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'ZodError') {
            const zodError = error as unknown as { errors: Array<{ message: string }> };
            return res.status(400).json({ message: zodError.errors[0].message, errors: zodError.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Error server saat pendaftaran' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const user = await prisma.pengguna.findUnique({
            where: { email: validatedData.email },
            include: { perusahaan: true }
        });

        if (!user || !(await comparePassword(validatedData.password, user.password))) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        if (!user.isAktif) {
            return res.status(401).json({ message: 'Akun Anda tidak aktif' });
        }

        const accessToken = signAccessToken({ id: user.id });
        const refreshToken = signRefreshToken({ id: user.id });

        res.cookie('accessToken', accessToken, accessTokenOptions);
        res.cookie('refreshToken', refreshToken, cookieOptions);

        await prisma.pengguna.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: 'Login berhasil',
            user: userWithoutPassword,
            accessToken
        });
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'ZodError') {
            const zodError = error as unknown as { errors: Array<{ message: string }> };
            return res.status(400).json({ message: zodError.errors[0].message });
        }
        res.status(500).json({ message: 'Error server saat login' });
    }
};

export const logout = (_req: Request, res: Response) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout berhasil' });
};

export const getMe = (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = authReq.user;
    res.json({ user: userWithoutPassword });
};

export const refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Harap login kembali' });
    }

    try {
        const decoded = verifyRefreshToken(refreshToken) as { id: string } | null;
        if (!decoded) {
            return res.status(401).json({ message: 'Sessi telah berakhir, silakan login ulang' });
        }

        const user = await prisma.pengguna.findUnique({ where: { id: decoded.id } });
        if (!user || !user.isAktif) {
            return res.status(401).json({ message: 'Pengguna tidak ditemukan atau tidak aktif' });
        }

        const newAccessToken = signAccessToken({ id: user.id });
        res.cookie('accessToken', newAccessToken, accessTokenOptions);

        res.json({ accessToken: newAccessToken });
    } catch {
        return res.status(401).json({ message: 'Refresh token tidak valid' });
    }
};
