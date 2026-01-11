"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const company_middleware_1 = require("../middleware/company.middleware");
const invoice_controller_1 = require("../controllers/invoice.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.use(company_middleware_1.checkCompanyContext);
router.get('/aging-schedule', invoice_controller_1.getAgingSchedule); // Specific route first
router.post('/', invoice_controller_1.createInvoice);
router.get('/', invoice_controller_1.getInvoices);
router.get('/:id', invoice_controller_1.getInvoiceDetail);
router.get('/:id/print', invoice_controller_1.generateInvoicePDF);
router.get('/:id/aging', invoice_controller_1.getInvoiceAging);
exports.default = router;
