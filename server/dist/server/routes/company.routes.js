"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("../controllers/company.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect); // All company routes are protected
router.get('/', company_controller_1.getCompanies);
router.get('/:id', company_controller_1.getCompany);
router.post('/', company_controller_1.createCompany);
router.put('/:id', company_controller_1.updateCompany);
router.delete('/:id', company_controller_1.deleteCompany);
router.post('/:id/settings', company_controller_1.updateSettings);
exports.default = router;
