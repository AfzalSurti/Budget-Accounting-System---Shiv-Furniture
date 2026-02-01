import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { validateRequest } from "../middlewares/validateRequest.js";

import * as purchaseController from "../controllers/purchaseOrderController.js";
import * as vendorBillController from "../controllers/vendorBillController.js";
import * as salesController from "../controllers/salesOrderController.js";
import * as invoiceController from "../controllers/invoiceController.js";
import * as paymentController from "../controllers/paymentController.js";
import * as transactionController from "../controllers/transactionController.js";

import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  listPurchaseOrderSchema,
  resolvePurchaseOrderCostCenterSchema,
} from "../validators/purchaseOrderValidators.js";
import {
  createVendorBillSchema,
  updateVendorBillSchema,
  listVendorBillSchema,
  convertVendorBillSchema,
} from "../validators/vendorBillValidators.js";
import {
  createSalesOrderSchema,
  updateSalesOrderSchema,
  listSalesOrderSchema,
} from "../validators/salesOrderValidators.js";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  listInvoiceSchema,
  convertInvoiceSchema,
} from "../validators/invoiceValidators.js";
import {
  createPaymentSchema,
  listPaymentSchema,
} from "../validators/paymentValidators.js";

export const transactionRoutes = Router();

transactionRoutes.use(authenticateToken, authorizeRole(["ADMIN"]));

// Purchase Orders
transactionRoutes.post(
  "/purchase-orders",
  validateRequest(createPurchaseOrderSchema),
  asyncHandler(async (req, res) => {
    const po = await purchaseController.createPurchaseOrder(req.body);
    res.status(201).json({ success: true, data: po });
  }),
);

transactionRoutes.get(
  "/purchase-orders",
  validateRequest(listPurchaseOrderSchema),
  asyncHandler(async (req, res) => {
    const view = (req.query.view as string | undefined) ?? "raw";
    const data =
      view === "table"
        ? await purchaseController.listPurchaseOrdersTable(
            req.query.companyId as string,
          )
        : await purchaseController.listPurchaseOrders(
            req.query.companyId as string,
          );
    res.json({ success: true, data });
  }),
);

transactionRoutes.get(
  "/purchase-orders/:id",
  asyncHandler(async (req, res) => {
    const po = await purchaseController.getPurchaseOrder(req.params.id!);
    res.json({ success: true, data: po });
  }),
);

transactionRoutes.get(
  "/po/:id/pdf",
  asyncHandler(async (req, res) => {
    const result = await purchaseController.getPurchaseOrderPdf(req.params.id!);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.buffer);
  }),
);

transactionRoutes.post(
  "/purchase-orders/resolve-cost-center",
  validateRequest(resolvePurchaseOrderCostCenterSchema),
  asyncHandler(async (req, res) => {
    const result = await invoiceController.resolvePurchaseOrderCostCenter(
      req.body,
    );
    res.json({ success: true, data: result });
  }),
);

transactionRoutes.put(
  "/purchase-orders/:id",
  validateRequest(updatePurchaseOrderSchema),
  asyncHandler(async (req, res) => {
    const po = await purchaseController.updatePurchaseOrder(
      req.params.id!,
      req.body,
    );
    res.json({ success: true, data: po });
  }),
);

transactionRoutes.delete(
  "/purchase-orders/:id",
  asyncHandler(async (req, res) => {
    const po = await purchaseController.deletePurchaseOrder(req.params.id!);
    res.json({ success: true, data: po });
  }),
);

// Vendor Bills
transactionRoutes.post(
  "/vendor-bills",
  validateRequest(createVendorBillSchema),
  asyncHandler(async (req, res) => {
    const bill = await vendorBillController.createVendorBill(req.body);
    res.status(201).json({ success: true, data: bill });
  }),
);

transactionRoutes.post(
  "/vendor-bills/from-po/:poId",
  validateRequest(convertVendorBillSchema),
  asyncHandler(async (req, res) => {
    const bill = await vendorBillController.createVendorBillFromPO(
      req.params.poId!,
      req.body.billNo,
      req.body.billDate,
    );
    res.status(201).json({ success: true, data: bill });
  }),
);

transactionRoutes.get(
  "/vendor-bills",
  validateRequest(listVendorBillSchema),
  asyncHandler(async (req, res) => {
    const view = (req.query.view as string | undefined) ?? "raw";
    const data =
      view === "table"
        ? await vendorBillController.listVendorBillsTable(
            req.query.companyId as string,
          )
        : await vendorBillController.listVendorBills(
            req.query.companyId as string,
          );
    res.json({ success: true, data });
  }),
);

transactionRoutes.get(
  "/vendor-bills/:id",
  asyncHandler(async (req, res) => {
    const bill = await vendorBillController.getVendorBill(req.params.id!);
    res.json({ success: true, data: bill });
  }),
);

transactionRoutes.get(
  "/vendor-bills/:id/pdf",
  asyncHandler(async (req, res) => {
    const result = await vendorBillController.getVendorBillPdf(req.params.id!);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.buffer);
  }),
);

transactionRoutes.put(
  "/vendor-bills/:id",
  validateRequest(updateVendorBillSchema),
  asyncHandler(async (req, res) => {
    const bill = await vendorBillController.updateVendorBill(
      req.params.id!,
      req.body,
    );
    res.json({ success: true, data: bill });
  }),
);

