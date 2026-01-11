"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const auth_validator_1 = require("../validators/auth.validator");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for refresh token
};
const accessTokenOptions = Object.assign(Object.assign({}, cookieOptions), { maxAge: 15 * 60 * 1000 // 15 minutes
 });
const register = async (req, res) => {
    try {
        const validatedData = auth_validator_1.registerSchema.parse(req.body);
        const existingUser = await prisma_1.default.pengguna.findFirst({
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
        const hashedPassword = await (0, password_1.hashPassword)(validatedData.password);
        // Create Company and User in a transaction
        const result = await prisma_1.default.$transaction(async (tx) => {
            let perusahaanId;
            if (validatedData.namaPerusahaan) {
                const perusahaan = await tx.perusahaan.create({
                    data: {
                        nama: validatedData.namaPerusahaan,
                        kode: validatedData.namaPerusahaan.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000),
                    }
                });
                perusahaanId = perusahaan.id;
            }
            else {
                // Find existing or create a default "Personal" company
                const defaultCo = await tx.perusahaan.findFirst({ where: { kode: 'DEF-ACC' } });
                if (defaultCo) {
                    perusahaanId = defaultCo.id;
                }
                else {
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
                    role: validatedData.role,
                    perusahaanId,
                },
                include: { perusahaan: true }
            });
            return newUser;
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _ } = result, userWithoutPassword = __rest(result, ["password"]);
        res.status(201).json({
            message: 'Pendaftaran berhasil. Silakan login dengan akun Anda.',
            user: userWithoutPassword
        });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            const zodError = error;
            return res.status(400).json({ message: zodError.errors[0].message, errors: zodError.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Error server saat pendaftaran' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const validatedData = auth_validator_1.loginSchema.parse(req.body);
        const user = await prisma_1.default.pengguna.findUnique({
            where: { email: validatedData.email },
            include: { perusahaan: true }
        });
        if (!user || !(await (0, password_1.comparePassword)(validatedData.password, user.password))) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }
        if (!user.isAktif) {
            return res.status(401).json({ message: 'Akun Anda tidak aktif' });
        }
        const accessToken = (0, jwt_1.signAccessToken)({ id: user.id });
        const refreshToken = (0, jwt_1.signRefreshToken)({ id: user.id });
        res.cookie('accessToken', accessToken, accessTokenOptions);
        res.cookie('refreshToken', refreshToken, cookieOptions);
        await prisma_1.default.pengguna.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json({
            message: 'Login berhasil',
            user: userWithoutPassword,
            accessToken
        });
    }
    catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            const zodError = error;
            return res.status(400).json({ message: zodError.errors[0].message });
        }
        res.status(500).json({ message: 'Error server saat login' });
    }
};
exports.login = login;
const logout = (_req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout berhasil' });
};
exports.logout = logout;
const getMe = (req, res) => {
    const authReq = req;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _a = authReq.user, { password: _ } = _a, userWithoutPassword = __rest(_a, ["password"]);
    res.json({ user: userWithoutPassword });
};
exports.getMe = getMe;
const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Harap login kembali' });
    }
    try {
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        if (!decoded) {
            return res.status(401).json({ message: 'Sessi telah berakhir, silakan login ulang' });
        }
        const user = await prisma_1.default.pengguna.findUnique({ where: { id: decoded.id } });
        if (!user || !user.isAktif) {
            return res.status(401).json({ message: 'Pengguna tidak ditemukan atau tidak aktif' });
        }
        const newAccessToken = (0, jwt_1.signAccessToken)({ id: user.id });
        res.cookie('accessToken', newAccessToken, accessTokenOptions);
        res.json({ accessToken: newAccessToken });
    }
    catch (_a) {
        return res.status(401).json({ message: 'Refresh token tidak valid' });
    }
};
exports.refresh = refresh;
