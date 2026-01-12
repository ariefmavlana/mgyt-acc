import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import next from 'next';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { doubleCsrf } from 'csrf-csrf';
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import transactionRoutes from './routes/transaction.routes';
import coaRoutes from './routes/coa.routes';
import invoiceRoutes from './routes/invoice.routes';
import paymentRoutes from './routes/payment.routes';
import contactRoutes from './routes/contact.routes';
import productRoutes from './routes/product.routes';
import inventoryRoutes from './routes/inventory.routes';
import reportingRoutes from './routes/reporting.routes';
import onboardingRoutes from './routes/onboarding.routes';
import templateRoutes from './routes/template.routes';
import periodRoutes from './routes/period.routes';
import importRoutes from './routes/import.routes';
import purchaseRoutes from './routes/purchase.routes';
import hrRoutes from './routes/hr.routes';
import documentRoutes from './routes/documents.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { tenantMiddleware } from './middleware/tenant.middleware';
import { auditLog } from './middleware/audit.middleware';
import auditRoutes from './routes/audit.routes';
import { protect } from './middleware/auth.middleware';
import { uploadthingHandler } from './routes/upload.routes';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const PORT = process.env.PORT || 3000;

nextApp.prepare().then(() => {
    const app = express();

    // Middleware
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "img-src": ["'self'", "data:", "https:", "blob:"],
                "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            },
        },
    }));

    // Rate Limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: { message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.' },
        standardHeaders: true,
        legacyHeaders: false,
    });

    const loginLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // limit each IP to 5 login attempts per windowMs
        message: { message: 'Terlalu banyak percobaan login, silakan coba lagi dalam 15 menit.' },
        standardHeaders: true,
        legacyHeaders: false,
    });

    app.use('/api/', limiter);
    app.use('/api/auth/login', loginLimiter);

    app.use(cors({
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        credentials: true
    }));
    app.use(compression());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Fixed mongoSanitize for Express 5 (only sanitize body to avoid getter errors)
    app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.body) {
            mongoSanitize.sanitize(req.body, {});
        }
        next();
    });

    // Modern CSRF Protection with double-csrf
    const {
        generateCsrfToken,
        doubleCsrfProtection,
    } = doubleCsrf({
        getSecret: () => process.env.CSRF_SECRET || "a-very-secret-key-32-chars-long-at-least",
        cookieName: "x-csrf-token",
        cookieOptions: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        },
        size: 64,
        ignoredMethods: ["GET", "HEAD", "OPTIONS"],
        getCsrfTokenFromRequest: (req: Request) => req.headers["x-csrf-token"] as string,
        getSessionIdentifier: (req: Request) => req.cookies.refreshToken || "anonymous",
    });

    // CSRF Token endpoint
    app.get('/api/csrf-token', (req: Request, res: Response) => {
        const token = generateCsrfToken(req, res);
        res.json({ csrfToken: token });
    });

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/uploadthing', uploadthingHandler);

    // Secure all other /api routes with CSRF
    app.use('/api', doubleCsrfProtection);

    // Protected & Tenant isolated routes
    app.use('/api/onboarding', protect, tenantMiddleware, onboardingRoutes);
    app.use('/api/companies', protect, tenantMiddleware, companyRoutes);
    app.use('/api/transactions', protect, tenantMiddleware, transactionRoutes);
    app.use('/api/coa', protect, tenantMiddleware, coaRoutes);
    app.use('/api/invoices', protect, tenantMiddleware, invoiceRoutes);
    app.use('/api/payments', protect, tenantMiddleware, paymentRoutes);
    app.use('/api/contacts', protect, tenantMiddleware, contactRoutes);
    app.use('/api/products', protect, tenantMiddleware, productRoutes);
    app.use('/api/inventory', protect, tenantMiddleware, inventoryRoutes);
    app.use('/api/reports', protect, tenantMiddleware, reportingRoutes);
    app.use('/api/templates', protect, tenantMiddleware, templateRoutes);
    app.use('/api/periods', protect, tenantMiddleware, periodRoutes);
    app.use('/api/import', protect, tenantMiddleware, importRoutes);
    app.use('/api/purchases', protect, tenantMiddleware, purchaseRoutes);
    app.use('/api/hr', protect, tenantMiddleware, hrRoutes);
    app.use('/api/documents', protect, tenantMiddleware, documentRoutes);
    app.use('/api/dashboard', protect, tenantMiddleware, dashboardRoutes);
    app.use('/api/system/audit', protect, tenantMiddleware, auditRoutes);

    // Global Audit Log Middleware (After Auth & Tenant, apply to all modify routes)
    // We can apply it globally or specific routes. Let's apply globally after tenant for simplicity
    app.use('/api', protect, tenantMiddleware, auditLog);

    // Health Check
    app.get('/api/health', (req: Request, res: Response) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    });

    // Next.js Handler (must be last)
    app.use((req: Request, res: Response) => {
        return handle(req, res);
    });

    // Error Handling
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error & { code?: string }, req: Request, res: Response, _next: NextFunction) => {
        // Handle CSRF errors gracefully
        if (err.code === "EBADCSRFTOKEN") {
            if (dev) {
                console.warn(`[CSRF] Invalid token on ${req.method} ${req.url} - (IP: ${req.ip})`);
            }
            return res.status(403).json({ message: "Invalid CSRF token" });
        }

        console.error(err.stack || err);

        res.status(500).json({
            error: 'Internal Server Error',
            message: dev ? err.message : undefined
        });
    });

    app.listen(PORT, () => {
        console.log(`🚀 Unified server running on http://localhost:${PORT}`);
        console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
}).catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
});