// Sales Orders
transactionRoutes.post(
  "/sales-orders",
  validateRequest(createSalesOrderSchema),
  asyncHandler(async (req, res) => {
    const so = await salesController.createSalesOrder(req.body);
    res.status(201).json({ success: true, data: so });
  }),
);

transactionRoutes.get(
  "/sales-orders",
  validateRequest(listSalesOrderSchema),
  asyncHandler(async (req, res) => {
    const view = (req.query.view as string | undefined) ?? "raw";
    const data =
      view === "table"
        ? await salesController.listSalesOrdersTable(
            req.query.companyId as string,
          )
        : await salesController.listSalesOrders(req.query.companyId as string);
    res.json({ success: true, data });
  }),
);

transactionRoutes.get(
  "/sales-orders/:id",
  asyncHandler(async (req, res) => {
    const so = await salesController.getSalesOrder(req.params.id!);
    res.json({ success: true, data: so });
  }),
);

transactionRoutes.get(
  "/so/:id/pdf",
  asyncHandler(async (req, res) => {
    const result = await salesController.getSalesOrderPdf(req.params.id!);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.buffer);
  }),
);

transactionRoutes.put(
  "/sales-orders/:id",
  validateRequest(updateSalesOrderSchema),
  asyncHandler(async (req, res) => {
    const so = await salesController.updateSalesOrder(req.params.id!, req.body);
    res.json({ success: true, data: so });
  }),
);

transactionRoutes.delete(
  "/sales-orders/:id",
  asyncHandler(async (req, res) => {
    const so = await salesController.deleteSalesOrder(req.params.id!);
    res.json({ success: true, data: so });
  }),
);

// Invoices
transactionRoutes.post(
  "/invoices",
  validateRequest(createInvoiceSchema),
  asyncHandler(async (req, res) => {
    const invoice = await invoiceController.createInvoice(req.body);
    res.status(201).json({ success: true, data: invoice });
  }),
);

transactionRoutes.post(
  "/invoices/from-so/:soId",
  validateRequest(convertInvoiceSchema),
  asyncHandler(async (req, res) => {
    const invoice = await invoiceController.createInvoiceFromSO(
      req.params.soId!,
      req.body.invoiceNo,
      req.body.invoiceDate,
    );
    res.status(201).json({ success: true, data: invoice });
  }),
);

transactionRoutes.get(
  "/invoices",
  validateRequest(listInvoiceSchema),
  asyncHandler(async (req, res) => {
    const view = (req.query.view as string | undefined) ?? "raw";
    const data =
      view === "table"
        ? await invoiceController.listInvoicesTable(
            req.query.companyId as string,
          )
        : await invoiceController.listInvoices(req.query.companyId as string);
    res.json({ success: true, data });
  }),
);

transactionRoutes.get(
  "/invoices/:id",
  asyncHandler(async (req, res) => {
    const invoice = await invoiceController.getInvoice(req.params.id!);
    res.json({ success: true, data: invoice });
  }),
);

transactionRoutes.get(
  "/invoices/:id/pdf",
  asyncHandler(async (req, res) => {
    const result = await invoiceController.getInvoicePdf(req.params.id!);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.buffer);
  }),
);

transactionRoutes.put(
  "/invoices/:id",
  validateRequest(updateInvoiceSchema),
  asyncHandler(async (req, res) => {
    const invoice = await invoiceController.updateInvoice(
      req.params.id!,
      req.body,
    );
    res.json({ success: true, data: invoice });
  }),
);

// Payments
transactionRoutes.post(
  "/payments",
  validateRequest(createPaymentSchema),
  asyncHandler(async (req, res) => {
    const payment = await paymentController.createPayment(req.body);
    res.status(201).json({ success: true, data: payment });
  }),
);

transactionRoutes.get(
  "/payments",
  validateRequest(listPaymentSchema),
  asyncHandler(async (req, res) => {
    const view = (req.query.view as string | undefined) ?? "raw";
    const data =
      view === "table"
        ? await paymentController.listPaymentsTable(
            req.query.companyId as string,
          )
        : await paymentController.listPayments(req.query.companyId as string);
    res.json({ success: true, data });
  }),
);

transactionRoutes.get(
  "/payments/:id",
  asyncHandler(async (req, res) => {
    const payment = await paymentController.getPayment(req.params.id!);
    res.json({ success: true, data: payment });
  }),
);

// Transactions (Journal Entries)
transactionRoutes.post(
  "/transactions",
  asyncHandler(async (req, res) => {
    const transaction = await transactionController.createTransaction(
      (req as any).user.id,
      req.body,
    );
    res.status(201).json({ success: true, data: transaction });
  }) as any,
);

transactionRoutes.get(
  "/transactions",
  asyncHandler(async (req, res) => {
    const companyId = req.query.companyId as string;
    const limit = parseInt((req.query.limit as string) || "50", 10);
    const offset = parseInt((req.query.offset as string) || "0", 10);
    const result = await transactionController.getTransactions(
      companyId,
      limit,
      offset,
    );
    res.json({ success: true, data: result });
  }) as any,
);

transactionRoutes.get(
  "/transactions/:id",
  asyncHandler(async (req, res) => {
    const companyId = req.query.companyId as string;
    const transaction = await transactionController.getTransactionById(
      req.params.id!,
      companyId,
    );
    if (!transaction) {
      res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    } else {
      res.json({ success: true, data: transaction });
    }
  }) as any,
);
