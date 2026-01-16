import { Request, Response } from 'express';
import { registerSchema, loginSchema, changePasswordSchema, updateProfileSchema } from '../validators/auth.validator';
import { ZodError } from 'zod';
import prisma from '../../lib/prisma';
import { UserRole, TierPaket } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken, revokeRefreshToken, revokeAllUserTokens } from '../utils/jwt';
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
                        tahunBuku: validatedData.tahunBuku,
                        bulanMulaiFiskal: validatedData.bulanMulaiFiskal,
                    }
                });
                perusahaanId = perusahaan.id;

                // Handle Package (Paket Usaha)
                const paketTier = validatedData.paket || 'UMKM';

                // Try to find existing package or create default if missing (Auto-seeding logic)
                let paketFitur = await tx.paketFitur.findFirst({
                    where: { tier: paketTier as TierPaket }
                });

                if (!paketFitur) {
                    paketFitur = await tx.paketFitur.create({
                        data: {
                            kode: `PKG-${paketTier}`,
                            nama: `Paket ${paketTier}`,
                            tier: paketTier as TierPaket,
                            isAktif: true,
                            isPublik: true
                        }
                    });
                }

                // Create PerusahaanPaket
                await tx.perusahaanPaket.create({
                    data: {
                        perusahaanId: perusahaan.id,
                        paketId: paketFitur.id,
                        tanggalMulai: new Date(),
                        // Default trial 14 days or active immediately
                        tanggalAkhir: new Date(new Date().setDate(new Date().getDate() + 30)),
                        isAktif: true,
                        isTrial: true
                    }
                });

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
                }
            });

            const access = await tx.aksesPengguna.create({
                data: {
                    penggunaId: newUser.id,
                    perusahaanId: perusahaanId,
                    roleEnum: (validatedData.role as UserRole) || 'ADMIN',
                    isDefault: true,
                    isAktif: true
                },
                include: { perusahaan: true }
            });

            return { ...newUser, activeAkses: access };
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = result;

        // Store initial password in history
        await prisma.passwordHistory.create({
            data: {
                userId: result.id,
                password: hashedPassword
            }
        });

        // Audit Log
        await prisma.jejakAudit.create({
            data: {
                perusahaanId: result.activeAkses.perusahaanId,
                penggunaId: result.id,
                aksi: 'REGISTER',
                modul: 'AUTH',
                namaTabel: 'Pengguna',
                idData: result.id,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                keterangan: 'Pendaftaran akun baru'
            }
        });

        res.status(201).json({
            message: 'Pendaftaran berhasil. Silakan login dengan akun Anda.',
            user: userWithoutPassword
        });
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const message = error.issues[0]?.message || 'Kesalahan validasi data';
            return res.status(400).json({ message, errors: error.issues });
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
            include: {
                aksesPerusahaan: {
                    where: { isAktif: true },
                    include: { perusahaan: true }
                }
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // Check if account is locked
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
            return res.status(403).json({
                message: `Akun terkunci karena terlalu banyak percobaan gagal. Silakan coba lagi dalam ${minutesLeft} menit.`
            });
        }

        if (!(await comparePassword(validatedData.password, user.password))) {
            const failedAttempts = user.failedLoginAttempts + 1;
            const lockoutUntil = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

            await prisma.pengguna.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: failedAttempts,
                    lockoutUntil
                }
            });

            // Log failed attempt
            const defaultCompanyId = user.aksesPerusahaan?.[0]?.perusahaanId || 'system';
            await prisma.jejakAudit.create({
                data: {
                    perusahaanId: defaultCompanyId,
                    penggunaId: user.id,
                    aksi: 'LOGIN_FAILED',
                    modul: 'AUTH',
                    namaTabel: 'Pengguna',
                    idData: user.id,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    keterangan: `Gagal login (Percobaan ke-${failedAttempts})`
                }
            });

            return res.status(401).json({ message: 'Email atau password salah' });
        }

        if (!user.isAktif) {
            return res.status(401).json({ message: 'Akun Anda tidak aktif' });
        }

        // Reset failed attempts on success
        await prisma.pengguna.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lockoutUntil: null,
                lastLogin: new Date()
            }
        });

        const accessToken = signAccessToken({ id: user.id });
        const refreshToken = await signRefreshToken(
            { id: user.id },
            req.headers['user-agent'],
            req.ip || req.socket.remoteAddress
        );

        res.cookie('accessToken', accessToken, accessTokenOptions);
        res.cookie('refreshToken', refreshToken, cookieOptions);

        // Log success
        const activeAkses = user.aksesPerusahaan.find(a => a.isDefault) || user.aksesPerusahaan[0];

        await prisma.jejakAudit.create({
            data: {
                perusahaanId: activeAkses?.perusahaanId || 'system',
                penggunaId: user.id,
                aksi: 'LOGIN_SUCCESS',
                modul: 'AUTH',
                namaTabel: 'Pengguna',
                idData: user.id,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: 'Login berhasil',
            user: {
                ...userWithoutPassword,
                companies: user.aksesPerusahaan.map(a => ({
                    id: a.perusahaanId,
                    nama: a.perusahaan.nama,
                    role: a.roleEnum,
                    isDefault: a.isDefault
                }))
            },
            currentCompanyId: activeAkses?.perusahaanId,
            accessToken
        });
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const message = error.issues[0]?.message || 'Email atau password wajib diisi';
            return res.status(400).json({ message });
        }
        res.status(500).json({ message: 'Error server saat login' });
    }
};

export const logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await revokeRefreshToken(refreshToken);
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout berhasil' });
};

