import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import next from 'next';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import transactionRoutes from './routes/transaction.routes';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const PORT = process.env.PORT || 3000;

nextApp.prepare().then(() => {
    const app = express();

    // Middleware
    // Content Security Policy can be tricky with Next.js in a custom server, 
    // disabling for development to avoid issues.
    app.use(helmet({
        contentSecurityPolicy: false,
    }));

    app.use(cors({
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        credentials: true
    }));
    app.use(compression());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/companies', companyRoutes);
    app.use('/api/transactions', transactionRoutes);

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
    app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
        console.error(err.stack);
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
