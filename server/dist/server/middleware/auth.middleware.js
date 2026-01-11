"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const protect = async (req, res, next) => {
    const authReq = req;
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }
    if (!token) {
        return res.status(401).json({ message: 'Anda belum login, harap login untuk mengakses.' });
    }
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
    }
    const currentUser = await prisma_1.default.pengguna.findUnique({
        where: { id: decoded.id },
        include: { perusahaan: true }
    });
    if (!currentUser) {
        return res.status(401).json({ message: 'Pengguna yang terkait dengan token ini sudah tidak ada.' });
    }
    if (!currentUser.isAktif) {
        return res.status(401).json({ message: 'Akun Anda sedang tidak aktif. Silakan hubungi admin.' });
    }
    authReq.user = currentUser;
    next();
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user || !roles.includes(authReq.user.role)) {
            return res.status(403).json({ message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' });
        }
        next();
    };
};
exports.restrictTo = restrictTo;