export const getMe = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;

    // Fetch full user with company list
    const user = await prisma.pengguna.findUnique({
        where: { id: authReq.user.id },
        include: {
            aksesPerusahaan: {
                where: { isAktif: true },
                include: { perusahaan: true }
            }
        }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    res.json({
        user: {
            ...userWithoutPassword,
            companies: user.aksesPerusahaan.map(a => ({
                id: a.perusahaanId,
                nama: a.perusahaan.nama,
                role: a.roleEnum,
                isDefault: a.isDefault
            }))
        },
        activeCompanyId: authReq.currentCompanyId
    });
};

export const switchCompany = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const { companyId } = req.body;

        if (!companyId) return res.status(400).json({ message: 'Company ID is required' });

        // Validate access
        const access = await prisma.aksesPengguna.findUnique({
            where: {
                penggunaId_perusahaanId: {
                    penggunaId: authReq.user.id,
                    perusahaanId: companyId
                }
            },
            include: { perusahaan: true }
        });

        if (!access || !access.isAktif) {
            return res.status(403).json({ message: 'You do not have access to this company' });
        }

        // Return a bit of info (Frontend can catch this to reload or update state)
        res.json({
            message: `Switched to ${access.perusahaan.nama}`,
            companyId: access.perusahaanId,
            role: access.roleEnum
        });

    } catch (error: unknown) {
        console.error('Switch Company Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const refresh = async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
        return res.status(401).json({ message: 'Harap login kembali' });
    }

    try {
        const decoded = await verifyRefreshToken(oldRefreshToken) as { id: string } | null;
        if (!decoded) {
            // Potential theft or reuse: revoke all if token exists but is invalid/revoked
            const stored = await prisma.refreshToken.findUnique({ where: { token: oldRefreshToken } });
            if (stored) {
                await revokeAllUserTokens(stored.userId);
            }
            return res.status(401).json({ message: 'Sessi telah berakhir atau tidak valid, silakan login ulang' });
        }

        const user = await prisma.pengguna.findUnique({ where: { id: decoded.id } });
        if (!user || !user.isAktif) {
            return res.status(401).json({ message: 'Pengguna tidak ditemukan atau tidak aktif' });
        }

        // Token Rotation: Revoke old, issue new
        await revokeRefreshToken(oldRefreshToken);

        const newAccessToken = signAccessToken({ id: user.id });
        const newRefreshToken = await signRefreshToken(
            { id: user.id },
            req.headers['user-agent'],
            req.ip || req.socket.remoteAddress
        );

        res.cookie('accessToken', newAccessToken, accessTokenOptions);
        res.cookie('refreshToken', newRefreshToken, cookieOptions);

        res.json({ accessToken: newAccessToken });
    } catch {
        return res.status(401).json({ message: 'Refresh token tidak valid' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const user = authReq.user;
        const validatedData = changePasswordSchema.parse(req.body);

        // Verify current password
        if (!(await comparePassword(validatedData.currentPassword, user.password))) {
            return res.status(400).json({ message: 'Password saat ini salah' });
        }

        const newHashedPassword = await hashPassword(validatedData.newPassword);

        // Check password history (last 5)
        const history = await prisma.passwordHistory.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        for (const log of history) {
            if (await comparePassword(validatedData.newPassword, log.password)) {
                return res.status(400).json({ message: 'Password baru tidak boleh sama dengan 5 password terakhir Anda' });
            }
        }

        // Update password and record in history
        await prisma.$transaction([
            prisma.pengguna.update({
                where: { id: user.id },
                data: {
                    password: newHashedPassword,
                    passwordChangedAt: new Date()
                }
            }),
            prisma.passwordHistory.create({
                data: {
                    userId: user.id,
                    password: newHashedPassword
                }
            }),
            prisma.jejakAudit.create({
                data: {
                    perusahaanId: authReq.currentCompanyId || 'system',
                    penggunaId: user.id,
                    aksi: 'CHANGE_PASSWORD',
                    modul: 'AUTH',
                    namaTabel: 'Pengguna',
                    idData: user.id,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    keterangan: 'Perubahan password berhasil'
                }
            })
        ]);

        res.json({ message: 'Password berhasil diubah' });
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const message = error.issues[0]?.message || 'Kesalahan validasi data';
            return res.status(400).json({ message });
        }
        res.status(500).json({ message: 'Error server saat mengubah password' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const user = authReq.user;
        const validatedData = updateProfileSchema.parse(req.body);

        const updatedUser = await prisma.pengguna.update({
            where: { id: user.id },
            data: {
                ...validatedData
            },
            include: {
                aksesPerusahaan: {
                    where: { isAktif: true },
                    include: { perusahaan: true }
                }
            }
        });

        // Audit Log
        await prisma.jejakAudit.create({
            data: {
                perusahaanId: authReq.currentCompanyId || 'system',
                penggunaId: user.id,
                aksi: 'UPDATE_PROFILE',
                modul: 'AUTH',
                namaTabel: 'Pengguna',
                idData: user.id,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                keterangan: 'Update profil pengguna'
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = updatedUser;

        res.json({
            message: 'Profil berhasil diperbarui',
            user: {
                ...userWithoutPassword,
                companies: updatedUser.aksesPerusahaan.map(a => ({
                    id: a.perusahaanId,
                    nama: a.perusahaan.nama,
                    role: a.roleEnum,
                    isDefault: a.isDefault
                }))
            }
        });

    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const message = error.issues[0]?.message || 'Kesalahan validasi data';
            return res.status(400).json({ message });
        }
        res.status(500).json({ message: 'Error server saat update profil' });
    }
};
