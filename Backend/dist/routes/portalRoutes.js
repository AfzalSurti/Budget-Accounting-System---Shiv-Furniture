import { Router } from "express";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import * as portalController from "../controllers/portalController.js";
import { portalListSchema, portalPaymentSchema, } from "../validators/portalValidators.js";
import { ApiError } from "../utils/apiError.js";
export const portalRoutes = Router();
portalRoutes.use(authenticateToken, authorizeRole(["PORTAL", "ADMIN"]));
portalRoutes.get("/invoices", validateRequest(portalListSchema), asyncHandler(async (req, res) => {
    if (!req.user?.contactId) {
        throw new ApiError(403, "Portal user not linked to a contact");
    }
    const view = req.query.view ?? "raw";
    const data = view === "table"
        ? await portalController.listPortalInvoicesTable(req.user.contactId)
        : await portalController.listPortalInvoices(req.user.contactId);
    res.json({ success: true, data });
}));
portalRoutes.get("/bills", validateRequest(portalListSchema), asyncHandler(async (req, res) => {
    if (!req.user?.contactId) {
        throw new ApiError(403, "Portal user not linked to a contact");
    }
    const view = req.query.view ?? "raw";
    const data = view === "table"
        ? await portalController.listPortalBillsTable(req.user.contactId)
        : await portalController.listPortalBills(req.user.contactId);
    res.json({ success: true, data });
}));
portalRoutes.get("/sales-orders", validateRequest(portalListSchema), asyncHandler(async (req, res) => {
    if (!req.user?.contactId) {
        throw new ApiError(403, "Portal user not linked to a contact");
    }
    const view = req.query.view ?? "raw";
    const data = view === "table"
        ? await portalController.listPortalSalesOrdersTable(req.user.contactId)
        : await portalController.listPortalSalesOrders(req.user.contactId);
    res.json({ success: true, data });
}));
portalRoutes.get("/purchase-orders", validateRequest(portalListSchema), asyncHandler(async (req, res) => {
    if (!req.user?.contactId) {
        throw new ApiError(403, "Portal user not linked to a contact");
    }
    const view = req.query.view ?? "raw";
    const data = view === "table"
        ? await portalController.listPortalPurchaseOrdersTable(req.user.contactId)
        : await portalController.listPortalPurchaseOrders(req.user.contactId);
    res.json({ success: true, data });
}));
portalRoutes.get("/payments", validateRequest(portalListSchema), asyncHandler(async (req, res) => {
    if (!req.user?.contactId) {
        throw new ApiError(403, "Portal user not linked to a contact");
    }
    const view = req.query.view ?? "raw";
    const data = view === "table"
        ? await portalController.listPortalPaymentsTable(req.user.contactId)
        : await portalController.listPortalPayments(req.user.contactId);
    res.json({ success: true, data });
}));
portalRoutes.get("/invoices/:id/pdf", asyncHandler(async (req, res) => {
    if (!req.user?.contactId) {
        throw new ApiError(403, "Portal user not linked to a contact");
    }
    const data = await portalController.downloadInvoicePdf(req.params.id, req.user.contactId);
    res.json({ success: true, data });
}));
portalRoutes.get("/bills/:id/pdf", asyncHandler(async (req, res) => {
    if (!req.user?.contactId) {
        throw new ApiError(403, "Portal user not linked to a contact");
    }
    const data = await portalController.downloadBillPdf(req.params.id, req.user.contactId);
    res.json({ success: true, data });
}));
portalRoutes.post("/payments", validateRequest(portalPaymentSchema), asyncHandler(async (req, res) => {
    if (!req.user?.contactId) {
        throw new ApiError(403, "Portal user not linked to a contact");
    }
    const payment = await portalController.makePortalPayment({
        companyId: req.body.companyId,
        contactId: req.user.contactId,
        paymentDate: req.body.paymentDate,
        method: req.body.method,
        reference: req.body.reference,
        amount: req.body.amount,
        allocations: req.body.allocations,
    });
    res.status(201).json({ success: true, data: payment });
}));
//# sourceMappingURL=portalRoutes.js.map