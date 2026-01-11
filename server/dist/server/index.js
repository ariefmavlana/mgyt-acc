"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const next_1 = __importDefault(require("next"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const company_routes_1 = __importDefault(require("./routes/company.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const coa_routes_1 = __importDefault(require("./routes/coa.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const reporting_routes_1 = __importDefault(require("./routes/reporting.routes"));
const dev = process.env.NODE_ENV !== 'production';
const nextApp = (0, next_1.default)({ dev });
const handle = nextApp.getRequestHandler();
const PORT = process.env.PORT || 3000;
nextApp.prepare().then(() => {
    const app = (0, express_1.default)();
    // Middleware
    // Content Security Policy can be tricky with Next.js in a custom server, 
    // disabling for development to avoid issues.
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
    }));
    app.use((0, cors_1.default)({
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        credentials: true
    }));
    app.use((0, compression_1.default)());
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    // API Routes
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/companies', company_routes_1.default);
    app.use('/api/transactions', transaction_routes_1.default);
    app.use('/api/coa', coa_routes_1.default);
    app.use('/api/invoices', invoice_routes_1.default);
    app.use('/api/payments', payment_routes_1.default);
    app.use('/api/contacts', contact_routes_1.default);
    app.use('/api/products', product_routes_1.default);
    app.use('/api/inventory', inventory_routes_1.default);
    app.use('/api/reports', reporting_routes_1.default);
    // Health Check
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    });
    // Next.js Handler (must be last)
    app.use((req, res) => {
        return handle(req, res);
    });
    // Error Handling
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err, req, res, _next) => {
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
