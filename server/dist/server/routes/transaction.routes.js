"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const company_middleware_1 = require("../middleware/company.middleware");
const router = (0, express_1.Router)();
// Apply auth to all routes
router.use(auth_middleware_1.protect);
router.get('/', company_middleware_1.checkCompanyContext, transaction_controller_1.getTransactions);
router.post('/', company_middleware_1.checkCompanyContext, transaction_controller_1.createTransaction);
router.get('/accounts', company_middleware_1.checkCompanyContext, transaction_controller_1.getAccounts);
router.delete('/:id/void', company_middleware_1.checkCompanyContext, transaction_controller_1.voidTransaction);
exports.default = router;
